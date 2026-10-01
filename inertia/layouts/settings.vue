<script setup lang="ts">
import Page from '~/components/page.vue'
import NavLink, { type NavItem } from '~/components/nav_link.vue'

/**
 * The pages of the settings area, listed in the sidebar. Register a route
 * for each page and add it here, for example:
 *
 * `{ label: 'Profile', route: 'settings.profile', icon: User }`
 *
 * Each settings page renders inside the app layout and this layout:
 *
 * `<AppLayout><SettingsLayout>…</SettingsLayout></AppLayout>`
 */
const items: NavItem[] = [{ label: 'Confidentialité', route: 'settings' }]
</script>

<template>
  <Page title="Réglages" description="Gère ton compte et ce que les autres joueurs voient.">
    <div class="sidebar-layout">
      <nav class="sidebar-layout__nav" aria-label="Réglages">
        <NavLink
          v-for="item in items"
          :key="item.label"
          :route="item.route"
          exact
          class="sidebar-layout__item"
        >
          <component :is="item.icon" v-if="item.icon" :size="16" />
          {{ item.label }}
        </NavLink>
      </nav>
      <div class="sidebar-layout__content panel">
        <slot />
      </div>
    </div>
  </Page>
</template>
