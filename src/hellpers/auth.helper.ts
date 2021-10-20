// This file contains helper related to authentication / authorization
import { RegisterInput, IUser, LoginInput, UserDocument } from "../types/auth";

/**
 * Reduce Data used inregistration to data used in login
 */
export const reduceRegisterInputToLoginInput = (registerInput: RegisterInput): LoginInput => {
    return {
        email: registerInput.email,
        password: registerInput.password,
    };
}
/**
 * Reduce / convert `UserDocument` to `User`
 */
export const reduceUserDocumentToUser = (doc: UserDocument): IUser => {
    const { _id, name, email } = doc;
    return {
        _id,
        name,
        email,
    }
}
