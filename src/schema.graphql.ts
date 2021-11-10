import { gql } from "apollo-server";

export default gql`
type Product {
    id: ID
    name: String
    description: String
}
type PaginatedProducts{
    totalProducts: Int
    products: [Product]
}
type User {
    id: ID
    name: String
    email: String
}
input RegisterInput {
    name: String
    email: String
    password: String
}
input LoginInput {
    email: String
    password: String
}
type UserSession {
    id: ID
    name: String!
    email: String!
    token: String!
}
type CartItem {
    product: Product
    qty: Int
}
type Cart {
    id: ID
    userId: ID
    cartItems: [CartItem]
}

type Query {
    paginatedProducts (keyword:String, offset:Int, limit: Int): PaginatedProducts
    cart: Cart
}
type Mutation {
    register(registerInput: RegisterInput): User 
    login(loginInput : LoginInput) :UserSession
}
`;
