import { MongoDataSource } from "apollo-datasource-mongodb";
import bcrypt from "bcrypt";
import jsonWebToken from "jsonwebtoken";
import { RegisterInput, LoginInput, UserDocument, UserSession } from "../types/auth";
import { IContext } from "../types/common";
import * as authHelper from "../hellpers/auth.helper";

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
        const userDoc = await this.model.findOne({ email: loginInput.email });

        // Does user exist ?
        if (!userDoc) throw new Error(`User with email ${loginInput.email} is not found`);

        // verify the password is a match
        const isPasswordAMatch = bcrypt.compare(loginInput.password, userDoc.password);
        if (!isPasswordAMatch) throw new Error("Incorrect password");

        // Generate jwt token
        const secret = "HashBrownies";
        const user = authHelper.reduceUserDocumentToUser(userDoc);
        const token = jsonWebToken.sign(user, secret, { expiresIn: "2h" });

        // Return
        return {
            name: userDoc.name,
            email: userDoc.email,
            token,
        };
    }
}

export default Users;
