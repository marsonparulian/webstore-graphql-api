// This file contains type declaration related to shopping
import { Document } from "mongoose";
import { Product } from "./common";
import { IUser } from "./auth"

export interface CartItem {
    product: string | Product;
    qty: number;
}
export interface Cart {
    _id: string;
    user: string | IUser;
    cartItems: CartItem[];
}
export type CartDocument = Cart & Document & {
    modifyCartItems: (cartItems: CartItem[]) => void
};
