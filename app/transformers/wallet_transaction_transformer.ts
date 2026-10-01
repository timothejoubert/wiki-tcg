import type WalletTransaction from '#models/wallet_transaction'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class WalletTransactionTransformer extends BaseTransformer<WalletTransaction> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'amount', 'kind', 'balanceAfter', 'createdAt']),
      card: this.resource.card
        ? { id: this.resource.card.id, title: this.resource.card.title }
        : null,
    }
  }
}
