// This file contain unit testing for cart model
import db from "../../../src/services/db.service";
import CartModel from "../../../src/models/cart.model"
import userModel from "../../../src/models/user.model";
import * as authHelper from "../../../src/hellpers/auth.helper";
import ProductModel from "../../../src/models/product.model";
import { Product, ProductInput } from "../../../src/types/common";
import { CartItem, Cart, CartDocument } from "../../../src/types/shop";
import * as productsTestLib from "../../testlibs/products.testlib";
import * as usersTestLib from "../../testlibs/users.testlib";
import { IUser, UserDocument } from "../../../src/types/auth";
import "dotenv/config";

jest.setTimeout(1400);

describe("Cart model unit tests", () => {
    // Cart to be used as reference between test
    let cart: Cart;
    // Any user in DB
    let user: IUser;
    // Products in DB
    let products: Product[] = [];
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // Drop cart collections
        await CartModel.collection.drop();

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
        await ProductModel.collection.drop();
        // Insert many products
        products = await ProductModel.insertMany(Object.values(productsTestLib));
    });
    test("Add 1 item to non existing cart", async () => {
        // Construct cart
        const cart = new CartModel({
            user: user._id,
            cartItems: [],
        });

        // add cart item
        cart.cartItems.push({
            product: products[0]._id,
            qty: 1,
        });

        // Save cart
        await cart.save();

        // Fetch the cart
        const fetchedCart = await CartModel.findById(cart._id);

        // Assert the cart is found
        if (!fetchedCart) throw new Error("Cart is not found");
        // Assert cart prop values
        expect(fetchedCart.user.toString()).toBe(user._id.toString());
        // Assert the cart items
        expect(fetchedCart.cartItems).toEqual(expect.any(Array));
        expect(fetchedCart.cartItems.length).toBe(cart.cartItems.length);
        expect(fetchedCart.cartItems[0].product.toString()).toBe(cart.cartItems[0].product.toString());
        expect(fetchedCart.cartItems[0].qty).toBe(cart.cartItems[0].qty);
    });
    test("Add 3 items to non existing cart", async () => {
        // Define the cart items to be saved
        const cartItems: CartItem[] = [
            { product: products[1]._id, qty: 2 },
            { product: products[2]._id, qty: 3 },
            { product: products[3]._id, qty: 4 },
        ];

        // Construct the cart
        const cartDocument: CartDocument = new CartModel({
            user: user._id,
            cartItems,
        });

        // Save the cart
        cart = await cartDocument.save();

        // Fetch the saved cart
        const fetchedCart = await CartModel.findById(cart._id);

        // Assert the cart is found
        if (!fetchedCart) throw new Error("Saved cart is not found");

        // Assert the user is saved
        expect(fetchedCart.user.toString()).toBe(cart.user.toString());

        // Assert the number of cart items are the same
        expect(fetchedCart.cartItems.length).toBe(cart.cartItems.length);
        // Iterate through the cart items (before saved)
        cart.cartItems.forEach((i) => {
            // Assert the cart item existed in the fetched cart
            const foundCartItem = fetchedCart.cartItems.find((fetchedItem) => {
                return i.product.toString() === fetchedItem.product.toString();
            });

            if (!foundCartItem) throw new Error("Cart item with product id is not found");
            // Has the save quantity ?
            expect(foundCartItem.qty).toBe(i.qty);

        })
    });
    test("Add 2 items to existing cart", async () => {

    });
    test.todo("Remove 2 items from existing cart")
    test.todo("Fetch any existing cart");
    afterAll(async () => {
        // Disconnect DB
        await db.disconnect();
    });
});
