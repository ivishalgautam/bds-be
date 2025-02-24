import userRoutes from "../../api/users/routes.js";
import courseRoutes from "../../api/course/routes.js";
import homeworkRoutes from "../../api/homework/routes.js";
import productRoutes from "../../api/product/routes.js";
import jwtVerify from "../../helpers/auth.js";
import franchiseeRoutes from "../../api/franchisee/routes.js";
import addressRoutes from "../../api/address/routes.js";
import quizsRoutes from "../../api/quiz/routes.js";
import projectRoutes from "../../api/projects/routes.js";
import ticketRoutes from "../../api/tickets/routes.js";
// import uploadFileRoutes from "../../api/upload_file/routes.js";
import dashboardRoutes from "../../api/dashboard/routes.js";
import announcementRoutes from "../../api/announcement/routes.js";
import coursesAssignRoutes from "../../api/assign_courses/routes.js";
import batchRoutes from "../../api/batch/routes.js";
import recordingRoutes from "../../api/recordings/routes.js";
import notesRoutes from "../../api/notes/routes.js";
import buddyRoutes from "../../api/buddy/routes.js";
import meetingRoutes from "../../api/live_streaming/routes.js";
import schedulesRoutes from "../../api/schedules/routes.js";
import groupRoutes from "../../api/groups/routes.js";
import chatRoutes from "../../api/chat/routes.js";
import resultRoutes from "../../api/result/routes.js";
import levelsRoutes from "../../api/level/routes.js";
import rewardRoutes from "../../api/rewards/routes.js";
import greetingsRoutes from "../../api/greetings/routes.js";
import leadsRoutes from "../../api/leads/routes.js";

export default async function routes(fastify, options) {
  // fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(courseRoutes, { prefix: "courses" });
  fastify.register(homeworkRoutes, { prefix: "homeworks" });
  fastify.register(productRoutes, { prefix: "products" });
  fastify.register(franchiseeRoutes, { prefix: "franchisee" });
  fastify.register(addressRoutes, { prefix: "addresses" });
  fastify.register(quizsRoutes, { prefix: "quizs" });
  fastify.register(projectRoutes, { prefix: "projects" });
  fastify.register(ticketRoutes, { prefix: "ticket" });
  // fastify.register(uploadFileRoutes, { prefix: "upload" });
  fastify.register(dashboardRoutes, { prefix: "reports" });
  fastify.register(announcementRoutes, { prefix: "announcements" });
  fastify.register(coursesAssignRoutes, { prefix: "courses-assign" });
  fastify.register(batchRoutes, { prefix: "batch" });
  fastify.register(recordingRoutes, { prefix: "recordings" });
  fastify.register(notesRoutes, { prefix: "notes" });
  fastify.register(buddyRoutes, { prefix: "buddy" });
  fastify.register(meetingRoutes, { prefix: "meeting" });
  fastify.register(schedulesRoutes, { prefix: "schedules" });
  fastify.register(groupRoutes, { prefix: "groups" });
  fastify.register(chatRoutes, { prefix: "chats" });
  fastify.register(resultRoutes, { prefix: "results" });
  fastify.register(levelsRoutes, { prefix: "levels" });
  fastify.register(rewardRoutes, { prefix: "rewards" });
  fastify.register(greetingsRoutes, { prefix: "greetings" });
  fastify.register(leadsRoutes, { prefix: "leads" });
}
