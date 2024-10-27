import axios, { Axios } from "axios";
import type { NextFunction, Request, Response } from "express";
export const authHttp = axios.create({
    baseURL: import.meta.env.AUTH_API_URL,
    headers: {
        "Content-type": "application/json",
        Accept: "application/json"
    }
});

export interface User {
    username: string;
    home_town: string;
    university: string;
}

/*
Вообще у нас планировалось gRPC для общения двух "микросервисов" но и я и арсений устали так что поэтому обойдёмся этим
*/
export async function me(token: string): Promise<User> {
    const resp = await authHttp.get("/api/v1/me", {headers: {Authorization: `Bearer ${token}`}});
    return resp.data;
}

export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await me(req.headers.authorization || "none");
        // @ts-ignore
        req.user = user;
        next();
    }
    catch (e) {
        return res.status(401).json({error: "Unauthorized"});
    }
}

export const userFromReq = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    return req.user as User;
}