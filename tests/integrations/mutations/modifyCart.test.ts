// This file contains integration tests for `mutation.modifyCart`
import { gql } from "apollo-server";
import mockHttp from "node-mocks-http";
import server from "../../../src/server";
import dbService from "../../../src/services/db.service";
import { sendLoginOperation } from "../../testlibs/common.testlib";
import * as texts from "../../../src/statics/text.static";

// Increase timeout
jest.setTimeout(12000);

const MODIFY_CART_ = gql`
mutation modifyCart {
    modifyCart{
        userId
    }
}
`;
describe("Integration test : modifyCart", () => {
    // User id to be used between tests
    let userId: string;
    beforeAll(async () => {
        // Connect to DB
        await dbService.connect();

        // Get a user id to simulate the logged in user

    });
    test("Modify cart with no authentication token", async () => {
        // Execute operation
        const response = await server.executeOperation({
            query: MODIFY_CART_,
        });

        // Response.errors[0].message should contain 'Unauthorized' message.
        if (response?.errors
            // && response.errors[0]
            && response.errors[0]?.message) {
            expect(response.errors[0].message).toBe(texts.UNAUTHORIZED);
        } else {
            console.error("response.errors : ", response.errors);
            throw new Error("Should respond with 'Unauthorized' message");
        }
    });
    // test.todo("Modify cart with invalid authentication token");
    // test.todo("Add 2 item to non existing cart");
    // test.todo("Add 1 item cart to empty cart");
    // test.todo("Add 3 cart items to empty cart ");
    // test.todo("Add 2 cart items to non empty cart");
    // test.todo("Add 2 existing cart items & 1 non existing cart item");
    // test.todo("Reduce 2 cart items (the final qty > 0)");
    // test.todo("Remove 2 cart items from cart");
    // test.todo("Remove cart items from non existing cart");
    afterAll(async () => {
        // Disconnect DB
        await dbService.disconnect();
    });
});
