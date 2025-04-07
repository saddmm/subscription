import { LoginUserInput, RegisterUserInput } from "../dto/user.dto";
import { User } from "../entities/User";
import { myDataSource } from "../ormconfig";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import bcrypt from "bcrypt";
import { createToken, getUser } from "../utils/auth";
import { Context } from "../types/myContext";

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

    @Query(() => User, {nullable: true})
    async getUser(@Ctx() ctx: Context) {
        const userId = getUser(ctx.req)
        if (!userId) return null
        
        return await userRepository.findOneBy({id: userId})
    }

    @Mutation(() => Boolean)
    async followeUser(
        @Arg("followerId") followerId: string,
        @Ctx() ctx: Context,
    ) {
        const userId = getUser(ctx.req)
        if (!userId) throw new Error("Login dulu")
        const user = await userRepository.findOne({ where: {id: userId}, relations: ["following"]})
        const follower = await userRepository.findOneBy({id: followerId})

        if (!user || !follower) throw new Error("user not found")
        user?.following.push(follower)
        await userRepository.save(user)
        
        return true
    }

    @Query(() => [User])
    async getUsers() {
        return await userRepository.find({relations: ["followedBy", "following", "message"]})
    }
}