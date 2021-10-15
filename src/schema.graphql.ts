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

type Query {
    paginatedProducts (keyword:String, offset:Int, limit: Int): PaginatedProducts
}
`;
