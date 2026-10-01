/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(10).every('1 minute')
})

/**
 * Login and signup attempts, per IP address.
 */
export const authThrottle = limiter.define('auth', (ctx) => {
  return limiter
    .allowRequests(5)
    .every('1 minute')
    .usingKey(`auth_${ctx.request.ip()}`)
    .blockFor('5 minutes')
})
