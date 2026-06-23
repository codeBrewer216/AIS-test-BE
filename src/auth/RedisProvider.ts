import { createClient } from "redis"

export const RedisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const host = process.env.REDIS_HOST || 'localhost'
    const port = process.env.REDIS_PORT || '6379'
    const client = createClient({
      url: `redis://${host}:${port}`,
    })

    await client.connect()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return client
  },
}