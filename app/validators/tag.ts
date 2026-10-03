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
        if (field.meta.tagId) {
          db.whereNot('id', field.meta.tagId)
        }
      },
    })

export const createTagValidator = vine.withMetaData<{ userId: number }>().create({
  name: tagName(),
  cardId: vine.number().withoutDecimals().positive().optional(),
})

export const renameTagValidator = vine.withMetaData<{ userId: number; tagId: number }>().create({
  name: tagName(),
})

export const bulkValidator = vine.create({
  cardIds: vine
    .array(vine.number().withoutDecimals().positive())
    .minLength(1)
    .maxLength(100)
    .distinct(),
  action: vine.enum(['favorite', 'unfavorite', 'tag', 'untag', 'recycle'] as const),
  tagId: vine
    .number()
    .withoutDecimals()
    .positive()
    .optional()
    .requiredWhen('action', 'in', ['tag', 'untag']),
})

export const attachTagValidator = vine.create({
  tagId: vine.number().withoutDecimals().positive(),
})
