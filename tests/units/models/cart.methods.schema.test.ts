// This file contains unit tests for `Cart` schema methods
import CartModel from "../../../src/models/cart.model"
import { Product } from "../../../src/types/common";
import { Cart, CartItem } from "../../../src/types/shop";
import * as productsTestlib from "../../testlibs/products.testlib";

describe("Unit test for Cart schema methods", () => {
    describe("`modifyCartItems` method", () => {
        test.todo("Add 1 cart item to empty cart");
        test.todo("Add 3 cart items to empty cart")
        test.todo("add 2 cart items to non empty cart with no overlapping products (Additional product not yet exist in the cart)")
        test.todo("Add 3 cart items to non empty cart with 2 overlapping products");
        test.todo("Reduce 2 cart items to non empty cart ");
        test.todo("Reduce 2 cart items until 0 (no longer exist in cart");
    });
});
