import { MongoDataSource } from "apollo-datasource-mongodb";
import { RegisterInput, UserDocument } from "../types/auth";
import { IContext } from "../types/common";

class Users extends MongoDataSource<UserDocument, IContext>{
    async register(registerInput: RegisterInput) {
        return registerInput;
    }
}

export default Users;
