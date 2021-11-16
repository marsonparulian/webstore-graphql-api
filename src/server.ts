import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import typeDefs from "./schema.graphql";
import resolvers from "./resolver.graphql"
import ProductModel from "./models/product.model";
import Product from "./data-sources/products";
import UserModel from "./models/user.model";
import Users from "./data-sources/users";
import CartModel from "./models/cart.model";
import Carts from "./data-sources/carts";
import { parseUserIdFromToken } from "./services/auth.service";
import "dotenv/config";

// Create server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req?.headers?.authorization || "";
        const userId = parseUserIdFromToken(token);
        return {
            userId,
        }
    },
    dataSources: () => ({
        products: new Product(ProductModel),
        users: new Users(UserModel),
        carts: new Carts(CartModel),
    }),
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground,
    ],
});

export default server;
