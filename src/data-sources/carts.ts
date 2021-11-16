// This file contains logic  related to `Cart`
import { MongoDataSource } from "apollo-datasource-mongodb"
import { IContext } from "../types/common";
import { CartDocument } from "../types/shop";
class Carts extends MongoDataSource<CartDocument, IContext> {

}
export default Carts;
