// Graphql resolver 
const resolver = {
    Query: {
        products: async (_: never, __: never, context: any) => {
            return context.dataSources.products.getProducts();
        },
    },
};
export default resolver;
