"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
    fastify.get("/:userid", {}, controller.getByUserId);

    fastify.post("/", {}, controller.create);

    fastify.put("/:userid", {}, controller.update);
    fastify.delete("/:userid", {}, controller.deleteById);
}
