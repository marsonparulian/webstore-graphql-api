// This file contains integration tests for `mutation.modifyCart`
import { gql } from "apollo-server";
import dbService from "../../../src/services/db.service";
import { sendLoginOperation } from "../../testlibs/common.testlib";

// Increase timeout
jest.setTimeout(1200);

describe("Integration test : modifyCart", () => {
    // User id to be used between tests
    let userId: string;
    beforeAll(async () => {
        // Connect to DB
        await dbService.connect();

        // Get a user id to simulate the logged in user

    });
    test.todo("Modify cart with no authentication token");
    test.todo("Modify cart with invalid authentication token");
    test.todo("Add 2 item to non existing cart");
    test.todo("Add 1 item cart to empty cart");
    test.todo("Add 3 cart items to empty cart ");
    test.todo("Add 2 cart items to non empty cart");
    test.todo("Add 2 existing cart items & 1 non existing cart item");
    test.todo("Reduce 2 cart items (the final qty > 0)");
    test.todo("Remove 2 cart items from cart");
    test.todo("Remove cart items from non existing cart");
    afterAll(async () => {
        // Disconnect DB
        await dbService.disconnect();
    });
});
