"use strict";
import fastifyCron from "fastify-cron";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.register(fastifyCron, {
    jobs: [
      {
        cronTime: "0 10 * * *",
        onTick: async () => {
          await controller.birthdayWish();
        },
        start: true, // Start job immediately
      },
    ],
  });
}
