import { Schema, model, Model } from "mongoose";
import { CartDocument, CartItem } from "../types/shop";

// Schema
const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cartItems: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            qty: Number,
        },
    ],
});

// Methods
cartSchema.methods.modifyCartItems = function modifyCartItems(cartItems: CartItem[]): void {
    // Iterate through `cartItems`
    cartItems.forEach(ci => {
        // Flag to indicate whether cart item / product is found in cart
        let isFound = false;

        // Iterate through the cart.cartItems
        for (let i = 0; i < this.cartItems.length; i++) {
            // Is the product found in cart ?
            if (ci.product.toString() === this.cartItems[i].product.toString()) {
                isFound = true;

                // Accumulate the `qty`
                this.cartItems[i].qty += ci.qty;

                break;
            }
        }

        // If the cart item / product not found in cart
        if (!isFound) {
            // Append `carItem`
            this.cartItems.push(ci);
        }
    });

};

// Model
const cartModel: Model<CartDocument> = model<CartDocument, Model<CartDocument>>("Cart", cartSchema);
export default cartModel;
