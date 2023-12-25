"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";
import moment from "moment";
import { Op } from "sequelize";

let CourseModel = null;

const init = async (sequelize) => {
  CourseModel = sequelize.define(
    constants.models.COURSES_TABLE,
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
      duration: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      regular_price: {
        type: sequelizeFwk.DataTypes.FLOAT,
        allowNull: false,
      },
      discount_price: {
        type: sequelizeFwk.DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      course_description: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      course_thumbnail: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      course_syllabus: {
        type: sequelizeFwk.DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await CourseModel.sync({ alter: true });
};

const create = async (req) => {
  return await CourseModel.create({
    course_name: req.body.course_name,
    duration: req.body.duration,
    regular_price: req.body.regular_price,
    discount_price: req.body?.discount_price,
    course_description: req.body.course_description,
    course_thumbnail: req.body?.course_thumbnail,
    course_syllabus: req.body.course_syllabus,
  });
};

const update = async (req) => {
  return await CourseModel.update(
    {
      course_name: req.body?.course_name,
      duration: req.body?.duration,
      regular_price: req.body?.regular_price,
      discount_price: req.body?.discount_price,
      course_description: req.body?.course_description,
      course_thumbnail: req.body?.course_thumbnail,
      course_syllabus: req.body?.course_syllabus,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: true,
      plain: true,
    }
  );
};

const get = async (req) => {
  let whereQuery = "";

  if (
    ["student", "teacher", "master_franchisee", "sub_franchisee"].includes(
      req.user_data.role
    )
  ) {
    whereQuery = `INNER JOIN users_courses usrcrs ON usrcrs.course_id = crs.id 
                      AND usrcrs.user_id = '${req.user_data.id}' AND usrcrs.status = 'ASSIGNED';    
                `;
  }

  let query = `
        SELECT
            crs.id,
            crs.course_name,
            crs.duration,
            crs.regular_price,
            crs.discount_price,
            crs.course_description,
            crs.course_thumbnail,
            crs.course_syllabus,
            crs.created_at,
            crs.updated_at
        FROM
            courses crs
        ${whereQuery}
    `;

  return await CourseModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getAllCourses = async () => {
  const query = `
        SELECT * FROM courses;
  `;

  return await CourseModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req) => {
  return await CourseModel.findOne({
    where: {
      id: req.body?.course_id || req.params?.id,
    },
  });
};

const deleteById = async (req) => {
  return await CourseModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

const countCourse = async (last_30_days = false) => {
  let where_query;
  if (last_30_days) {
    where_query = {
      created_at: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }
  return await CourseModel.count({
    where: where_query,
    raw: true,
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
  getAllCourses,
};
