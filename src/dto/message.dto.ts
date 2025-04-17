import { Field, InputType } from "type-graphql";

@InputType()
export class messageInput {
    @Field()
    body: string

    @Field(() => String)
    receiveId: string
}