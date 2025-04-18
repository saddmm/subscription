import { Context } from "../types/myContext";
import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { myDataSource } from "../ormconfig";
import { User } from "../entities/User";
import { esClient } from "../utils/elasticsearch";

const postRepository = myDataSource.getRepository(Post)
const userRepository = myDataSource.getRepository(User)

@Resolver(Post)
export class PostResolver {
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Arg('content') content: string,
        @Ctx() ctx: Context
    ) {
        const user = await userRepository.findOneBy({ id: ctx.userId })
        if (!user) throw new Error("User not found")
        const post = postRepository.create({ title, content, creator: user })
        await postRepository.save(post)

        await esClient.index({
            index: 'post',
            id: post.id,
            document: {
                title: post.title,
                content: post.content,
                creator: user.id,
                createdAt: post.createdAt
            }
        })

        return post
    }

    @Query(() => [Post])
    async searchPost(
        @Arg('query') query: string
    ) {
        const result = await esClient.search({
            index: 'post',
            query: {
                multi_match: {
                    query,
                    fields: ['title', 'content', 'createdAt']
                }
            }
        })

        return result.hits.hits.map((hit: any) => ({
            id: parseInt(hit._id),
            ...hit._source,
        }))
    }
}