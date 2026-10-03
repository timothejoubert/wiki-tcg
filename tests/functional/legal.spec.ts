import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUser } from '#tests/helpers/users'

const pages = [
  ['/conditions', 'legal/terms'],
  ['/regles', 'legal/rules'],
  ['/confidentialite', 'legal/privacy'],
  ['/mentions-legales', 'legal/notice'],
] as const

test.group('Legal pages', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('are public and also reachable when signed in', async ({ client }) => {
    const user = await createUser()
    for (const [url, component] of pages) {
      const guest = await client.get(url).withInertia()
      guest.assertStatus(200)
      guest.assertInertiaComponent(component)

      const player = await client.get(url).loginAs(user).withInertia()
      player.assertInertiaComponent(component)
    }
  })
})
