import AccountService, {
  DeletionBlockedError,
  EmailTakenError,
  InvalidTokenError,
  WrongPasswordError,
} from '#services/account_service'
import {
  changeEmailValidator,
  changePasswordValidator,
  deleteAccountValidator,
} from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AccountController {
  constructor(protected account: AccountService) {}

  async edit({ inertia, auth }: HttpContext) {
    return inertia.render('settings/account', { email: auth.getUserOrFail().email })
  }

  async updatePassword({ auth, request, response, session }: HttpContext) {
    const { currentPassword, password } = await request.validateUsing(changePasswordValidator)
    try {
      await this.account.changePassword(auth.getUserOrFail(), currentPassword, password)
      session.flash('success', 'Mot de passe modifié.')
    } catch (error) {
      if (!(error instanceof WrongPasswordError)) throw error
      session.flashErrors({ currentPassword: error.message })
    }
    return response.redirect().toRoute('settings.account')
  }

  async updateEmail({ auth, request, response, session }: HttpContext) {
    const { currentPassword, email } = await request.validateUsing(changeEmailValidator)
    try {
      await this.account.requestEmailChange(auth.getUserOrFail(), currentPassword, email)
      session.flash('success', `Un lien de confirmation a été envoyé à ${email}.`)
    } catch (error) {
      if (error instanceof WrongPasswordError) {
        session.flashErrors({ currentPassword: error.message })
      } else if (error instanceof EmailTakenError) {
        session.flashErrors({ email: error.message })
      } else {
        throw error
      }
    }
    return response.redirect().toRoute('settings.account')
  }

  async confirmEmail({ params, response, session, auth }: HttpContext) {
    try {
      await this.account.confirmEmailChange(params.token)
      session.flash('success', 'Adresse email mise à jour.')
    } catch (error) {
      if (!(error instanceof InvalidTokenError || error instanceof EmailTakenError)) throw error
      session.flash('error', error.message)
    }
    return (await auth.check())
      ? response.redirect().toRoute('settings.account')
      : response.redirect().toRoute('session.create')
  }

  async destroy({ auth, request, response, session }: HttpContext) {
    const { currentPassword } = await request.validateUsing(deleteAccountValidator)
    try {
      await this.account.deleteAccount(auth.getUserOrFail(), currentPassword)
    } catch (error) {
      if (error instanceof WrongPasswordError) {
        session.flashErrors({ currentPassword: error.message })
      } else if (error instanceof DeletionBlockedError) {
        session.flash('error', error.message)
      } else {
        throw error
      }
      return response.redirect().toRoute('settings.account')
    }

    await auth.use('web').logout()
    session.flash('success', 'Ton compte et tes données ont été supprimés.')
    return response.redirect().toRoute('home')
  }
}
