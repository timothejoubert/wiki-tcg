import { BaseMail } from '@adonisjs/mail'

export default class EmailChangedNoticeMail extends BaseMail {
  subject = 'Ton adresse email a changé'

  constructor(
    protected username: string,
    protected oldEmail: string,
    protected newEmail: string
  ) {
    super()
  }

  prepare() {
    this.message
      .to(this.oldEmail)
      .htmlView('emails/email_changed_notice', { username: this.username, newEmail: this.newEmail })
      .text(
        `Bonjour ${this.username},\n\nL'adresse de ton compte est désormais ${this.newEmail}. Si ce n'est pas toi, réinitialise ton mot de passe.\n`
      )
  }
}
