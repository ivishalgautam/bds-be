"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/:batch_id", {}, controller.get);
  fastify.get("/schedule/:schedule_id", {}, controller.getById);
  fastify.put("/:schedule_id", {}, controller.update);
}
