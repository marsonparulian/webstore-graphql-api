// This file contain test to get products
import { gql } from "apollo-server";
import server from "../../../src/server";
import db from "../../../src/services/db.service";
import ProductModel from "../../../src/models/product.model";
import * as testlib from "../../testlibs/common.testlib";

jest.setTimeout(9000);

const GET_PRODUCTS = gql`
query getProducts{
    products {
        name
    }
}
`;

describe("query getProducts", () => {
    // Products to be saved
    const productsData = [testlib.product1, testlib.product2, testlib.product3];
    beforeAll(async () => {
        // Connect to DB
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

        // The fetched products
        console.log(response?.data?.products);
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
    afterAll(async () => {
        // Close DB connection
        await db.disconnect();
    });
});
