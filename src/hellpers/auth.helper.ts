// This file contains helper related to authentication / authorization
import { RegisterInput, IUser, LoginInput } from "../types/auth";

/**
 * Reduce `RegisterInput` to `IUser`
 */
export const reduceRegisterInputToUser = (registerInput: RegisterInput): IUser => {
    // Exclude 'private' properties, e.g. : password
    const { password, ...user } = registerInput;

    return user;
}
/**
 * Reduce Data used inregistration to data used in login
 */
export const reduceRegisterInputToLoginInput = (registerInput: RegisterInput): LoginInput => {
    return {
        email: registerInput.email,
        password: registerInput.password,
    };
}
