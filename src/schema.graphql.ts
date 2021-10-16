import { gql } from "apollo-server";

export default gql`
type Product {
    name: String
    description: String
}
type PaginatedProducts{
    totalProducts: Int
    products: [Product]
}
type User {
    name: String
    email: String
}
input RegisterInput {
    name: String
    email: String
    password: String
}

type Query {
    paginatedProducts (keyword:String, offset:Int, limit: Int): PaginatedProducts
}
type Mutation {
    register(registerInput: RegisterInput): User 
}
`;
