// This file contains (user) `register` test
import { gql } from "apollo-server";
import server from "../../../src/server";
import db from "../../../src/services/db.service";
import * as userTestLib from "../../testlibs/users.testlib";
import userModel from "../../../src/models/user.model";
import { reduceRegisterInputToUser } from "../../../src/hellpers/auth.helper";
const REGISTER = gql`
    mutation register($registerInput : RegisterInput ) {
        register(registerInput: $registerInput){
            name
            email
        }
    }
`;
describe("Mutation register", () => {
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // Drop collection
        await userModel.collection.drop();
    });
    test("Register user with basic data", async () => {
        // User to be saved
        const user = userTestLib.user1;

        // Execute operation
        const response = await server.executeOperation({
            query: REGISTER,
            variables: {
                registerInput: user,
            }
        });

        // Assert no `response.errors`
        expect(response.errors).toBeUndefined();

        // Assert the `response.data` will contain the user
        expect(response?.data?.register).toEqual(expect.objectContaining(
            reduceRegisterInputToUser(user)
        ));

        // Assert the user saved in DB
    });
    afterAll(async () => {
        // Disconnect DB
        await db.disconnect();
    });
});
