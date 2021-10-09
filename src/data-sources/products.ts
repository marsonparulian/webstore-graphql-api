import { MongoDataSource } from "apollo-datasource-mongodb";
import { IProduct, ProductDocument } from "../types/common";
import { Model } from "mongoose";

class Product extends MongoDataSource<ProductDocument> {
    async getProducts(): Promise<IProduct[]> {
        return await this.model.find();
    }
}

export default Product;
