import vine from '@vinejs/vine'

/**
 * Tag names are unique per player, ignoring case.
 */
const tagName = () =>
  vine
    .string()
    .trim()
    .minLength(1)
    .maxLength(30)
    .unique({
      table: 'tags',
      column: 'name',
      caseInsensitive: true,
      filter: (db, _value, field) => {
        db.where('user_id', field.meta.userId)
      },
    })

export const createTagValidator = vine.withMetaData<{ userId: number }>().create({
  name: tagName(),
  cardId: vine.number().withoutDecimals().positive().optional(),
})

export const attachTagValidator = vine.create({
  tagId: vine.number().withoutDecimals().positive(),
})
