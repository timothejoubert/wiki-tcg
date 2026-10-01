import type { Data } from '@generated/data'

export type Rarity = Data.Card['rarity']

export const rarityLabels: Record<Rarity, string> = {
  common: 'Commune',
  uncommon: 'Peu commune',
  rare: 'Rare',
  super_rare: 'Super rare',
  legendary: 'Légende',
}

export const rarityShort: Record<Rarity, string> = {
  common: 'C',
  uncommon: 'PC',
  rare: 'R',
  super_rare: 'SR',
  legendary: 'L',
}

export const rarities = Object.keys(rarityLabels) as Rarity[]

const numberFormat = new Intl.NumberFormat('fr-FR')

export function formatNumber(value: number) {
  return numberFormat.format(value)
}

export function formatWikis(amount: number) {
  return `${numberFormat.format(amount)} ${Math.abs(amount) > 1 ? 'wikis' : 'wiki'}`
}

export const walletKindLabels: Record<string, string> = {
  daily_bonus: 'Bonus quotidien',
  new_card: 'Nouvelle carte',
  bank_sale: 'Revente d’un doublon',
  booster_purchase: 'Achat d’un booster',
  auction_hold: 'Enchère placée',
  auction_refund: 'Enchère remboursée',
  auction_sale: 'Vente aux enchères',
}
