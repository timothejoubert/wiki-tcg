<script setup lang="ts">
import { Coins, Library, LogOut, Package } from 'lucide-vue-next'
import { usePage } from '@inertiajs/vue3'
import { Form, Link } from '@adonisjs/inertia/vue'
import { formatWikis } from '~/lib/game'
import Logo from '~/components/logo.vue'
import FlashToasts from '~/components/flash_toasts.vue'
import ThemeToggle from '~/components/theme_toggle.vue'
import NavLink, { type NavItem } from '~/components/nav_link.vue'

/**
 * Top-level app navigation. Add an entry here for every new area of your
 * app, and it shows up in the navigation bar with its active state handled.
 */
const nav: NavItem[] = [
  { label: 'Boosters', route: 'dashboard', icon: Package },
  { label: 'Collection', route: 'collection', icon: Library },
]

const page = usePage()
</script>

<template>
  <header class="header header--bar">
    <div class="header__inner">
      <Logo :size="28" />
      <div class="header__right">
        <template v-if="page.props.user">
          <Link route="wallet" class="header__balance">
            <Coins :size="15" aria-hidden="true" />
            <span class="visually-hidden">Solde : </span>{{ formatWikis(page.props.user.balance) }}
          </Link>
          <span class="header__user">{{ page.props.user.username }}</span>
        </template>
        <ThemeToggle />
        <Form route="session.destroy">
          <button type="submit" class="btn btn--secondary btn--sm">
            <LogOut :size="15" aria-hidden="true" /> Déconnexion
          </button>
        </Form>
      </div>
    </div>
  </header>

  <nav class="subnav" aria-label="Navigation principale">
    <div class="subnav__inner">
      <NavLink v-for="item in nav" :key="item.label" :route="item.route" class="subnav__item">
        <component :is="item.icon" v-if="item.icon" :size="14" aria-hidden="true" />
        {{ item.label }}
      </NavLink>
    </div>
  </nav>

  <main class="app-main">
    <slot />
  </main>
  <footer class="app-footer">
    Contenu encyclopédique issu de Wikipédia, sous licence
    <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr" class="il" rel="license"
      >CC BY-SA 4.0</a
    >. Wiki TCG n'est pas affilié à la Wikimedia Foundation.
  </footer>
  <FlashToasts />
</template>
