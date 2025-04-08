import { User } from "../entities/User"
import jwt from "jsonwebtoken";
import { Request } from "express";
import { AuthChecker } from "type-graphql";
import { Context } from "../types/myContext";

const JWT_SECRET = "!Pz)zOij.DhZ|4lhdn=^FLD%e;((AcGh"

export const createToken = (user: User) => {
    return jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "7d"})
}

export const getUser = (req: Request) => {
    const auth = req.headers.authorization
    if (!auth) return null
    try {
        const decoded: any = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET)
        return decoded.userId
    } catch {
        return null
    }
}

export const authChecker: AuthChecker<Context> = ({ context }) => {
    const userId = getUser(context.req)
    return !userId
}