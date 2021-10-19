// This file contain user login test
import { gql } from "apollo-server";
import server from "../../../src/server";
import db from "../../../src/services/db.service";
import { LoginInput, UserSession } from "../../../src/types/auth";
import { user1 } from "../../testlibs/users.testlib";
import { sendLoginOperation } from "../../testlibs/common.testlib";

// Increase timeout
jest.setTimeout(9000);

const LOGIN = gql`
mutation userLogin($loginInput: LoginInput){
    login(loginInput: $loginInput) {
        token
    }
}
`;

describe("Mutation login", () => {
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // TODO Register user if needed

    });
    test("-Login with basic credential", async () => {
        // Receive `response.data.login` for the sent login operation
        const userSession: UserSession = await sendLoginOperation();

        console.log("received user session", userSession);

        // Assert `token` is truthy
        expect(userSession.token).toBeTruthy();
        // Assert `userSession` contains basic user info
        expect(userSession.name).toBeTruthy();
        expect(userSession.email).toBeTruthy();
    });
    afterAll(async () => {
        // Close DB connection
        await db.disconnect();
    });
});
