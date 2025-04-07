import "reflect-metadata"
import express, { Request } from "express"
import dotenv from "dotenv"
import { myDataSource } from "./ormconfig"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolvers/UserResolver"
import { ApolloServer } from "apollo-server-express"
import { getUser } from "./utils/auth"

(async () => {
    dotenv.config()

    const app:any = express()
    app.use(express.json())


    await myDataSource.initialize()
        .then(() => {
        console.log("database Connect")
        }).catch((err) => {
        console.log(err)
        })
    
    const schema = await buildSchema({
        resolvers: [UserResolver]
    })

    const server = new ApolloServer({
        schema,
        context: async ({ req }) => ({req})
    })
    await server.start()

    server.applyMiddleware({app})

    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
        console.log(`Berjalan di port ${PORT}`)
    })
})()
