import { RegisterInput, LoginInput } from "./types/auth";
import { IContext, IProductParams } from "./types/common";

// Graphql resolver 
const resolver = {
    Query: {
        paginatedProducts: async (_: never, params: IProductParams, context: IContext) => {
            return context.dataSources.products.getPaginatedProducts(params);
        },
    },
    Mutation: {
        register: async (_: never, args: { registerInput: RegisterInput }, context: IContext) => {
            return context.dataSources.users.register(args.registerInput);
        },
        login: async (_: never, { loginInput }: { loginInput: LoginInput }, context: IContext) => {
            return context.dataSources.users.login(loginInput)
        },
    }
};
export default resolver;
