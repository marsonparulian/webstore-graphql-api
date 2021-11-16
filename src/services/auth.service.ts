// This file contains services related to authentication / authorization
// Use CommonJS to avoid `_id property does not exist in type ...` error. 
// Reference : https://stackoverflow.com/questions/47508424/how-to-get-token-expiration-with-jsonwebtoken-using-typescript
const jsonwebtoken = require("jsonwebtoken");

/**
 * parse `userId` from JWT token
 */
export const parseUserIdFromToken = (token: string): string => {
    // Token secret
    const secret = process.env.A_TOKEN_SECRET ?? "";

    let userId = "";
    try {
        const data = jsonwebtoken.verify(token, secret);

        // Return `_id` if available
        if (data._id) return data._id;
        return "";
    } catch (e: any) {
        return "";
    }
}
