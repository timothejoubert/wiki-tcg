import { DateTime } from 'luxon'
import User from '#models/user'
import gameConfig from '#config/game'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth }: HttpContext) {
    const { username, email, password } = await request.validateUsing(signupValidator)
    const now = DateTime.now()
    const user = await User.create({
      username,
      email,
      password,
      adultConfirmedAt: now,
      boosterStock: gameConfig.boosters.initialStock,
      boosterRefilledAt: now,
    })

    await auth.use('web').login(user)
    response.redirect().toRoute('dashboard')
  }
}
