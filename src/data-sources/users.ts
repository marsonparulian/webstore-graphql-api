import { MongoDataSource } from "apollo-datasource-mongodb";
import bcrypt from "bcrypt";
import { RegisterInput, UserDocument } from "../types/auth";
import { IContext } from "../types/common";

class Users extends MongoDataSource<UserDocument, IContext>{
    async register(registerInput: RegisterInput) {
        // Hash password
        const saltRound = 10;
        const hashed = await bcrypt.hash(registerInput.password, saltRound);
        const hashedRegisterInput: RegisterInput = Object.assign({}, registerInput, { password: hashed });

        // Create and save
        const user = new this.model(hashedRegisterInput);
        await user.save();

        return user;
    }
}

export default Users;
