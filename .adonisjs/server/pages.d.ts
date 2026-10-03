import '@adonisjs/inertia/types'

import type { VNodeProps, AllowedComponentProps, ComponentInstance } from 'vue'

type ExtractProps<T> = Omit<
  ComponentInstance<T>['$props'],
  keyof VNodeProps | keyof AllowedComponentProps
>

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auctions/index': ExtractProps<(typeof import('../../inertia/pages/auctions/index.vue'))['default']>
    'auctions/show': ExtractProps<(typeof import('../../inertia/pages/auctions/show.vue'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.vue'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.vue'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.vue'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.vue'))['default']>
    'boosters/show': ExtractProps<(typeof import('../../inertia/pages/boosters/show.vue'))['default']>
    'cards/show': ExtractProps<(typeof import('../../inertia/pages/cards/show.vue'))['default']>
    'collection': ExtractProps<(typeof import('../../inertia/pages/collection.vue'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.vue'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.vue'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.vue'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.vue'))['default']>
    'legal/notice': ExtractProps<(typeof import('../../inertia/pages/legal/notice.vue'))['default']>
    'legal/privacy': ExtractProps<(typeof import('../../inertia/pages/legal/privacy.vue'))['default']>
    'legal/rules': ExtractProps<(typeof import('../../inertia/pages/legal/rules.vue'))['default']>
    'legal/terms': ExtractProps<(typeof import('../../inertia/pages/legal/terms.vue'))['default']>
    'players/index': ExtractProps<(typeof import('../../inertia/pages/players/index.vue'))['default']>
    'players/show': ExtractProps<(typeof import('../../inertia/pages/players/show.vue'))['default']>
    'settings': ExtractProps<(typeof import('../../inertia/pages/settings.vue'))['default']>
    'settings/account': ExtractProps<(typeof import('../../inertia/pages/settings/account.vue'))['default']>
    'trades/index': ExtractProps<(typeof import('../../inertia/pages/trades/index.vue'))['default']>
    'trades/new': ExtractProps<(typeof import('../../inertia/pages/trades/new.vue'))['default']>
    'wallet': ExtractProps<(typeof import('../../inertia/pages/wallet.vue'))['default']>
  }
}
