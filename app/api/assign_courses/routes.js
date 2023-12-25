"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/franchisee/:id", {}, controller.getByFranchiseeId);

  fastify.post("/", {}, controller.assignCourse);

  fastify.put("/:id", {}, controller.updateAssignCourse);
  fastify.delete("/:id", {}, controller.deleteById);
}
