import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Inject } from '@nestjs/common'
import type { RedisClientType } from 'redis'
// import { auditLogger } from '../logger/winston-mongodb.logger'

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name)

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) { }

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupOrphanSessions() {
    // auditLogger.info('Running orphan session cleanup...')
    // Find all user session keys
    const userSessionKeys = await this.redis.keys('user:*:sessions')
    for (const sessionKey of userSessionKeys) {
      const userId = sessionKey.split(':')[1]
      const sessionIds = await this.redis.zRange(sessionKey, 0, -1)
      for (const sessionId of sessionIds) {
        const jwtKey = `jwt:${userId}:${sessionId}`
        const exists = await this.redis.exists(jwtKey)
        if (!exists) {
          // Remove orphan session from ZSET
          await this.redis.zRem(sessionKey, sessionId)
          this.logger.log(`Removed orphan session: user=${userId} session=${sessionId}`)
        }
      }
    }
    this.logger.log('Orphan session cleanup complete.')
  }
}
