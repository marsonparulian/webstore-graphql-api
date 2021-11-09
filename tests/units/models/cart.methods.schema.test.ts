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
        test("Reduce 2 cart items from non empty cart ", async () => {
            // Will reduce cartItems from cart with index 1 and 3 by 1 and 3
            const cartItems = [
                {
                    product: cart.cartItems[1].product.toString(),
                    qty: -1,
                }, {
                    product: cart.cartItems[3].product.toString(),
                    qty: -3,
                }
            ];

            // Clone the current cart.cartItems to create the expected cart.cartItems (after reduced)
            let expectedCartItems: CartItem[] = cart.cartItems.map(ci => {
                return (({ product, qty }) => ({ product, qty }))(ci);
            });
            //  Change the expected `qty`
            expectedCartItems[1].qty += cartItems[0].qty;
            expectedCartItems[3].qty += cartItems[1].qty;

            // Modify the cart.cartItems
            cart.modifyCartItems(cartItems);

            // Assert the number of cart.cartItems is still the same
            expect(cart.cartItems.length).toBe(expectedCartItems.length);
            // Assert each cart.cartItems match the expected cart items
            for (let i = 0; i < cart.cartItems.length; i++) {
                const ci = cart.cartItems[i];
                expect(ci.product.toString()).toBe(expectedCartItems[i].product.toString());
                expect(ci.qty).toBe(expectedCartItems[i].qty);
            }
        });
        test("Reduce 2 cart items until 0 (no longer exist in cart", async () => {
            // Verify cart.cartItems has 6 elements
            expect(cart.cartItems.length).toBe(6);

            // Create cartItems that will remove `cart.cartItems` with index 1 and 5
            const indexToRemove = [1, 5];
            let cartItems: CartItem[] = [];
            indexToRemove.forEach((i) => {
                cartItems.push({
                    product: cart.cartItems[i].product.toString(),
                    qty: -999,
                });
            });

            // Create expected cart items by filter the `indexToRemove`.
            const expectedCartItems: CartItem[] = cart.cartItems.filter((ci, i) => {
                if (indexToRemove.includes(i)) {
                    return false;
                }
                return true;
            });

            // Modify the cart items
            cart.modifyCartItems(cartItems);

            // Assert the number of `cart.cartItems` elements has been reduced by 2.
            expect(cart.cartItems.length).toBe(4);
            // Assert the current `cart.cartItems` match the expected result.
            cart.cartItems.forEach((ci, i) => {
                // Assert each element
                expect(ci.product.toString()).toBe(expectedCartItems[i].product.toString());
                expect(ci.qty).toBe(expectedCartItems[i].qty);
            });
        });
    });
});
