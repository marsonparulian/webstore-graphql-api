import { MongoDataSource } from "apollo-datasource-mongodb";
import { IContext, ProductInput, IProductParams, ProductDocument } from "../types/common";
import { Model, FilterQuery } from "mongoose";

class Product extends MongoDataSource<ProductDocument, IContext> {
    createFilterQuery(params: IProductParams): FilterQuery<ProductDocument> {
        // Construct filter
        let filter: FilterQuery<ProductDocument> = {};

        // Include `keyword`
        if (params.keyword) {
            filter.name = new RegExp(params.keyword, "i");
        }

        return filter;
    }
    async getProducts(params: IProductParams): Promise<ProductInput[]> {
        // Filter query
        const filter = this.createFilterQuery(params);

        // Pagination variables
        const offset = params.offset || 0;
        const limit = params.limit || 999;

        return await this.model.find(filter)
            .skip(offset)
            .limit(limit);
    }
    /**
     * Count number of products matches the given parameters
     * @param params  - Parameters to query products
     */
    async getCountProducts(params: IProductParams): Promise<number> {
        // Filter query
        const filterQuery = this.createFilterQuery(params);

        return await this.model.count(filterQuery);
    }
    /**
     * Get paginated products and related (page) info
     */
    async getPaginatedProducts(params: IProductParams): Promise<any> {
        const totalProducts = await this.getCountProducts(params);
        const products = await this.getProducts(params);

        return {
            totalProducts,
            products,
        }
    }
}

export default Product;
