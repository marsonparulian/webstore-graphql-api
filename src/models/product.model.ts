import { Document, Schema, model, Model } from "mongoose";
import { ProductDocument } from "../types/common";

// Define schema
const schema = new Schema<ProductDocument>({
    name: { type: String, required: true },
    description: { type: String, required: true },
});

// Create model
const Product = model<ProductDocument, Model<ProductDocument>>("Product", schema);
export default Product;
