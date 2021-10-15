import { IContext, IProductParams } from "./types/common";

// Graphql resolver 
const resolver = {
    Query: {
        paginatedProducts: async (_: never, params: IProductParams, context: IContext) => {
            // return context.dataSources.products.getProducts(params);
            return context.dataSources.products.getPaginatedProducts(params);
        },
    },
};
export default resolver;
