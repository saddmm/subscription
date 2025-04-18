import { myDataSource } from "../ormconfig";
import { Message } from "../entities/Message";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver, Root, Subscription } from "type-graphql";
import { messageInput } from "../dto/message.dto";
import { Context } from "../types/myContext";
import { User } from "../entities/User";

const messageRepository = myDataSource.getRepository(Message)
const userRepository = myDataSource.getRepository(User)

@Resolver(Message)
export class MessageResolver {
    @Mutation(() => Message)
    async createMessage(@Arg("input") input: messageInput,
        @Ctx() context: Context) {
        try {
            const sender = await userRepository.findOneBy({ id: context.userId })
            const receiver = await userRepository.findOneBy({ id: input.receiveId })
            if (!sender || !receiver) throw new Error("User not found")
            
            const createMessage = messageRepository.create({ body: input.body, sender, receiver })
            const message = await messageRepository.save(createMessage)

            await context.pubSub.publish(`message_${input.receiveId}`, message)
            return message

        } catch (err) {
            return err
        }
    }

    @Subscription(() => Message, {
        topics: ({context}) => `message_${context.userId}`
    })
    newMessage(@Root() payload: Message) {
        return payload
    }

    @Query(() => [Message])
    @Authorized()
    async getMessage(@Ctx() ctx: Context,
        @Arg('receiverId', { nullable: true }) receiverId?: string
        ) {
        const sender = await userRepository.findOneBy({ id: ctx.userId })
        if(!sender) throw new Error("User not found")
        if (receiverId) {
            const receiver = await userRepository.findOneBy({ id: receiverId })
            if (!receiver) throw new Error("User not found")
            return await messageRepository.find({
                where: {
                    receiver,
                    sender
                },
                relations: ["sender", "receiver"]
            })
        }
        return await messageRepository.find({
            where: {
                sender
            },
            relations: ["sender", "receiver"]
        })
    }
}