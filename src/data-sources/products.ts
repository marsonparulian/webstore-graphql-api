import { MongoDataSource } from "apollo-datasource-mongodb";
import { IContext, IProduct, ProductDocument } from "../types/common";
import { Model, FilterQuery } from "mongoose";

class Product extends MongoDataSource<ProductDocument, IContext> {
    async getProducts(params: any): Promise<IProduct[]> {
        // Construct filter
        let filter: FilterQuery<ProductDocument> = {};
        // Include `keyword`
        if (params.keyword) {
            filter.name = new RegExp(params.keyword, "i");
        }

        return await this.model.find(filter);
    }
}

export default Product;
