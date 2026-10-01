import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import AuctionService from '#services/auction_service'

/**
 * Closes the auctions past their end: hands the copy to the leader and pays
 * the seller, or marks them unsold.
 */
export default class AuctionsSettle extends BaseCommand {
  static commandName = 'auctions:settle'
  static description = 'Settle auctions past their end'
  static options: CommandOptions = { startApp: true }

  async run() {
    const auctions = await this.app.container.make(AuctionService)
    const settled = await auctions.settleDue()
    if (settled) {
      this.logger.success(`${settled} auction(s) settled`)
    }
  }
}
