import { Document } from "mongoose";

export interface IProduct {
    name: string;
    description: string;
};
/**
 *       `Product` document in mongoDB
 * Note: we extend mongoose `Document` because `apollo-datasource-mongodb` only accepts extension of `Document` in mongoose model.
 * The use of pure interface, e.g. `IProduct`,  in mongoose model will throw type checking error.
 */
export type ProductDocument = IProduct & Document;
/**
 * Parameters to query products
 */
export interface IProductParams {
    keyword?: string;
}
/**
 * `context` in resolver & `MongoDataSource`
 */
export interface IContext {
    // Only used in resolvers
    dataSources: any;
}
