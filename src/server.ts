import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import typeDefs from "./schema.graphql";
import resolvers from "./resolver.graphql"
import ProductModel from "./models/product.model";
import Product from "./data-sources/products";
import UserModel from "./models/user.model";
import Users from "./data-sources/users";
import "dotenv/config";

// Create server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        products: new Product(ProductModel),
        users: new Users(UserModel),
    }),
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground,
    ],
});

export default server;
