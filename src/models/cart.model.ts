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
        // Append `carItem`
        this.cartItems.push(ci);
    });

};

// Model
const cartModel: Model<CartDocument> = model<CartDocument, Model<CartDocument>>("Cart", cartSchema);
export default cartModel;
