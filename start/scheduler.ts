/*
|--------------------------------------------------------------------------
| Scheduled tasks
|--------------------------------------------------------------------------
|
| Run with `node ace scheduler:run` as a long-lived process next to the
| HTTP server. Times are UTC: the Wikimedia top lists for a day are
| published shortly after midnight UTC.
|
*/

import scheduler from 'adonisjs-scheduler/services/main'

/**
 * Legendaries and super rares from yesterday's and last month's most viewed
 * articles. Also repairs cards frozen without a quality score.
 */
scheduler.command('cards:harvest', ['--top']).dailyAt('03:00').timezone('UTC').withoutOverlapping()

/**
 * Rares, which only random batches surface (~3 % of articles).
 */
scheduler.command('cards:harvest', ['--random=30']).hourlyAt(20).withoutOverlapping()

/**
 * Auctions also settle when their page is viewed; this catches the rest.
 */
scheduler.command('auctions:settle').everyMinute().withoutOverlapping()
