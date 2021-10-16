import { RegisterInput } from "./types/auth";
import { IContext, IProductParams } from "./types/common";

// Graphql resolver 
const resolver = {
    Query: {
        paginatedProducts: async (_: never, params: IProductParams, context: IContext) => {
            // return context.dataSources.products.getProducts(params);
            return context.dataSources.products.getPaginatedProducts(params);
        },
    },
    Mutation: {
        register: async (_: never, args: { registerInput: RegisterInput }, context: IContext) => {
            return context.dataSources.users.register(args.registerInput);
        }
    }
};
export default resolver;
