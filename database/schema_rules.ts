import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

const gameTypes = { source: '#config/game' }

export default {
  tables: {
    user_tokens: {
      columns: {
        type: {
          tsType: "'password_reset' | 'email_change'",
          decorators: [{ name: '@column' }],
        },
      },
    },
    trades: {
      columns: {
        status: {
          tsType: 'TradeStatus',
          imports: [{ ...gameTypes, typeImports: ['TradeStatus'] }],
          decorators: [{ name: '@column' }],
        },
      },
    },
    auctions: {
      columns: {
        status: {
          tsType: 'AuctionStatus',
          imports: [{ ...gameTypes, typeImports: ['AuctionStatus'] }],
          decorators: [{ name: '@column' }],
        },
      },
    },
    wallet_transactions: {
      columns: {
        kind: {
          tsType: 'WalletKind',
          imports: [{ ...gameTypes, typeImports: ['WalletKind'] }],
          decorators: [{ name: '@column' }],
        },
      },
    },
    cards: {
      columns: {
        rarity: {
          tsType: 'Rarity',
          imports: [{ ...gameTypes, typeImports: ['Rarity'] }],
          decorators: [{ name: '@column' }],
        },
        quality_label: {
          tsType: 'QualityLabel',
          imports: [{ ...gameTypes, typeImports: ['QualityLabel'] }],
          decorators: [{ name: '@column' }],
        },
      },
    },
  },
} satisfies SchemaRules
