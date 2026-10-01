import gameConfig from '#config/game'
import WalletService, {
  InsufficientFundsError,
  NotADuplicateError,
  StockNotEmptyError,
} from '#services/wallet_service'
import WalletTransactionTransformer from '#transformers/wallet_transaction_transformer'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

const { currency } = gameConfig.economy
const wikis = (amount: number) => `${amount} ${amount > 1 ? currency.many : currency.one}`

@inject()
export default class WalletController {
  constructor(protected wallet: WalletService) {}

  async index({ inertia, auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const history = await this.wallet.history(user, Math.max(1, Number(request.qs().page) || 1))

    return inertia.render('wallet', {
      balance: user.balance,
      history: WalletTransactionTransformer.paginate(history.all(), history.getMeta()),
    })
  }

  async sell({ auth, params, response, session }: HttpContext) {
    try {
      const price = await this.wallet.sellDuplicate(auth.getUserOrFail(), Number(params.id))
      session.flash('success', `Doublon revendu : +${wikis(price)}.`)
    } catch (error) {
      if (!(error instanceof NotADuplicateError)) throw error
      session.flash('error', error.message)
    }
    return response.redirect().back()
  }

  async buyBooster({ auth, response, session }: HttpContext) {
    try {
      await this.wallet.buyBooster(auth.getUserOrFail())
      session.flash('success', `Booster acheté : −${wikis(gameConfig.economy.boosterPrice)}.`)
    } catch (error) {
      if (!(error instanceof InsufficientFundsError || error instanceof StockNotEmptyError)) {
        throw error
      }
      session.flash('error', error.message)
    }
    return response.redirect().toRoute('dashboard')
  }
}
