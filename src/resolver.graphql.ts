import { IContext } from "./types/common";

// Graphql resolver 
const resolver = {
    Query: {
        products: async (_: never, params: any, context: IContext) => {
            return context.dataSources.products.getProducts(params);
        },
    },
};
export default resolver;
