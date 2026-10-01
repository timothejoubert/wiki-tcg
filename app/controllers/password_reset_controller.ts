import AccountService, { InvalidTokenError } from '#services/account_service'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PasswordResetController {
  constructor(protected account: AccountService) {}

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {})
  }

  async store({ request, response, session }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await this.account.requestPasswordReset(email)
    session.flash(
      'success',
      'Si un compte utilise cette adresse, un lien vient de lui être envoyé.'
    )
    return response.redirect().toRoute('password_reset.create')
  }

  async edit({ inertia, params }: HttpContext) {
    const valid = (await this.account.findResetToken(params.token)) !== null
    return inertia.render('auth/reset_password', { token: params.token, valid })
  }

  async update({ params, request, response, session }: HttpContext) {
    const { password } = await request.validateUsing(resetPasswordValidator)
    try {
      await this.account.resetPassword(params.token, password)
    } catch (error) {
      if (!(error instanceof InvalidTokenError)) throw error
      session.flash('error', error.message)
      return response.redirect().toRoute('password_reset.create')
    }
    session.flash('success', 'Mot de passe modifié : tu peux te connecter.')
    return response.redirect().toRoute('session.create')
  }
}
