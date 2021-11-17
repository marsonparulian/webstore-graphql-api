// This file contains logic  related to `Cart`
import { MongoDataSource } from "apollo-datasource-mongodb"
import CartModel from "../models/cart.model";
import { IContext } from "../types/common";
import { CartDocument, CartItem } from "../types/shop";
import * as texts from "../statics/text.static";

class Carts extends MongoDataSource<CartDocument, IContext> {
    /**
     * Modify  Cart by user
     * @param userId - User id  that owns the cart 
     * @param cartItems - Array of cart item (cart item modifiers) that will add / reduce the cart items in the cart.
     * @return - Cart as saved in DB
     */
    async modifyCart(userId: string, cartItems: CartItem[]): Promise<CartDocument> {
        // Reject is `userId` is falsy
        if (!userId) return Promise.reject("User id is required");

        // Fetch cart document from DB by user
        let cart: null | CartDocument = await CartModel.findOne({ user: userId });

        // If no cart in DB, create a new one
        if (!cart) cart = new CartModel({
            user: userId,
        });

        // Modify & save the cart
        cart.modifyCartItems(cartItems);
        await cart.save();

        // Populate
        await cart.populate("user");
        await cart.populate({
            path: "cartItems.product",
            model: "Product",
        });

        // Returnt the current cart
        return cart;
    }
}
export default Carts;
