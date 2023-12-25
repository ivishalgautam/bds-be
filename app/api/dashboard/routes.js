"use strict";

import controller from "./controller.js";


export default async function routes(fastify, options) {
    fastify.get("/", {}, controller.get);
    fastify.get("/all", {}, controller.getReport);
    fastify.get("/last_30_days", {}, controller.getLast30Days);
}
