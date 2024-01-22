"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/getByCourseId/:id", {}, controller.getByCourseId);

  fastify.post("/", {}, controller.create);

  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);

  // for student homework upload
  fastify.post("/upload-homework", {}, controller.uploadHomework);
  fastify.get("/my-homeworks", {}, controller.getUploadedHomeworks);
  fastify.delete("/my-homeworks/:id", {}, controller.deleteUploadedHomework);
}
