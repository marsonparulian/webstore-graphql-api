// This file contains helper related to authentication / authorization
import { RegisterInput, IUser } from "../types/auth";

/**
 * Reduce `RegisterInput` to `IUser`
 */
export const reduceRegisterInputToUser = (registerInput: RegisterInput): IUser => {
    // Exclude 'private' properties, e.g. : password
    const { password, ...user } = registerInput;

    return user;
}
