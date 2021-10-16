// This file contain authentication-related type definitions
import { Document } from "mongoose";

/** Data submitted when user register */
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}
/** Representing a user, excluding 'private' info e.g.: password */
export interface IUser {
    name: string;
    email: string;
}
/** User document saved in DB */
export type UserDocument = IUser & Document & { password: string };
