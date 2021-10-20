// This file contain authentication-related type definitions
import { Document } from "mongoose";

/** Public compact version of a user */
export interface IUser {
    name: string;
    email: string;
}
/** User secret used in registration */
interface RegisterSecret {
    password: string;
}
/** Data submitted when user register */
export type RegisterInput = IUser & RegisterSecret;

/** User document saved in DB */
export type UserDocument = RegisterInput & Document;

/** login form input */
export interface LoginInput {
    email: string!;
    password: string!;
}
export type UserSession = IUser & {
    token: string;
}
