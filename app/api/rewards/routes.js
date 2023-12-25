"use strict";

import controlller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controlller.create);
  fastify.get("/", {}, controlller.get);
  fastify.get("/:id", {}, controlller.getById);
  fastify.delete("/:id", {}, controlller.deleteById);
  fastify.put("/:student_id", {}, controlller.update);
}
