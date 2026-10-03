<script setup lang="ts">
import {
  ArrowLeftRight,
  Bell,
  Coins,
  Gavel,
  Heart,
  Library,
  LogOut,
  Package,
  Settings,
  Users,
} from 'lucide-vue-next'
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
  { label: 'Enchères', route: 'auctions.index', icon: Gavel },
  { label: 'Échanges', route: 'trades.index', icon: ArrowLeftRight },
  { label: 'Souhaits', route: 'wishlist', icon: Heart },
  { label: 'Joueurs', route: 'players.index', icon: Users },
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
          <Link
            route="players.show"
            :params="{ username: page.props.user.username }"
            class="header__user"
          >
            {{ page.props.user.username }}
          </Link>
          <Link
            route="notifications"
            class="iconbtn header__bell"
            :aria-label="
              page.props.unreadNotifications
                ? `Notifications, ${page.props.unreadNotifications} non lue(s)`
                : 'Notifications'
            "
          >
            <Bell :size="16" aria-hidden="true" />
            <span
              v-if="page.props.unreadNotifications"
              class="header__bell-count"
              aria-hidden="true"
            >
              {{ page.props.unreadNotifications > 9 ? '9+' : page.props.unreadNotifications }}
            </span>
          </Link>
          <Link route="settings" class="iconbtn" aria-label="Réglages">
            <Settings :size="16" aria-hidden="true" />
          </Link>
        </template>
        <ThemeToggle />
        <Form route="session.destroy">
          <button type="submit" class="btn btn--secondary btn--sm">
            <LogOut :size="15" aria-hidden="true" />
            <span class="btn__label">Déconnexion</span>
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
        <span
          v-if="item.route === 'trades.index' && page.props.pendingTrades"
          class="subnav__badge"
        >
          {{ page.props.pendingTrades }}
          <span class="visually-hidden">proposition(s) en attente</span>
        </span>
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
    >. Wiki TCG n'est pas affilié à la Wikimedia Foundation. ·
    <Link route="legal.terms" class="il">Conditions</Link> ·
    <Link route="legal.privacy" class="il">Confidentialité</Link> ·
    <Link route="legal.notice" class="il">Mentions légales</Link>
  </footer>
  <FlashToasts />
</template>
