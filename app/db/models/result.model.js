"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ResultModel = null;

const init = async (sequelize) => {
  ResultModel = sequelize.define(
    constants.models.RESULT_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      batch_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.BATCH_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.COURSES_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      student_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      teacher_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.TEACHER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sub_franchisee_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: constants.models.FRANCHISEE_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      attemted_questions: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      total_questions: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      your_points: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      total_points: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      wrong_answers: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await ResultModel.sync({ alter: true });
};

const create = async (req) => {
  return await ResultModel.create({
    batch_id: req.body.batch_id,
    course_id: req.body.course_id,
    student_id: req.user_data.id,
    sub_franchisee_id: req.body.sub_franchisee_id,
    teacher_id: req.body.teacher_id,
    attemted_questions: req.body.attemted_questions,
    total_questions: req.body.total_questions,
    your_points: req.body.your_points,
    total_points: req.body.total_points,
    wrong_answers: req.body.wrong_answers,
  });
};

const get = async (req, teacher_id, sub_franchisee_id) => {
  let whereQuery = "";

  if (req?.user_data?.role === "student") {
    whereQuery = `WHERE rslt.student_id = '${req.user_data.id}'`;
  }

  if (teacher_id) {
    whereQuery = `WHERE rslt.teacher_id = '${teacher_id}'`;
  }

  if (sub_franchisee_id) {
    whereQuery = `WHERE rslt.sub_franchisee_id = '${sub_franchisee_id}'`;
  }

  let query = `
        SELECT 
            rslt.*,
            usr.image_url as student_image,
            CONCAT(usr.first_name, ' ', usr.last_name) as student_name,
            crs.course_name,
            bch.batch_name
          FROM results rslt
          LEFT JOIN users usr on usr.id = rslt.student_id
          LEFT JOIN teachers tchr on tchr.id = rslt.teacher_id
          LEFT JOIN franchisees sbfrnc on sbfrnc.id = rslt.sub_franchisee_id
          LEFT JOIN courses crs on crs.id = rslt.course_id
          LEFT JOIN batches bch on bch.id = rslt.batch_id
          ${whereQuery}
          ORDER BY rslt.created_at DESC
        `;

  // console.log({ query });
  return await ResultModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

export default {
  init,
  create,
  get,
};
