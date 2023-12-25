"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);

  fastify.post("/", {}, controller.create);

  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);

  // for course enquiry
  fastify.post("/enquiry", {}, controller.createEnquiry);
  fastify.get("/enquiry", {}, controller.getEnquiries);

  // upcoming courses
  fastify.get("/find/unassigned-course", {}, controller.getUnassignedCourses);
}
