import { ApolloServer } from "@apollo/server";
import cors from "cors";
import express from "express";
import { expressMiddleware } from "@as-integrations/express5";

import { typeDefs } from "./src/graphql/schema.js";
import { resolvers } from "./src/graphql/resolvers.js";

const app = express();
const puerto = process.env.PORT || 3000;

const apollo = new ApolloServer({
    typeDefs,
    resolvers
});

async function iniciarServidor() {
    try {
        await apollo.start();

        app.use(
            "/graphql",
            cors(),
            express.json(),
            expressMiddleware(apollo)
        );

        app.get("/", (req, res) => {
            res.send(`
                <h1>API-Colombia GraphQL</h1>
                <p>Backend GraphQL funcionando.</p>
                <p>Endpoint: <a href="/graphql">/graphql</a></p>
                <p>Usa Apollo Sandbox para realizar consultas.</p>
            `);
        });

        app.listen(puerto, "0.0.0.0", () => {
            console.log("Servidor GraphQL iniciado correctamente");
            console.log(`Servidor: http://localhost:${puerto}`);
            console.log(`GraphQL: http://localhost:${puerto}/graphql`);
        });

    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
}

iniciarServidor();