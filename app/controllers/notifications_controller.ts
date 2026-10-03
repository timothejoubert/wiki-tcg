import NotificationService, { describe } from '#services/notification_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class NotificationsController {
  constructor(protected notifications: NotificationService) {}

  /**
   * Lists the latest notifications, then marks them as read.
   */
  async index({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const latest = await this.notifications.latest(user)
    await this.notifications.markAllRead(user)

    return inertia.render('notifications', {
      notifications: latest.map((notification) => ({
        id: notification.id,
        type: notification.type,
        unread: notification.readAt === null,
        createdAt: notification.createdAt.toISO()!,
        ...describe(notification.type, notification.data),
      })),
    })
  }
}
