import { Request } from "express";
import { PubSub } from "graphql-subscriptions";

export interface Context {
    req: Request
    pubSub: PubSub
}