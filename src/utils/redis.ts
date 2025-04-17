import Redis from "ioredis"
import dotenv from "dotenv"
import { RedisPubSub } from "graphql-redis-subscriptions"
import { time } from "console"

dotenv.config()

export const pubSub = new RedisPubSub({
    connection: {
        host: "localhost",
        port: 6379,
        retryStrategy(times) {
            return Math.max(times * 100, 3000)
        },
    }
})