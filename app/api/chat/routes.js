"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/:group_chat_id", {}, controller.get);
}
