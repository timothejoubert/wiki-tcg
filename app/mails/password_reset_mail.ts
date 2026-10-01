import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'

export default class PasswordResetMail extends BaseMail {
  subject = 'Choisir un nouveau mot de passe'

  constructor(
    protected user: User,
    protected url: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.user.email)
      .htmlView('emails/password_reset', { username: this.user.username, url: this.url })
      .text(
        `Bonjour ${this.user.username},\n\nNouveau mot de passe (lien valable une heure) :\n${this.url}\n`
      )
  }
}
