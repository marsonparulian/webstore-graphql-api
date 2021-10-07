import server from "./server";

// Start the apollo server
console.log("starting server");
server.listen()
    .then(({ url }) => {
        console.log(`Apollo server is started. URL : ${url}`);
    }).catch((e: any) => {
        console.error("Failed sarting apollo server");
        console.error(e.message);
    });


