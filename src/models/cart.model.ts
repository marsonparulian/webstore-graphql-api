import { Schema, model, Model } from "mongoose";
import { CartDocument } from "../types/shop";

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


// Model
const cartModel: Model<CartDocument> = model<CartDocument, Model<CartDocument>>("Cart", cartSchema);
export default cartModel;
