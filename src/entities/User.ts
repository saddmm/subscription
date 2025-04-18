import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Field()
    @Column({unique: true})
    username: string

    @Field()
    @Column({unique: true})
    email: string

    @Field()
    @Column()
    password: string

    @Field(() => [User], {nullable: true})
    @ManyToMany(() => User, (user) => user.following)
    @JoinTable()
    followedBy: User[]

    @Field(() => [User], {nullable: true})
    @ManyToMany(() => User, (user) => user.followedBy)
    following: User[]

    @Field(() => [Post], {nullable: true})
    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[]

    @Field(() => [Message],{ nullable: true })
    @OneToMany(() => Message, (message) => message.sender)
    sendMessages: Message[]

    @Field(() => [Message], { nullable: true })
    @OneToMany(() => Message, (message) => message.receiver)
    receiveMessage: Message[]


}