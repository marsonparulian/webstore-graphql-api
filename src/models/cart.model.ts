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
cartSchema.methods.modifyCartItems = function modifyCartItems(cartItems: CartItem[]): CartDocument {
    // Clone the current `cart.cartItems` as temporary result.
    let tempCartItems: CartItem[] = this.cartItems.map((ci: CartItem) => {
        return (({ product, qty }) => ({ product, qty }))(ci);
    });

    // Iterate through `cartItems`
    cartItems.forEach(ci => {
        // Flag to indicate whether cart item / product is found in cart
        let isFound = false;

        // Iterate through the temporary cart items
        for (let i = 0; i < tempCartItems.length; i++) {
            // Is the product found in cart ?
            if (ci.product.toString() === tempCartItems[i].product.toString()) {
                isFound = true;

                // Accumulate the `qty`
                tempCartItems[i].qty += ci.qty;

                break;
            }
        }

        // If the cart item / product not found in cart
        if (!isFound) {
            // Append `carItem`
            tempCartItems.push(ci);
        }
    });

    // Assign all non empty cart items to `this.cartItems`
    this.cartItems = tempCartItems.filter((ci) => ci.qty > 0);

    return this;

};

// Model
const cartModel: Model<CartDocument> = model<CartDocument, Model<CartDocument>>("Cart", cartSchema);
export default cartModel;
