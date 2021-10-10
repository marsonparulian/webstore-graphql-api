import { IContext, IProductParams } from "./types/common";

// Graphql resolver 
const resolver = {
    Query: {
        products: async (_: never, params: IProductParams, context: IContext) => {
            return context.dataSources.products.getProducts(params);
        },
    },
};
export default resolver;
