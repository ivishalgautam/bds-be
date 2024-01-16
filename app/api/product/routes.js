"use strict";

import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);

  fastify.post("/", {}, controller.create);

  fastify.put("/:id", {}, controller.update);
  fastify.delete("/:id", {}, controller.deleteById);

  //   product enquiry
  fastify.post("/enquiry/:product_id", {}, controller.createEnquiry);
  fastify.get("/enquiry", {}, controller.getEnquiries);
}
