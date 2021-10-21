// This file contain unit testing for cart model
import db from "../../../src/services/db.service";
import cartModel from "../../../src/models/cart.model"
import { Product } from "../../../src/types/common";
import { CartItem, Cart } from "../../../src/types/shop";
import * as productsTestLib from "../../testlibs/products.testlib";
import * as usersTestLib from "../../testlibs/users.testlib";

describe("Cart model unit tests", () => {
    // Variables to used between tests
    let cart1Id: String;
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // Drop cart collections
        await cartModel.collection.drop();
    });
    test.todo("Add 1 item to non existing cart");
    test("Add 3 items to non existing cart");
    test.todo("Add 2 items to existing cart");
    test.todo("Remove 2 items from existing cart")
    test.todo("Fetch any existing cart");
    afterAll(async (I) => {
        // Disconnect DB
        await db.disconnect();
    });
});
