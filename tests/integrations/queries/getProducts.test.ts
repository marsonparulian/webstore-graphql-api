// This file contain test to get products
import { gql } from "apollo-server";
import server from "../../../src/server";
import db from "../../../src/services/db.service";
import ProductModel from "../../../src/models/product.model";
import * as productTestLib from "../../testlibs/products.testlib";

jest.setTimeout(14000);

const GET_PRODUCTS = gql`
query getProducts($keyword: String){
    products (
        keyword: $keyword
        ){
        name
    }
}
`;

describe("query getProducts", () => {
    // Products to be saved
    const productsData = Object.values(productTestLib);
    beforeAll(async () => {
        // Connect to DB````
        await db.connect();

        // Drop product collection
        await ProductModel.collection.drop();

        // Insert products
        await ProductModel.insertMany(productsData);
    });
    test("Get all products", async () => {
        const response = await server.executeOperation({
            query: GET_PRODUCTS,
        });

        // Throw if `response.errors`
        if (response.errors) {
            console.log("Response.data", response.data);
            console.log("Response.errors", response.errors);
            throw (new Error("Found 'errors' (below) in response object"));
        };

        // The fetched products
        const fetchedProducts = response?.data?.products;

        // Assert response should contain array of product
        expect(fetchedProducts).toEqual(expect.any(Array));
        // The fetched products length should be the same with the saved products
        expect(fetchedProducts.length).toBe(productsData.length);

        // Iterate through the inserted `product`
        productsData.forEach(savedProduct => {
            // Assert the saved product `name` should be contained in the fetched query
            expect(fetchedProducts).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    name: savedProduct.name,
                })
            ]));
        });
    });
    test("Get products with keyword 'milk'", async () => {
        // Fetch directly to DB with keyword 'milk'
        const fetched = await ProductModel.find({
            name: /milk/i,
        }).lean();

        // Send graphql query with keyword 'milk'
        const response = await server.executeOperation({
            query: GET_PRODUCTS,
            variables: {
                keyword: "milk",
            }
        })
        // The queried `products`
        const queried = response?.data?.products;

        // Assert the dbFetched products is an array 
        expect(fetched).toEqual(expect.any(Array));
        // Assert the queried products is an array
        expect(queried).toEqual(expect.any(Array));
        // Assert both product array has same number of elements.
        expect(queried.length).toBe(fetched.length);

        // Iterate through the dbFetched
        fetched.forEach(p => {
            // Assert the products also contained in  the queried products
            expect(queried).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    name: p.name,
                })
            ]))
        });



    });
    afterAll(async () => {
        // Close DB connection
        await db.disconnect();
    });
});
