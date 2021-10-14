import { gql } from "apollo-server";

export default gql`
type Product {
    name: String
    description: String
}


type Query {
    products (keyword:String, offset:Int, limit: Int): [Product]
}
`;
