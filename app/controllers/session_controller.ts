import User from '#models/user'
import { errors } from '@adonisjs/auth'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { login, password } = await request.validateUsing(loginValidator)

    try {
      const uid = login.includes('@') ? login.toLowerCase() : login
      const user = await User.verifyCredentials(uid, password)
      await auth.use('web').login(user)
    } catch (error) {
      if (!(error instanceof errors.E_INVALID_CREDENTIALS)) {
        throw error
      }
      session.flashOnly(['login'])
      session.flash('error', 'Identifiant ou mot de passe incorrect.')
      return response.redirect().back()
    }

    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
