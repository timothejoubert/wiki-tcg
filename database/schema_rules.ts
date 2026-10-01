import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

const gameTypes = { source: '#config/game' }

export default {
  tables: {
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
