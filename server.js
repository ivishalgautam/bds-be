import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import cors from "@fastify/cors";
import { dirname } from "path";
import path from "path";
import fastifySocketIO from "@fastify/websocket";

// import internal modules
import authRoutes from "./app/api/auth/routes.js";
import pg_database from "./app/db/postgres.js";
import routes from "./app/routes/v1/index.js";
import uploadFileRoutes from "./app/api/upload_file/routes.js";
/*
    Register External packages, routes, database connection
*/

export default (app) => {
  app.register(fastifyStatic, {
    root: path.join(dirname(fileURLToPath(import.meta.url), "public")),
    prefix: "/public/",
  });
  app.register(cors, { origin: "*" });
  app.register(pg_database);
  app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Set the limit to 5 GB or adjust as needed
  });
  // Increase the payload size limit
  app.register(routes, { prefix: "v1" });
  app.register(authRoutes, { prefix: "v1/auth" });
  app.register(uploadFileRoutes, { prefix: "v1/upload" });

  app.register(fastifySocketIO, {
    cors: { origin: "*" },
    options: {
      maxPayload: 1048576,
      clientTracking: true,
    },
  });

  app.register(async function (app) {
    app.get("/*", { websocket: true }, (connection, req) => {
      connection.socket.on("message", (data) => {
        const messageString = JSON.parse(data.toString("utf-8"));

        app.websocketServer.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              group_chat_id: messageString.group_id,
              message_from_id: messageString.user.id,
              image_url: messageString.user.image_url,
              message_from_fullname: `${messageString.user.first_name} ${messageString.user.last_name}`,
              role: messageString.user.role,
              profession: messageString.user.profession,
              message: messageString.message,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          );
        });
      });
    });
  });
};
0;
