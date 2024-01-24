"use strict";

const constants = {
  environment: {
    LOCAL: "local",
    DEVELOPMENT: "development",
    TEST: "test",
    PRODUCTION: "production",
  },
  http: {
    status: {
      OK: 200,
      CREATED: 201,
      ACCEPTED: 202,
      NOCONTENT: 204,
      MULTI_STATUS: 207,
      REDIRECT: 301,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
      NOT_FOUND: 404,
    },
  },
  error: {
    validation: {},
    message: {
      // HTTP Status code messages
      HTTP_STATUS_CODE_201: "Created",
      HTTP_STATUS_CODE_400: "Bad Request.",
      HTTP_STATUS_CODE_301: "Redirect to other url",
      HTTP_STATUS_CODE_401: "Unauthorized.",
      HTTP_STATUS_CODE_403: "Forbidden.",
      HTTP_STATUS_CODE_404: "The specified resource was not found.",
      HTTP_STATUS_CODE_409: "Resource already exists",
      HTTP_STATUS_CODE_500: "Internal Server Error.",
      INVALID_LOGIN: "Invalid Login",
      EMAIL_MISSING: "Email Missing",
      PAYMENT_ACCOUNT_ID_MISSING: "Payment Account Id Missing",
      INVALID_PAYMENT_ACCOUNT_ID: "Invalid Payment Account Id provided",
    },
  },
  models: {
    USER_TABLE: "users",
    PRODUCT_TABLE: "products",
    PROJECT_TABLE: "projects",
    COURSES_TABLE: "courses",
    USERS_COURSES_TABLE: "users_courses",
    ADDRESS_TABLE: "users_addresses",
    TICKET_TABLE: "tickets",
    HOMEWORK_TABLE: "homeworks",
    QUIZ_TABLE: "quizs",
    FRANCHISEE_TABLE: "franchisees",
    ANNOUNCEMENT_TABLE: "announcements",
    PROMO_CODE_TABLE: "promo_codes",
    BATCH_TABLE: "batches",
    STUDENT_TABLE: "students",
    TEACHER_TABLE: "teachers",
    RECORDINGS_TABLE: "recordings",
    CHAT_TABLE: "chats",
    GROUP_CHAT_TABLE: "group_chats",
    NOTES_TABLE: "notes",
    GROUP_TABLE: "groups",
    SCHEDULE_TABLE: "schedules",
    GROUP_INVITATION_TABLE: "group_invitations",
    RESULT_TABLE: "results",
    HOMEWROKK_UPLOAD_TABLE: "homework_uploads",
    PROJECT_UPLOAD_TABLE: "project_uploads",
    LEVEL_TABLE: "levels",
    REWARD_TABLE: "rewards",
    PRODUCT_ENQUIRY_TABLE: "product_enquiries",
    COURSE_ENQUIRY_TABLE: "course_enquiries",
    MEETING_TABLE: "meetings",
    ZOOM_USER_TABLE: "zoom_users",
    LEADS_TABLE: "leads",
  },
  bcrypt: {
    SALT_ROUNDS: 10,
  },
  time: {
    TOKEN_EXPIRES_IN: 15 * 6000000, // 15 * 1 minute = 15 minutes
    REFRESH_TOKEN_EXPIRES_IN: "1d", // 1 day
  },
};

export default constants;
