import mongoose from "mongoose";

// Handle error after initial connection
mongoose.connection.on("error", (e) => {
    console.error("Error mongodb connection after initial connection.");
    console.error(e);
});
// Handle loosing connection
mongoose.connection.on("disconnected ", () => {
    console.error("Error: mongodb is disconnected.");
});

/**
 * A service / helper related to DB
 */
const dbService = {
    connect: async (): Promise<void> => {
        // DB access variables
        const userName: string | undefined = process.env.A_DB_USER;
        const password: string | undefined = process.env.A_DB_PASSWORD;
        const dbName: string | undefined = process.env.A_DB_NAME;

        // Reject if one of auth vars are falsy.
        if (!userName || !password || !dbName) {
            return Promise.reject(new Error("Error: auth vars for mongodb connection are not provided"));
        }

        // URI connection
        const url = `mongodb+srv://${userName}:${password}@cluster0-rvmd6.mongodb.net/${dbName}?retryWrites=true&w=majority`

        try {
            // Connect
            await mongoose.connect(url);
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },
    disconnect: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connection.close(() => {
                    resolve();
                });
            } catch (e) {
                reject(new Error("Error: unable to disconnect mongodb connection."))
            }
        });
    },
    dropDatabase: (): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                mongoose.connection.db.dropDatabase(() => {
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    isIdValid: (_id: string): boolean => {
        // source : https://www.geeksforgeeks.org/how-to-check-if-a-string-is-valid-mongodb-objectid-in-nodejs/
        if (mongoose.Types.ObjectId.isValid(_id)
            && (String)(new mongoose.Types.ObjectId(_id)) === _id) {
            return true
        }
        return false;
    },
}

export default dbService;
