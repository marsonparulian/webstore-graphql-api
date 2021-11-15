// This file contains common utilities for testing
import { gql } from "apollo-server";
import server from "../../src/server";
import db from "../../src/services/db.service";
import { reduceRegisterInputToLoginInput } from "../../src/hellpers/auth.helper";
import UserModel from "../../src/models/user.model";
import { RegisterInput, LoginInput, UserSession } from "../../src/types/auth";
import * as usersTestLib from "./users.testlib";

/** Operation used to login */
const LOGIN_OPERATION = gql`
mutation userLogin($loginInput : LoginInput){
    login(loginInput: $loginInput) {
        _id
        name
        email
        token
    }
}
`;

/**
 * Send login operation with any user registered in DB. If no users exist in DB, will used user provided in argument.
 * @param user {RegisterInput} - User that will be used to login if no user exist in DB
 * @return {UserSession} - `Response.data.login` from login operation.
 */
export const sendLoginOperation = async (alternativeUser: RegisterInput = usersTestLib.user2): Promise<any> => {
    // This will be the return value
    let userSession: UserSession | null = null;
    try {
        // This will be the user who will login. Temporarily point to alternative user
        let user: RegisterInput = alternativeUser;

        // Fetch any user from DB
        const fetchedUser = await UserModel.findOne().lean();

        // Any user exist in DB ?
        if (fetchedUser) {
            // Iterate users from testlib to find matching user
            const userData = Object.values(usersTestLib).find((u) => {
                // User is matched if email is truthy & has the same email
                return u.email && fetchedUser?.email === u.email;
            });

            // If found, assign to the `user`
            if (userData) user = userData;
            else throw (new Error("No matching user found in testlib"));

        } else {
            // No user exist in DB. Use the provided user
            user = alternativeUser;

            // TODO Register the new user
        }

        // Reduce `RegisterInput` to `LoginInput`
        const loginInput: LoginInput = reduceRegisterInputToLoginInput(user);

        // Execute login operation
        const response = await server.executeOperation({
            query: LOGIN_OPERATION,
            variables: {
                loginInput,
            }
        });

        // Throw error if `response.errors`
        if (response.errors) {
            console.error("Response.errors after send login operation", response.errors);
            throw new Error("Failed login");
        }

        userSession = response?.data?.login;
    } finally {
        // Return the `response.data.login`
        // return response?.data?.login;
        return userSession;
    }
}
