// Mongoose `User` model
import { Schema, model, Model } from "mongoose";
import { UserDocument } from "../types/auth";

// Define schema
const schema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
});

// Create model
const userModel = model<UserDocument, Model<UserDocument>>("User", schema);
export default userModel;
