import { BaseMail } from '@adonisjs/mail'
import type User from '#models/user'

export default class NotificationMail extends BaseMail {
  constructor(
    protected user: User,
    protected text: string,
    protected url: string
  ) {
    super()
    this.subject = text.length > 70 ? `${text.slice(0, 67)}…` : text
  }

  prepare() {
    this.message
      .to(this.user.email)
      .htmlView('emails/notification', {
        username: this.user.username,
        text: this.text,
        url: this.url,
      })
      .text(
        `Bonjour ${this.user.username},\n\n${this.text}\n\n${this.url}\n\nCes emails se désactivent dans tes réglages.`
      )
  }
}
