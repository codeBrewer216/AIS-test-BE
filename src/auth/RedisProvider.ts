import { createClient } from "redis"

export const RedisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = createClient({
      url: 'redis://localhost:6379',
    })

    await client.connect()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return client
  },
}