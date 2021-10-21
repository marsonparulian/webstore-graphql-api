import { Document } from "mongoose";

export interface ProductInput {
    name: string;
    description: string;
};
/** Product info */
export type Product = ProductInput & {
    _id: string;
}
/**
 *       `Product` document in mongoDB
 * Note: we extend mongoose `Document` because `apollo-datasource-mongodb` only accepts extension of `Document` in mongoose model.
 * The use of pure interface, e.g. `IProduct`,  in mongoose model will throw type checking error.
 */
export type ProductDocument = ProductInput & Document;
/**
 * Parameters to query products
 */
export interface IProductParams {
    keyword?: string;
    offset?: number;
    limit?: number;
}
/**
 * `context` in resolver & `MongoDataSource`
 */
export interface IContext {
    // Only used in resolvers
    dataSources: any;
}
