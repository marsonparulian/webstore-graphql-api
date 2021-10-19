import { MongoDataSource } from "apollo-datasource-mongodb";
import bcrypt from "bcrypt";
import { RegisterInput, LoginInput, UserDocument, UserSession } from "../types/auth";
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
    /**
     * User login
     */
    async login(loginInput: LoginInput): Promise<UserSession> {
        // Fetch user from DB
        const user = await this.model.findOne({ email: loginInput.email }).lean();

        // Does user exist ?
        if (!user) throw new Error(`User with email ${loginInput.email} is not found`);

        // verify the password is a match
        const isPasswordAMatch = bcrypt.compare(loginInput.password, user.password);
        if (!isPasswordAMatch) throw new Error("Incorrect password");

        // TODO Generate jwt token
        const token = "TEMP TOKEN";

        // Return
        return {
            name: user.name,
            email: user.email,
            token,
        };
    }
}

export default Users;
