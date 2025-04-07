import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./Message";

@ObjectType()
@Entity()
export class User {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Field()
    @Column({unique: true})
    username: string

    @Field()
    @Column({unique: true})
    email: string

    @Column()
    password: string

    @Field(() => [User], {nullable: true})
    @ManyToMany(() => User, (user) => user.following)
    @JoinTable()
    followedBy?: User[]

    @Field(() => [User], {nullable: true})
    @ManyToMany(() => User, (user) => user.followedBy)
    following?: User[]

    @Field(() => [Message],{ nullable: true })
    @OneToMany(() => Message, (message) => message.user)
    message: Message[]
}