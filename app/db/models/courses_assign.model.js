"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let UserCourseModel = null;

const init = async (sequelize) => {
  UserCourseModel = sequelize.define(
    constants.models.USERS_COURSES_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      course_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: sequelizeFwk.DataTypes.ENUM("ASSIGNED", "UNASSIGNED", ""),
        allowNull: false,
      },
      course_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.COURSES_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      user_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      assigned_by_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await UserCourseModel.sync({ alter: true });
};

const create = async (req) => {
  // console.log({ req });
  return await UserCourseModel.create({
    course_name: req.body.course_name,
    status: req.body.status,
    course_id: req.body.course_id,
    user_id: req.body.user_id,
    assigned_by_id: req.user_data.id,
  });
};

const update = async (req) => {
  return await UserCourseModel.update(
    {
      status: req.body?.status,
      course_id: req.body?.course_id,
      user_id: req.body?.user_id,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  );
};

const get = async (user_id, isAdmin = false) => {
  let whereQuery = "";
  if (isAdmin) {
    whereQuery = "";
  } else {
    whereQuery = `WHERE usrcrs.assigned_by_id = '${user_id}'`;
  }
  // console.log({ user_id });
  let query = `
        SELECT
            usrcrs.id,
            usrcrs.course_name,
            usrcrs.status,
            usrcrs.course_id,
            usr.username, 
            usr.role
        FROM
            users_courses usrcrs
        LEFT JOIN users usr ON usr.id = usrcrs.user_id
        ${whereQuery};
    `;
  return await UserCourseModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req) => {
  return await UserCourseModel.findOne({
    where: {
      id: req.params.id,
    },
  });
};

const deleteById = async (req) => {
  return await UserCourseModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

const getAllCourseByFranchiseeId = async (user_id) => {
  const query = `
          SELECT
              *
          FROM users_courses
          WHERE user_id = '${user_id}' AND status = 'ASSIGNED'
  `;

  // let query = `
  //       SELECT
  //           usc.course_name,
  //           usc.status,
  //           usc.user_id,
  //           frn.franchisee_id,
  //           usc.status,
  //           frn.franchisee_name
  //       FROM users_courses usc
  //       INNER JOIN franchisees frn ON frn.user_id = usc.user_id
  //       WHERE usc.user_id = '${user_id}'
  //       GROUP BY frn.franchisee_id
  //       `;
  return await UserCourseModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const countCourse = async (user_id, last_30_days = false) => {
  let where_query = {};
  if (last_30_days) {
    where_query = {
      created_at: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }
  if (user_id) {
    where_query.user_id = user_id;
  }

  return await UserCourseModel.count({
    where: where_query,
  });
};

const checkExists = async (req) => {
  return await UserCourseModel.findOne({
    where: {
      user_id: req.body.user_id,
      course_id: req.body.course_id,
    },
  });
};

export default {
  init,
  create,
  update,
  get,
  getById,
  deleteById,
  countCourse,
  checkExists,
  getAllCourseByFranchiseeId,
};
