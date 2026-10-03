import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Notification from '#models/notification'
import User from '#models/user'
import NotificationMail from '#mails/notification_mail'
import type { NotificationType } from '#config/game'

type Data = Record<string, string | number | null>

const wikis = (amount: unknown) => `${amount} ${Number(amount) > 1 ? 'wikis' : 'wiki'}`

/**
 * Text and link of a notification, shared by the page and the emails.
 */
export function describe(type: NotificationType, data: Data): { text: string; url: string } {
  const card = `« ${data.cardTitle} »`
  switch (type) {
    case 'auction_outbid':
      return {
        text: `Quelqu'un a surenchéri sur ${card} : ${wikis(data.amount)}. Ta mise t'a été rendue.`,
        url: `/auctions/${data.auctionId}`,
      }
    case 'auction_won':
      return {
        text: `Tu as remporté ${card} pour ${wikis(data.amount)}.`,
        url: `/auctions/${data.auctionId}`,
      }
    case 'auction_sold':
      return {
        text: `${card} est vendue à ${data.username} pour ${wikis(data.amount)}.`,
        url: `/auctions/${data.auctionId}`,
      }
    case 'auction_unsold':
      return {
        text: `Ton enchère sur ${card} s'est terminée sans mise : la carte te reste.`,
        url: `/auctions/${data.auctionId}`,
      }
    case 'trade_received':
      return { text: `${data.username} te propose un échange.`, url: '/trades?box=received' }
    case 'trade_accepted':
      return {
        text: `${data.username} a accepté ton échange : les cartes ont changé de main.`,
        url: '/trades?box=history',
      }
    case 'trade_declined':
      return { text: `${data.username} a refusé ton échange.`, url: '/trades?box=history' }
  }
}

export default class NotificationService {
  /**
   * Records a notification inside the event's transaction. The optional
   * email leaves only once that transaction is committed.
   */
  async notify(trx: TransactionClientContract, userId: number, type: NotificationType, data: Data) {
    await Notification.create({ userId, type, data, readAt: null }, { client: trx })
    trx.after('commit', () => this.email(userId, type, data))
  }

  unreadCount(user: User) {
    return Notification.query()
      .where('user_id', user.id)
      .whereNull('read_at')
      .count('* as total')
      .firstOrFail()
      .then((row) => Number(row.$extras.total))
  }

  async latest(user: User, limit = 50) {
    return Notification.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .limit(limit)
  }

  async markAllRead(user: User) {
    await Notification.query()
      .where('user_id', user.id)
      .whereNull('read_at')
      .update({ readAt: new Date() })
  }

  protected async email(userId: number, type: NotificationType, data: Data) {
    try {
      const user = await User.find(userId)
      if (!user?.notifyByEmail) return
      const { text, url } = describe(type, data)
      await mail.send(new NotificationMail(user, text, `${env.get('APP_URL')}${url}`))
    } catch (error) {
      logger.warn({ err: error, userId, type }, 'Notification email not sent')
    }
  }
}
