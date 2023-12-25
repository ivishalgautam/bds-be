"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
    fastify.get("/", {}, controller.get);
    fastify.get("/:id", {}, controller.getById);
    fastify.get("/user", {}, controller.getByUserId);

    fastify.post("/", {}, controller.create);

    fastify.put("/:id", {}, controller.update);

    fastify.delete("/:id", {}, controller.deleteById);
}
