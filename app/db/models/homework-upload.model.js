"use strict";

import sequelizeFwk from "sequelize";
import constants from "../../lib/constants/index.js";

let HomeworkUploadModel = null;

const init = async (sequelize) => {
  HomeworkUploadModel = sequelize.define(
    constants.models.HOMEWROKK_UPLOAD_TABLE,
    {
      id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        primaryKey: true,
      },
      student_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.STUDENT_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      teacher_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.TEACHER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.COURSES_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      batch_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.BATCH_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      week: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.INTEGER,
      },
      day: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.INTEGER,
      },
      file: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.TEXT,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await HomeworkUploadModel.sync({ alter: true });
};

const create = async (req, student_id, teacher_id) => {
  return await HomeworkUploadModel.create({
    student_id: student_id,
    teacher_id: teacher_id,
    course_id: req.body.course_id,
    batch_id: req.body.batch_id,
    week: req.body.week,
    day: req.body.day,
    file: req.body.file,
  });
};

const homeworkExist = async (
  student_id,
  teacher_id,
  course_id,
  batch_id,
  week,
  day
) => {
  return await HomeworkUploadModel.findOne({
    where: {
      student_id: student_id,
      teacher_id: teacher_id,
      course_id: course_id,
      batch_id: batch_id,
      week: week,
      day: day,
    },
  });
};

const get = async (student_id, teacher_id) => {
  let whereQuery = `WHERE uh.student_id = '${student_id}'`;

  if (teacher_id) {
    whereQuery = `WHERE uh.teacher_id = '${teacher_id}'`;
  }

  let query = `
    SELECT 
        uh.*,
        usr.image_url as student_image,
        CONCAT(usr.first_name, ' ', usr.last_name) as student_name,
        btc.batch_name,
        crs.course_name
      FROM homework_uploads uh
      LEFT JOIN students std on std.id = uh.student_id
      LEFT JOIN users usr on usr.id = std.user_id
      LEFT JOIN courses crs on crs.id = uh.course_id
      LEFT JOIN batches btc on btc.id = uh.batch_id
      ${whereQuery}
  `;

  return await HomeworkUploadModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await HomeworkUploadModel.findOne({
    where: {
      id: id,
    },
  });
};

const getByBatchId = async (batch_id) => {
  return await HomeworkUploadModel.findAll({
    where: {
      batch_id: batch_id,
    },
  });
};

const deleteById = async (id) => {
  return await HomeworkUploadModel.destroy({
    where: {
      id: id,
    },
  });
};

export default {
  init,
  create,
  get,
  getById,
  homeworkExist,
  deleteById,
  getByBatchId,
};
