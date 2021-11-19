// This file contains integration tests for `mutation.modifyCart`
import { gql } from "apollo-server";
import mockHttp from "node-mocks-http";
import server from "../../../src/server";
import dbService from "../../../src/services/db.service";
import ProductModel from "../../../src/models/product.model"
import CartModel from "../../../src/models/cart.model";
import { CartDocument, CartItem } from "../../../src/types/shop";
import { ProductDocument } from "../../../src/types/common";
import { sendLoginOperation } from "../../testlibs/common.testlib";
import * as texts from "../../../src/statics/text.static";

// Increase timeout
jest.setTimeout(14000);

const MODIFY_CART = gql`
mutation modifyCart($cartItemModifiers :[CartItemModifier]) {
    modifyCart(cartItemModifiers: $cartItemModifiers){
        _id
        user{
            _id
            name
            email
        }
        cartItems{
            _id
            product{
                _id
                name
                description
            }
            qty
        }
    }
}
`;
describe("Integration test : modifyCart", () => {
    // User id to be used between tests
    let userId: string;
    // Auth token to be used between tests
    let authToken: string = "";
    // Product documents in DB to be used between tests.
    let productsInDb: ProductDocument[] = [];
    beforeAll(async () => {
        // Connect to DB
        await dbService.connect();

        // Fetch product documents from DV
        productsInDb = await ProductModel.find().lean();

        // execute `login` operation to get auth token & userId
        const userSession = await sendLoginOperation();
        userId = userSession._id;
        authToken = userSession.token;
    });
    it("User id should be truthy", () => {
        expect(userId).toBeTruthy();
    });
    it("Auth token should be truthy", () => {
        expect(authToken).toBeTruthy();
    });
    it("Fetched product documents from DB should have at least 7 members", () => {
        expect(productsInDb.length).toBeGreaterThan(7);
    });
    test("Modify cart with no authentication token", async () => {
        // Execute operation
        const response = await server.executeOperation({
            query: MODIFY_CART,
        });

        // Response.errors[0].message should contain 'Unauthorized' message.
        if (response?.errors
            && response.errors[0]?.message) {
            expect(response.errors[0].message).toBe(texts.UNAUTHORIZED);
        } else {
            console.error("response.errors : ", response.errors);
            throw new Error("Should respond with 'Unauthorized' message");
        }
    });
    test("Modify cart with invalid authentication token", async () => {
        // Init invalid token
        const token = "invalidToken";

        // Mock context function's argument with invalid token
        const contextArg = mockHttp.createMocks({
            headers: {
                authorization: token,
            }
        });

        // Execute operation
        const response = await server.executeOperation({
            query: MODIFY_CART,

        }, contextArg);

        // Response.errors[0] should contain 'unauthenticated' message
        if (response.errors
            && response.errors[0]?.message) {
            // Assert the mesage
            expect(response.errors[0].message).toBe(texts.UNAUTHORIZED);
        } else {
            // Response.errors does not have the expected format
            throw new Error("Response.errors does not have the expected format");
        }
    });
    test("Add 2 item to non existing cart", async () => {
        // Delete the user's carts
        await CartModel.deleteMany({ user: userId }).lean()
            .catch((e: any) => {
                console.error("failed deleting cart at the start of test");
            });
        // Call to DB to make sure the user does not have any cart yet
        const initialCartInDb: CartDocument = await CartModel.findOne({ user: userId }).populate("user").lean();
        if (initialCartInDb) throw new Error("Should not found initial cart in DB");

        // Init cartItem (cartItemModifiers) to be added to cart
        const cartItemModifiers: CartItem[] = [{
            product: productsInDb[0]._id.toString(),
            qty: 2,
        }, {
            product: productsInDb[1]._id.toString(),
            qty: 3,
        }];

        // Create context function arguments to include auth token
        const contextArg = mockHttp.createMocks({
            headers: {
                authorization: authToken,
            }
        });

        // execute operation to modify cart
        const responseModifyCart = await server.executeOperation({
            query: MODIFY_CART,
            variables: {
                cartItemModifiers
            }
        }, contextArg);

        // Assert `response` has no errors
        expect(responseModifyCart.errors).toBeFalsy();

        // Assert the response has cart matching the cartItemModifiers
        const responseCart = responseModifyCart.data?.modifyCart;
        if (!responseCart) throw new Error("Could not find cart returned by 'modifyCart' operation");
        expect(responseCart._id).not.toBeFalsy();
        expect(responseCart.cartItems.length).toBe(cartItemModifiers.length);
        cartItemModifiers.forEach((ci) => {
            // Is found in the response ?
            const isFound = responseCart.cartItems.find((ci2: any) => {
                return ci.qty === ci2.qty
                    && ci.product.toString() === ci2.product._id;
            });
            // If not found, throw error
            if (!isFound) throw new Error("Can not found the added cartItemModifiers in the respopnse (cart.cartItems)");
        });
        // All products in the response should have `name` and `description`
        responseCart.cartItems.forEach((ci: any) => {
            expect(ci.product.name).toBeTruthy();
            expect(ci.product.description).toBeTruthy();
        });

        // Fetch the current  cart from DB
        const currentCartInDb: null | CartDocument = await CartModel.findById(responseCart._id);
        if (!currentCartInDb) throw new Error("Could not find the saved cart in DB");

        // Assert the cart (fetched by GraphQL) match the cart directly fetch from DB
        expect(responseCart._id).toBe(currentCartInDb._id.toString());
        expect(responseCart.user._id).toBe(currentCartInDb.user.toString());
        // Assert the cart items from response matched cart item saved in DB
        currentCartInDb.cartItems.forEach((ci: any) => {
            // Check if current item exist in response
            const isFound = responseCart.cartItems.find((ci2: any) => {
                return ci.qty === ci2.qty
                    && ci.product.toString()
                    === ci2.product._id;
            });

            // If not found, throw exception
            if (!isFound) throw ("Cart item from DB is not found in the response");
        });
    });
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
