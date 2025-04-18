import { Field, ID, ObjectType } from "type-graphql";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post {
    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Field()
    @Column()
    title: string

    @Field()
    @Column()
    content: string

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    creator: User

    @Field()
    @CreateDateColumn()
    createdAt: Date
}