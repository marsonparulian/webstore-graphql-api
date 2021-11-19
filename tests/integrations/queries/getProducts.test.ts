// This file contain test to get products
import { gql } from "apollo-server";
import server from "../../../src/server";
import db from "../../../src/services/db.service";
import ProductModel from "../../../src/models/product.model";
import * as productTestLib from "../../testlibs/products.testlib";

jest.setTimeout(14000);

const GET_PRODUCTS = gql`
query getProducts($keyword: String, $offset: Int=0, $limit: Int= 12){
    paginatedProducts (
        keyword: $keyword,
        offset: $offset,
        limit: $limit
        ){
        totalProducts
        products{
            _id
            name
            description
        }
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
        const fetchedProducts = response?.data?.paginatedProducts?.products;

        // Assert `totalProducts`
        expect(response?.data?.paginatedProducts?.totalProducts).toBe(productsData.length);

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
                    description: savedProduct.description,
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
        const queried = response?.data?.paginatedProducts?.products;

        // Assert the dbFetched products is an array 
        expect(fetched).toEqual(expect.any(Array));
        // Assert `totalProducts` : should have the same number with 'fetched' products
        expect(response?.data?.paginatedProducts?.totalProducts).toBe(fetched.length);
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
                    description: p.description,
                })
            ]))
        });


    });
    test("Get products with offset :2 and limit : 3", async () => {
        // Define params for pagination
        const offset = 2, limit = 3;

        // Send Operation
        const { data, errors } = await server.executeOperation({
            query: GET_PRODUCTS,
            variables: {
                offset,
                limit,
            },
        })

        // Assert response contains no `errors`
        expect(errors).toBeFalsy();

        // The data should be truthy
        expect(data).toBeTruthy();

        // Extract results
        const paginatedProducts = data?.paginatedProducts;
        const products = data?.paginatedProducts?.products;

        // Assert response contain the correct `limit`
        expect(products).toEqual(expect.any(Array));
        expect(products?.length).toBe(limit);

        // Assert response  has the exact item (`offset` is applied correctly).
        const expectedProducts = productsData.slice(offset, offset + limit);
        // Iterate through the expected paginated products
        expectedProducts.forEach((p, index) => {
            // Assert the expected product included in the queried products at the same index
            expect(products[index]).toEqual(expect.objectContaining(p))
        });
    });
    afterAll(async () => {
        // Close DB connection
        await db.disconnect();
    });
});
