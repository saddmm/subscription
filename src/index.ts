import "reflect-metadata"
import express from "express"
import dotenv from "dotenv"
import { myDataSource } from "./ormconfig"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolvers/UserResolver"
import { ApolloServer } from "apollo-server-express"
import { createServer } from "http"
import { SubscriptionServer } from "subscriptions-transport-ws"
import { authChecker, verifyToken } from "./utils/auth"
// import { pubSub } from "./utils/redis"
import { execute, subscribe } from "graphql"
import { Context } from "./types/myContext"
// import { pubSub } from "./utils/redis"
import { User } from "./entities/User"
import { MessageResolver } from "./resolvers/messageResolver"
import { createPubSub } from "graphql-yoga"

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
        resolvers: [UserResolver, MessageResolver],
        pubSub,
        // validate: false,
        authChecker
    })

    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const token = req.headers.authorization
            let userId = null
            if (token) {
                userId = verifyToken(token)
            }
            return {req, pubSub, userId}
        },
    })
    await server.start()

    server.applyMiddleware({ app })

    SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            onConnect: async (connectionParams: any) => {
                const token = connectionParams?.Authorization
                if (!token) throw new Error("Unauthorized")
                const userId = verifyToken(token)
                return {userId}
            }
        },
        {
            server: httpServer,
            path: "/graphql"
        }
    );

    const PORT = process.env.PORT || 3000

    httpServer.listen(PORT, () => {
        console.log(`Berjalan di port ${PORT}`)
    })
})()
