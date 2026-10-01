import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'

export default class EmailChangeMail extends BaseMail {
  subject = 'Confirme ta nouvelle adresse'

  constructor(
    protected user: User,
    protected newEmail: string,
    protected url: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.newEmail)
      .htmlView('emails/email_change', { username: this.user.username, url: this.url })
      .text(
        `Bonjour ${this.user.username},\n\nConfirme ta nouvelle adresse (lien valable 24 heures) :\n${this.url}\n`
      )
  }
}
