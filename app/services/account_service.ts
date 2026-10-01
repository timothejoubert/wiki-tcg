import { DateTime } from 'luxon'
import { createHash, randomBytes } from 'node:crypto'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash'
import { Exception } from '@adonisjs/core/exceptions'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Auction from '#models/auction'
import User from '#models/user'
import UserToken from '#models/user_token'
import EmailChangeMail from '#mails/email_change_mail'
import EmailChangedNoticeMail from '#mails/email_changed_notice_mail'
import PasswordResetMail from '#mails/password_reset_mail'

export class InvalidTokenError extends Exception {
  static status = 422
  static code = 'E_INVALID_TOKEN'
  static message = 'Ce lien n’est plus valable. Fais une nouvelle demande.'
}

export class WrongPasswordError extends Exception {
  static status = 422
  static code = 'E_WRONG_PASSWORD'
  static message = 'Mot de passe actuel incorrect.'
}

export class EmailTakenError extends Exception {
  static status = 422
  static code = 'E_EMAIL_TAKEN'
  static message = 'Cette adresse est déjà utilisée par un autre compte.'
}

export class DeletionBlockedError extends Exception {
  static status = 422
  static code = 'E_DELETION_BLOCKED'
  static message =
    'Tu as une vente aux enchères ou une mise en cours : attends leur clôture avant de supprimer ton compte.'
}

const LIFETIME = { password_reset: { hours: 1 }, email_change: { hours: 24 } } as const

const digest = (token: string) => createHash('sha256').update(token).digest('hex')

/**
 * Account lifecycle: password reset, password and email changes, deletion.
 */
export default class AccountService {
  /**
   * Silently does nothing for unknown emails, so the form cannot be used
   * to find out who has an account.
   */
  async requestPasswordReset(email: string) {
    const user = await User.findBy('email', email.trim().toLowerCase())
    if (!user) {
      return
    }
    const token = await this.issue(user, 'password_reset')
    await mail.send(new PasswordResetMail(user, `${env.get('APP_URL')}/reinitialiser/${token}`))
  }

  async findResetToken(token: string) {
    return this.find(token, 'password_reset')
  }

  async resetPassword(token: string, password: string) {
    await db.transaction(async (trx) => {
      const record = await this.find(token, 'password_reset', trx)
      if (!record) {
        throw new InvalidTokenError()
      }
      const user = await User.findOrFail(record.userId, { client: trx })
      user.password = password
      await user.save()
      await UserToken.query({ client: trx })
        .where({ userId: user.id, type: 'password_reset' })
        .whereNull('used_at')
        .update({ usedAt: DateTime.now().toSQL() })
    })
  }

  async changePassword(user: User, current: string, password: string) {
    await this.checkPassword(user, current)
    user.password = password
    await user.save()
  }

  async requestEmailChange(user: User, current: string, newEmail: string) {
    await this.checkPassword(user, current)
    const email = newEmail.trim().toLowerCase()
    if (await User.query().where('email', email).whereNot('id', user.id).first()) {
      throw new EmailTakenError()
    }
    const token = await this.issue(user, 'email_change', email)
    await mail.send(
      new EmailChangeMail(user, email, `${env.get('APP_URL')}/confirmer-email/${token}`)
    )
  }

  async confirmEmailChange(token: string) {
    const { user, oldEmail } = await db.transaction(async (trx) => {
      const record = await this.find(token, 'email_change', trx)
      if (!record || !record.email) {
        throw new InvalidTokenError()
      }
      const taken = await User.query({ client: trx })
        .where('email', record.email)
        .whereNot('id', record.userId)
        .first()
      if (taken) {
        throw new EmailTakenError()
      }

      const owner = await User.findOrFail(record.userId, { client: trx })
      const previous = owner.email
      owner.email = record.email
      await owner.save()
      record.usedAt = DateTime.now()
      await record.save()
      return { user: owner, oldEmail: previous }
    })

    await mail.send(new EmailChangedNoticeMail(user.username, oldEmail, user.email))
    return user
  }

  /**
   * Refused while the player sells in or leads an open auction, so nobody
   * loses held wikis or a card in flight. Everything else cascades.
   */
  async deleteAccount(user: User, current: string) {
    await this.checkPassword(user, current)
    const involved = await Auction.query()
      .where('status', 'open')
      .where((q) => q.where('seller_id', user.id).orWhere('leader_id', user.id))
      .first()
    if (involved) {
      throw new DeletionBlockedError()
    }
    await user.delete()
  }

  protected async checkPassword(user: User, current: string) {
    if (!(await hash.verify(user.password, current))) {
      throw new WrongPasswordError()
    }
  }

  /**
   * Issues a fresh token, invalidating the previous ones of the same type.
   */
  protected async issue(user: User, type: UserToken['type'], email: string | null = null) {
    const token = randomBytes(32).toString('base64url')
    await UserToken.query()
      .where({ userId: user.id, type })
      .whereNull('used_at')
      .update({ usedAt: DateTime.now().toSQL() })
    await UserToken.create({
      userId: user.id,
      type,
      tokenHash: digest(token),
      email,
      expiresAt: DateTime.now().plus(LIFETIME[type]),
      usedAt: null,
    })
    return token
  }

  protected find(token: string, type: UserToken['type'], trx?: TransactionClientContract) {
    return UserToken.query({ client: trx })
      .where({ tokenHash: digest(token), type })
      .whereNull('used_at')
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .if(trx, (query) => query.forUpdate())
      .first()
  }
}
