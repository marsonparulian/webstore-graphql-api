// This file contain unit testing for cart model
import db from "../../../src/services/db.service";
import cartModel from "../../../src/models/cart.model"
import userModel from "../../../src/models/user.model";
import * as authHelper from "../../../src/hellpers/auth.helper";
import productModel from "../../../src/models/product.model";
import { Product, ProductInput } from "../../../src/types/common";
import { CartItem, Cart } from "../../../src/types/shop";
import * as productsTestLib from "../../testlibs/products.testlib";
import * as usersTestLib from "../../testlibs/users.testlib";
import { IUser, UserDocument } from "../../../src/types/auth";
import "dotenv/config";

jest.setTimeout(1100);

describe("Cart model unit tests", () => {
    // Variables to used between tests
    let cart1Id: String;
    // Any user in DB
    let user: IUser;
    // Products in DB
    let products: Product[] = [];
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // Drop cart collections
        await cartModel.collection.drop();

        // Fetch any user
        let userDocument: UserDocument | null = await userModel.findOne();
        // User not exist ?
        if (!userDocument) {
            // Save new user
            userDocument = new userModel(usersTestLib.user3);
            await userDocument.save();
        }
        user = authHelper.reduceUserDocumentToUser(userDocument);

        // Drop product collection
        await productModel.collection.drop();
        // Inser many products
        await productModel.insertMany(Object.values(productsTestLib));
    });
    test("Add 1 item to non existing cart", async () => {
        // Fetch user
    });
    test.todo("Add 3 items to non existing cart");
    test.todo("Add 2 items to existing cart");
    test.todo("Remove 2 items from existing cart")
    test.todo("Fetch any existing cart");
    afterAll(async () => {
        // Disconnect DB
        await db.disconnect();
    });
});
