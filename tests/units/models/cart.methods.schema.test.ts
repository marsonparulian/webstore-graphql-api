// This file contains unit tests for `Cart` schema methods
import db from "../../../src/services/db.service";
import "dotenv/config";
import CartModel from "../../../src/models/cart.model"
import ProductModel from "../../../src/models/product.model";
import { Product, ProductDocument } from "../../../src/types/common";
import { CartDocument, Cart, CartItem } from "../../../src/types/shop";
import * as productsTestlib from "../../testlibs/products.testlib";

// Increase timeout
jest.setTimeout(12000);

describe("Unit test for Cart schema methods", () => {
    // Products in DB to be used between test cases
    let productsInDb: ProductDocument[] = [];
    beforeAll(async () => {
        // Connect to DB
        await db.connect();

        // Fetch products from DB
        productsInDb = await ProductModel.find().lean();
    });
    describe("`modifyCartItems` method", () => {
        // variable below will be used between test cases
        let cart: CartDocument;
        test("Add 1 cart item to empty cart", () => {
            // Init cart
            const cart = new CartModel();

            // Add cart item
            const cartItem = {
                product: productsInDb[0]._id.toString(),
                qty: 5,
            };
            cart.modifyCartItems([cartItem]);

            // Assert cart.cartItems has 1 member
            expect(cart.cartItems.length).toBe(1);
            // Assert the cart item in cart.cartItems is correct
            const insertedCartItem = cart.cartItems[0];
            expect(insertedCartItem.product.toString()).toBe(cartItem.product);
            expect(insertedCartItem.qty).toBe(cartItem.qty);

        });
        test("Add 3 cart items to empty cart", async () => {
            // Init Cart, will also be used in next tests
            cart = new CartModel();

            // Init cartItems to be added to cart
            const cartItems: CartItem[] = [
                {
                    product: productsInDb[0]._id.toString(),
                    qty: 1,
                }, {
                    product: productsInDb[1]._id.toString(),
                    qty: 2,
                }, {
                    product: productsInDb[2]._id.toString(),
                    qty: 3,
                },
            ];

            // Add to cart
            cart.modifyCartItems(cartItems);

            // Assert cart.cartItems has 3 members
            expect(cart.cartItems.length).toBe(cartItems.length);
            // Assert each of the added cartItems exist in `cart.cartItemss`
            cartItems.forEach(ci => {
                // Is the cartItem found in cart.cartItems ?
                const isFound = cart.cartItems.find(ci2 => {
                    return ci.product === ci2.product.toString()
                        && ci.qty === ci2.qty;
                });
                // if not found, throw exception
                if (!isFound) throw new Error(`Product not found in cart.cartItems, product id : ${ci.product} and qty : ${ci.qty}`)

            });
        });
        test("add 2 cart items to non empty cart with no overlapping products (Additional product not yet exist in the cart)", async () => {
            // Assert the cart is not empty
            const numberOfPreexistingCartItems = cart.cartItems.length;
            expect(cart.cartItems.length).toBeGreaterThan(0);

            // Init cartItems to be added to cart
            const cartItems: CartItem[] = [
                {
                    product: productsInDb[3]._id.toString(),
                    qty: 4,
                }, {
                    product: productsInDb[4]._id.toString(),
                    qty: 5,
                }
            ];

            // Assert none of the cartItems' product already exist in the cart
            cartItems.forEach((ci) => {
                // Is found in cart.cartItems ?
                const isFound = cart.cartItems.find((ci2) => {
                    return ci.product === ci2.product.toString();
                });
                // If found, throw exception
                if (isFound) throw new Error(`Product has exist in the cart. Will add product with id : ${ci.product} and qty: ${ci.qty}`);
            });

            // Add to cart
            cart.modifyCartItems(cartItems);

            // Assert the number of cart.cartItems is the sume of preexisting and additional cartItems.
            expect(cart.cartItems.length).toBe(numberOfPreexistingCartItems + cartItems.length);
            // Assert each of the added cartItems is exist in the cart
            cartItems.forEach((ci) => {
                // Is the cartItem.product found in cart.cartItems & qty are the same?
                const isFound = cart.cartItems.find((ci2) => {
                    return ci.product === ci2.product.toString()
                        && ci.qty > 0;
                });

                // If not found & matc, throw exception
                if (!isFound) throw new Error(`Product not found or not match. product id: ${ci.product} `);
            });
        });
        test("Add 3 cart items to non empty cart with 2 overlapping products", async () => {
            // Copy the current     `cart.cartItems` to be matched with the result later
            const prevCartItems = cart.cartItems.map((ci) => {
                // Clone the cart item on specific attributes
                return (({ product, qty }) => ({ product, qty }))(ci)
            });

            // Init the cartItems with 2 overlapping products & 1 non existing product
            const cartItems: CartItem[] = [
                // Existing product in cart
                {
                    product: productsInDb[2]._id.toString(),
                    qty: 4,
                }, {
                    product: productsInDb[4]._id.toString(),
                    qty: 4,
                },
                // Product not exist in cart
                {
                    product: productsInDb[5]._id.toString(),
                    qty: 4,
                }
            ];

            // Put the cartItems to cart
            cart.modifyCartItems(cartItems);

            // Assert cart.cartItems.length is 5+1
            expect(cart.cartItems.length).toBe(6);
            // Assert each of the added cartItems exist in cart 
            cartItems.forEach((ci) => {
                // Is the cart item found in cart ?
                const isFound = cart.cartItems.find((ci2) => {
                    return ci.product === ci2.product.toString();
                });

                // If not found, throw exception
                if (!isFound) throw new Error("Carst item / product is not found in cart");
            });
            // Iterate through each of cart.cartItems. The `qty` should be correct.
            cart.cartItems.forEach((ci) => {
                // `qty` to be compare with the `qty` in the current cart.
                let qty = 0;

                // We are going to iterate through the previous cart.CartItems and the added cartItems
                // Everytime found the matching product, the `qty` will be accumulated and the final `qty` should be the result of the current `qty` in cart.cartItem`.
                [prevCartItems, cartItems].forEach((list) => {
                    list.find((ci2) => {
                        // Is the product found ?
                        if (ci.product.toString() === ci2.product.toString()) {
                            qty += ci2.qty;
                            return true;
                        }
                        return false;
                    });
                });

                // Assert the `qty` of the current cart
                expect(ci.qty).toBe(qty);

            });
        });
        test.todo("Reduce 2 cart items to non empty cart ");
        test.todo("Reduce 2 cart items until 0 (no longer exist in cart");
    });
});
