import { LoginUserInput, RegisterUserInput } from "../dto/user.dto";
import { User } from "../entities/User";
import { myDataSource } from "../ormconfig";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver, Root, Subscription } from "type-graphql";
import bcrypt from "bcrypt";
import { createToken, getUser } from "../utils/auth";
import { Context } from "../types/myContext";
import { PubSubEngine } from "graphql-subscriptions";

const userRepository = myDataSource.getRepository(User)

@Resolver(User)
export class UserResolver {
    @Mutation(() => User)
    async register(@Arg("input") { username, email, password }: RegisterUserInput) {
        const hashPassword = bcrypt.hashSync(password, 10)
        const user = userRepository.create({ username, email, password: hashPassword })
        return await userRepository.save(user)
    }

    @Mutation(() => String)
    async login(@Arg("input") {usernameOrEmail, password}: LoginUserInput) {
        const user = await userRepository.findOne({
            where: [
                { email: usernameOrEmail },
                {username: usernameOrEmail}
            ]
        })
        
        if (!user) throw new Error("User not found")

        const valid = await bcrypt.compare(password, user.password)
        if(!valid) throw new Error("Password invalid")
        
        return createToken(user)
    }

    @Query(() => User, { nullable: true })
    @Authorized()
    async getUser(@Ctx() ctx: Context) {
        const userId = getUser(ctx.req)
        if (!userId) return null
        
        return await userRepository.findOneBy({id: userId})
    }

    @Mutation(() => Boolean)
    @Authorized()
    async followeUser(
        @Arg("followerId") followerId: string,
        @Ctx() ctx: Context,
    ) {
        const userId = getUser(ctx.req)
        if (!userId) throw new Error("Login dulu")
        
        if (userId === followerId) throw new Error("tidak bisa follow diri sendiri")
        
        const user = await userRepository.findOne({ where: {id: userId}, relations: ["following"]})
        const follower = await userRepository.findOneBy({ id: followerId })
        
        if (!user || !follower) throw new Error("user not found")
        
        const isFollow = user.following.some(f => f.username === followerId)
        if (isFollow) throw new Error("Sudah Follow")
        user?.following.push(follower)
        await userRepository.save(user)
        
        await ctx.pubSub.publish("FOLLOW_EVENT", {
            newFollower: {
                id: user.id,
                username: user.username
            }
        } )
        return true
    }

    @Subscription(() => User, {
        topics: "FOLLOW_EVENT"
    })
    @Authorized()
    newFollower(@Root() payload: { newFollower: User }) {
        return payload.newFollower
    }

    @Query(() => [User])
    async getUsers() {
        return await userRepository.find({relations: ["followedBy", "following", "message"]})
    }
}