"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.post("/:id/change-password", {}, controller.updatePassword);
  fastify.put("/:id", {}, controller.update);
  fastify.get("/me", {}, controller.getUser);
  fastify.get("/students", {}, controller.getStudents);
  fastify.get("/teachers", {}, controller.getTeachers);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
}
