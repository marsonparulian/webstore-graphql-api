// Graphql resolver 
const resolver = {
    Query: {
        products: async (_: never, params: any, context: any) => {
            return context.dataSources.products.getProducts(params);
        },
    },
};
export default resolver;
