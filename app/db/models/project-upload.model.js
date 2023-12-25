"use strict";

import sequelizeFwk from "sequelize";
import constants from "../../lib/constants/index.js";

let ProjectUploadModel = null;

const init = async (sequelize) => {
  ProjectUploadModel = sequelize.define(
    constants.models.PROJECT_UPLOAD_TABLE,
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

  await ProjectUploadModel.sync({ alter: true });
};

const create = async (req, student_id, teacher_id) => {
  return await ProjectUploadModel.create({
    student_id: student_id,
    teacher_id: teacher_id,
    course_id: req.body.course_id,
    batch_id: req.body.batch_id,
    week: req.body.week,
    file: req.body.file,
  });
};

const projectExist = async (
  student_id,
  teacher_id,
  course_id,
  batch_id,
  week
) => {
  return await ProjectUploadModel.findOne({
    where: {
      student_id: student_id,
      teacher_id: teacher_id,
      course_id: course_id,
      batch_id: batch_id,
      week: week,
    },
  });
};

const get = async (student_id, teacher_id) => {
  let whereQuery = `WHERE pu.student_id = '${student_id}'`;

  if (teacher_id) {
    whereQuery = `WHERE pu.teacher_id = '${teacher_id}'`;
  }

  let query = `
    SELECT 
        pu.*,
        usr.image_url as student_image,
        CONCAT(usr.first_name, ' ', usr.last_name) as student_name,
        btc.batch_name,
        crs.course_name
      FROM project_uploads pu
      LEFT JOIN students std on std.id = pu.student_id
      LEFT JOIN users usr on usr.id = std.user_id
      LEFT JOIN courses crs on crs.id = pu.course_id
      LEFT JOIN batches btc on btc.id = pu.course_id
      ${whereQuery}
  `;

  return await ProjectUploadModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await ProjectUploadModel.findOne({
    where: {
      id: id,
    },
  });
};

const deleteById = async (id) => {
  return await ProjectUploadModel.destroy({
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
  projectExist,
  deleteById,
};
