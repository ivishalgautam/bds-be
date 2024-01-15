"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let BatchModel = null;

const init = async (sequelize) => {
  BatchModel = sequelize.define(
    constants.models.BATCH_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      batch_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      course_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      teacher_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.TEACHER_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      students_id: {
        type: sequelizeFwk.DataTypes.JSONB,
        defaultValue: [],
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
      franchisee_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.FRANCHISEE_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sub_franchisee_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.FRANCHISEE_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_syllabus: {
        type: sequelizeFwk.DataTypes.JSONB,
        allowNull: false,
      },
      quiz: {
        type: sequelizeFwk.DataTypes.JSONB,
        default: [],
      },
      start_time: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      end_time: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await BatchModel.sync({ alter: true });
};

const create = async (
  req,
  franchisee_id,
  sub_franchisee_id,
  course_name,
  course_syllabus,
  quiz
) => {
  return await BatchModel.create({
    batch_name: req.body.batch_name,
    course_name: course_name,
    course_syllabus: course_syllabus,
    teacher_id: req.body.teacher_id,
    students_id: req.body.students_ids,
    course_id: req.body.course_id,
    sub_franchisee_id: sub_franchisee_id,
    franchisee_id: franchisee_id,
    quiz: quiz,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
  });
};

const get = async (teacher_id, sub_franchisee_id, student_id) => {
  let wherQuery = "";

  if (teacher_id) {
    wherQuery = `WHERE bt.teacher_id = '${teacher_id}'`;
  }

  if (sub_franchisee_id) {
    wherQuery = `WHERE bt.sub_franchisee_id = '${sub_franchisee_id}'`;
  }

  if (student_id) {
    wherQuery = `WHERE bt.students_id @> '["${student_id}"]'::jsonb`;
  }

  if (!wherQuery) {
    return [];
  }

  let query = `
        SELECT 
            bt.id,
            usr.first_name as teacher_first_name,
            usr.last_name as teacher_last_name,
            usr.username as teacher_username,
            bt.batch_name,
            bt.course_name,
            bt.teacher_id,
            bt.students_id,
            bt.course_id,
            bt.franchisee_id,
            bt.sub_franchisee_id,
            bt.course_syllabus,
            bt.quiz,
            crs.course_thumbnail,
            grp.id as group_id
        FROM
            batches bt
        INNER JOIN teachers tc ON tc.id = bt.teacher_id
        INNER JOIN users usr ON usr.id = tc.user_id
        INNER JOIN courses crs ON crs.id = bt.course_id
        INNER JOIN groups grp ON grp.batch_id = bt.id 
        ${wherQuery}
        ORDER BY bt.created_at DESC
    `;

  console.log({ query, wherQuery });

  return await BatchModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req, batch_id) => {
  return await BatchModel.findOne({
    where: {
      id: req?.params?.id || batch_id,
    },
  });
};

const getByCourseId = async (course_id) => {
  return await BatchModel.findOne({
    where: {
      course_id: course_id,
    },
  });
};

const update = async (req, course_name) => {
  // console.log("req.body");
  return await BatchModel.update(
    {
      batch_name: req.body?.batch_name,
      course_name: course_name,
      teacher_id: req.body?.teacher_id,
      students_id: req.body?.students_ids,
      course_id: req.body?.course_id,
      course_syllabus: req.body.course_syllabus,
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

const updateBatchSyllabusById = async (batch_id, syllabus) => {
  // console.log("req.body");
  return await BatchModel.update(
    {
      course_syllabus: syllabus,
    },
    {
      where: {
        id: batch_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const deleteById = async (req) => {
  return await BatchModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

const countBatch = async (teacher_id, last_30_days = false) => {
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
  if (teacher_id) {
    where_query.teacher_id = teacher_id;
  }

  return await BatchModel.count({
    where: where_query,
  });
};

export default {
  init,
  create,
  get,
  getById,
  update,
  deleteById,
  countBatch,
  getByCourseId,
  updateBatchSyllabusById,
};
