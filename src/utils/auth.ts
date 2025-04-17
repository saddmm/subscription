import { User } from "../entities/User"
import jwt from "jsonwebtoken";
import { Request } from "express";
import { AuthChecker } from "type-graphql";
import { Context } from "../types/myContext";

const JWT_SECRET = "!Pz)zOij.DhZ|4lhdn=^FLD%e;((AcGh"

export const createToken = (user: User) => {
    return jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "7d"})
}

export const verifyToken = (token: string) => {
    try {
        const decoded: any = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET)
        return decoded.userId
    } catch (err) {
        return err
    }
}

// export const getUser = async (req: Request) => {
//     const auth = req.headers.authorization
//     if (!auth) return null
//     return verifyToken(auth)
// }

export const authChecker: AuthChecker<Context> = ({ context }) => {
    const userId = context.userId
    return !!userId
}