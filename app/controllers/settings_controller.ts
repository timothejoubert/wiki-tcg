import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'

const settingsValidator = vine.create({
  collectionPublic: vine.boolean().optional(),
})

export default class SettingsController {
  async edit({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return inertia.render('settings', { collectionPublic: user.collectionPublic })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { collectionPublic } = await request.validateUsing(settingsValidator)
    user.collectionPublic = collectionPublic ?? false
    await user.save()

    session.flash('success', 'Réglages enregistrés.')
    return response.redirect().toRoute('settings')
  }
}
