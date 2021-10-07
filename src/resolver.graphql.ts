// Graphql resolver 
const resolver = {
    Query: {
        products: async () => {
            const producst = [
                { name: "Ultra Milk", description: "Ultra Milk description " }
            ];
            return producst;
        },
    },
};
export default resolver;
