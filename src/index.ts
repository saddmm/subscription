import "reflect-metadata"
import express from "express"
import dotenv from "dotenv"
import { myDataSource } from "./ormconfig"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolvers/UserResolver"
import { ApolloServer } from "apollo-server-express"
import { createPubSub } from "@graphql-yoga/subscription"
import { createServer } from "http"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { execute, subscribe } from "graphql"
import { authChecker, getUser } from "./utils/auth"
import { Context } from "./types/myContext"

(async () => {
    dotenv.config()

    const app: any = express()
    // const ws = createServer(app)
    app.use(express.json())
    const httpServer = createServer(app)

    const pubSub = createPubSub()

    await myDataSource.initialize()
        .then(() => {
        console.log("database Connect")
        }).catch((err) => {
        console.log(err)
        })
    
    const schema = await buildSchema({
        resolvers: [UserResolver],
        pubSub,
        authChecker
    })

    const server = new ApolloServer({
        schema,
        context: async ({ req }) => ({ req, pubSub })
    })
    await server.start()

    server.applyMiddleware({ app })

    SubscriptionServer.create({
        schema,
        execute,
        subscribe,
        onConnect: (ctx: Context) => {
            const userId = getUser(ctx.req)
            if (!userId) throw new Error("Unauthorized")
            return userId
        }
    }, {
        server: httpServer,
        path: "/graphql"
    })

    const PORT = process.env.PORT || 3000

    httpServer.listen(PORT, () => {
        console.log(`Berjalan di port ${PORT}`)
    })
})()
