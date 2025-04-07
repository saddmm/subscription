import { RegisterUserInput } from "../dto/user.dto";
import { User } from "../entities/User";
import { myDataSource } from "../ormconfig";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

const userRepository = myDataSource.getRepository(User)

@Resolver(User)
export class UserResolver {
    @Mutation(() => User)
    async register(@Arg("input") input: RegisterUserInput) {
        const user = userRepository.create(input)
        return await userRepository.save(user)
    }

    @Query(() => [User])
    async getUsers() {
        return await userRepository.find({relations: ["followedBy", "following", "message"]})
    }
}