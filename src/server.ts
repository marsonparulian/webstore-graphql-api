import { ApolloServer } from "apollo-server";
import typeDefs from "./schema.graphql";
import resolvers from "./resolver.graphql"
import "dotenv/config";

// Create server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

console.log("tis is server");

export default server;
