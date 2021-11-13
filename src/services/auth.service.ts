// This file contains services related to authentication / authorization
import jsonwebtoken from "jsonwebtoken";

/**
 * parse `userId` from JWT token
 */
export const parseUserIdFromToken = (token: string): string => {
    // Token secret
    const secret = process.env.A_TOKEN_SECRET ?? "";

    let userId = "";
    try {
        const data = jsonwebtoken.verify(token, secret);
        console.log("parsed data : ", data);

        // Return user id if available
        // if (data.userId) return data.userId;
        return "";
    } catch (e: any) {
        return "";
    }
}
