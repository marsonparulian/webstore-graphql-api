import { gql } from "apollo-server";

export default gql`
type Product {
    _id: ID
    name: String
    description: String
}
type PaginatedProducts{
    totalProducts: Int
    products: [Product]
}
type User {
    _id: ID
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
    _id: ID
    name: String!
    email: String!
    token: String!
}
type CartItem {
    _id: ID
product: Product
qty: Int
}
input CartItemModifier {
    product: ID
    qty: Int
}
type Cart {
    _id: ID
    user: User
    cartItems: [CartItem]
}

type Query {
    paginatedProducts(keyword: String, offset: Int, limit: Int): PaginatedProducts
    cart: Cart
}
type Mutation {
    register(registerInput: RegisterInput): User
    login(loginInput: LoginInput): UserSession
    modifyCart(cartItemModifiers: [CartItemModifier]): Cart
}
`;
