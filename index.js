import config from "./app/config/index.js";
import server from "./server.js";
import fastify from "fastify";

const app = fastify({ logger: true });

try {
  server(app);
} catch (e) {
  process.exit(1);
}

/**
 * Run the server!
 */
const start = async () => {
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" }); // For fastify server
  } catch (e) {
    app.log.error(e);
    process.exit(1);
  }
};

start();
