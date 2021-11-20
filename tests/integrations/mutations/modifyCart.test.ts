// This file contains integration tests for `mutation.modifyCart`
import { gql } from "apollo-server";
import mockHttp from "node-mocks-http";
import server from "../../../src/server";
import dbService from "../../../src/services/db.service";
import ProductModel from "../../../src/models/product.model"
import CartModel from "../../../src/models/cart.model";
import { CartDocument, CartItem, Cart } from "../../../src/types/shop";
import { ProductDocument } from "../../../src/types/common";
import { UserSession } from "../../../src/types/auth";
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
    // User session (acquired upon login) to be used between test
    let userSession: UserSession;
    // Product documents in DB to be used between tests.
    let productsInDb: ProductDocument[] = [];
    beforeAll(async () => {
        // Connect to DB
        await dbService.connect();

        // Fetch product documents from DV
        productsInDb = await ProductModel.find().lean();

        // execute `login` operation to get auth token & userId
        userSession = await sendLoginOperation();
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
    test("Add 1 item cart to empty cart", async () => {
        // Delete the user's cart in DB
        await CartModel.deleteOne({ user: userId });

        // Assert the cart is deleted
        const initialCartInDb: null | CartDocument = await CartModel.findById(userId);
        expect(initialCartInDb).toBeNull();

        // Init `1 cart item to be added to the cart`
        const cartItemInput: CartItem[] = [{
            product: productsInDb[3]._id.toString(),
            qty: 5,
        }];

        // Create context function parameter
        const contextParam = mockHttp.createMocks({
            headers: {
                authorization: authToken,
            }
        });

        // Execute `modifyCart` operation
        const response = await server.executeOperation({
            query: MODIFY_CART,
            variables: {
                cartItemModifiers: cartItemInput,
            }
        }, contextParam);

        // Assert there is not errors in response
        expect(response.errors).toBeFalsy();

        // Assert the expected response
        const responseCart: Cart = response.data.modifyCart as Cart;
        expect(responseCart._id).toBeTruthy();
        expect(responseCart.user).toEqual(expect.objectContaining({
            _id: userSession._id,
            name: userSession.name,
            email: userSession.email,
        }));
        // Assert does the response cart has the cart item added
        expect(responseCart.cartItems.length).toBe(1);
        expect(responseCart.cartItems[0]).toEqual(expect.objectContaining({
            qty: cartItemInput[0].qty,
            product: expect.objectContaining({
                _id: cartItemInput[0].product,
                name: expect.any(String),
            }),
        }));

        // Fetch the current cart directly from DB
        const currentCartInDb: null | Cart = await CartModel.findOne({ user: userSession._id });
        if (currentCartInDb === null) throw new Error("Current cart not found in DB (code: 351");

        // Assert the cart in DB has the expected values
        const userIdInResponseCart: string = typeof responseCart.user === "string" ? responseCart.user : responseCart.user._id;
        expect(currentCartInDb._id.toString()).toBe(responseCart._id);
        expect(currentCartInDb.user.toString()).toBe(userIdInResponseCart);
        // Assert the added cart item is saved in DB
        const cartItem0InResponseCart: CartItem = responseCart.cartItems[0];
        const productId0InResponseCart: string = typeof cartItem0InResponseCart.product === "string" ? cartItem0InResponseCart.product : cartItem0InResponseCart.product._id;
        expect(currentCartInDb.cartItems.length).toBe(responseCart.cartItems.length);
        expect(currentCartInDb.cartItems[0].product.toString()).toBe(productId0InResponseCart);
        expect(currentCartInDb.cartItems[0].qty).toBe(cartItem0InResponseCart.qty);
    });
    test("Add 3 cart items to empty cart ", async () => {
        // Delete all the user's carts
        await CartModel.deleteMany({ user: userSession._id });

        // Save an empty cart for the user
        const emptyCart: CartDocument = new CartModel({
            user: userSession._id,
        });
        await emptyCart.save();

        // Assert the user already has an empty cart saved in DB
        const savedEmptyCart: null | CartDocument = await CartModel.findOne({ user: userSession._id });
        if (savedEmptyCart === null) throw new Error("Could find the saved empty cart (code 325");
        // Assert the ampty cart's `cartItem` is an empty array.
        expect(savedEmptyCart.cartItems).toEqual(expect.any(Array));
        expect(savedEmptyCart.cartItems.length).toBe(0);

        // Init 3 cart items to be send via GraphQL operation
        const cartItemInputs: CartItem[] = [{
            product: productsInDb[4]._id.toString(),
            qty: 10,
        }, {
            product: productsInDb[5]._id.toString(),
            qty: 11,
        }, {
            product: productsInDb[6]._id.toString(),
            qty: 12,
        }];

        // Include autthToken in context function param
        const contextParam = mockHttp.createMocks({
            headers: {
                authorization: authToken,
            }
        });

        // Execute operation
        const response = await server.executeOperation({
            query: MODIFY_CART,
            variables: {
                cartItemModifiers: cartItemInputs,
            }
        }, contextParam);

        // Assert the response contains no errors
        expect(response.errors).toBeFalsy();

        // Assert the cart from response
        const responseCart: Cart = response.data.modifyCart as Cart;
        // Response should have truthy `_id`
        expect(responseCart._id).toBeTruthy();
        // Response should have the right user
        expect(responseCart.user).toEqual(expect.objectContaining({
            _id: userSession._id,
            name: userSession.name,
            email: userSession.email,
        }));
        // Response should have the matching cart items
        cartItemInputs.forEach((ci: CartItem) => {
            expect(responseCart.cartItems).toEqual(expect.arrayContaining([
                {
                    _id: expect.any(String),
                    qty: ci.qty,
                    product: expect.objectContaining({
                        _id: ci.product,
                    }),
                }
            ]));
        });

        // Fetch cart in DB
        const cartInDb: null | Cart = await CartModel.findOne({ user: userSession._id });
        if (cartInDb === null) throw new Error("Could not find the cart in DB (code : 482)");

        // Cart the DB should have the right `_id`
        expect(cartInDb._id.toString()).toBe(responseCart._id);
        // Cart in DB should have the exact cart item
        cartItemInputs.forEach((ci) => {
            // Is the car titem found in `cartInDb`
            const isFound = cartInDb.cartItems.find((ci2: CartItem) => {
                return ci.qty === ci2.qty
                    && ci.product === ci2.product.toString();
            });

            // Throw error if the product item not found in DB
            if (!isFound) throw new Error("The cart item is not found in DB (code : 285)");
        });
    });
    // Note : tests below are not mandatory, because they have been partially tested in `CartModel.methods.modifyCart`.
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
