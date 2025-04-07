import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterUserInput {
    @Field()
    username: string

    @Field()
    @IsEmail()
    email: string

    @Field()
    @Length(8, 56)
    password: string
}

@InputType()
export class LoginUserInput {
    @Field()
    usernameOrEmail: string

    @Field()
    @Length(8, 56)
    password: string
}