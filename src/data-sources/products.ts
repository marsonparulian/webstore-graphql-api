import { MongoDataSource } from "apollo-datasource-mongodb";
import { IContext, IProduct, IProductParams, ProductDocument } from "../types/common";
import { Model, FilterQuery } from "mongoose";

class Product extends MongoDataSource<ProductDocument, IContext> {
    async getProducts(params: IProductParams): Promise<IProduct[]> {
        // Construct filter
        let filter: FilterQuery<ProductDocument> = {};
        const offset = params.offset || 0;
        const limit = params.limit || 999;
        // Include `keyword`
        if (params.keyword) {
            filter.name = new RegExp(params.keyword, "i");
        }

        return await this.model.find(filter)
            .skip(offset)
            .limit(limit);
    }
}

export default Product;
