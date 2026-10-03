<script setup lang="ts">
import { Link } from '@adonisjs/inertia/vue'
import { Gavel, ArrowLeftRight } from 'lucide-vue-next'
import Page from '~/components/page.vue'
import AppLayout from '~/layouts/app.vue'

defineProps<{
  notifications: {
    id: number
    type: string
    unread: boolean
    createdAt: string
    text: string
    url: string
  }[]
}>()

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <AppLayout>
    <Page title="Notifications">
      <ul v-if="notifications.length" class="notification-list">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="{ 'is-unread': notification.unread }"
        >
          <span class="notification__icon" aria-hidden="true">
            <Gavel v-if="notification.type.startsWith('auction')" :size="16" />
            <ArrowLeftRight v-else :size="16" />
          </span>
          <Link :href="notification.url" class="notification__text">
            <span v-if="notification.unread" class="visually-hidden">Nouveau : </span>
            {{ notification.text }}
          </Link>
          <time :datetime="notification.createdAt" class="notification__date">
            {{ dateFormat.format(new Date(notification.createdAt)) }}
          </time>
        </li>
      </ul>
      <div v-else class="empty">
        <h2>Aucune notification</h2>
        <p>Tu seras prévenu ici des enchères et des échanges qui te concernent.</p>
      </div>
    </Page>
  </AppLayout>
</template>
