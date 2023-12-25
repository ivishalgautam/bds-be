"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let QuizModel = null;

const init = async (sequelize) => {
  QuizModel = sequelize.define(
    constants.models.QUIZ_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      quiz_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      weeks: {
        type: sequelizeFwk.DataTypes.INTEGER,
        allowNull: false,
      },
      is_disabled: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: true,
      },
      questions: {
        type: sequelizeFwk.DataTypes.JSONB,
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await QuizModel.sync({ alter: true });
};

const create = async (req) => {
  return await QuizModel.create({
    quiz_name: req.body.quiz_name,
    weeks: req.body.weeks,
    is_disabled: req.body?.is_disabled,
    questions: req.body.quizs,
    course_id: req.body.course_id,
  });
};

const get = async () => {
  const query = `
        SELECT
            qu.id,
            qu.quiz_name,
            qu.weeks,
            qu.is_disabled,
            qu.questions,
            co.id as course_id,
            co.course_name
        FROM
            quizs qu
        INNER JOIN courses co ON co.id = qu.course_id
    `;
  return await QuizModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByCourseId = async (course_id) => {
  const query = `
        SELECT
            *
        FROM
            quizs
        WHERE course_id = '${course_id}'
    `;
  return await QuizModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByWeekAndCourseId = async (week, course_id) => {
  const query = `
        SELECT
            *
        FROM
            quizs
        WHERE weeks = '${week}' AND course_id = '${course_id}'
    `;
  return await QuizModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req, course_id) => {
  let query = `
        SELECT 
            qu.id,
            qu.quiz_name,
            qu.weeks,
            qu.is_disabled,
            qu.questions,
            co.id as course_id,
            co.course_name
        FROM
            quizs qu
        INNER JOIN courses co ON co.id = qu.course_id
        WHERE qu.id = '${req.params.id}'
    `;
  if (course_id) {
    query += `AND qu.course_id = '${course_id}'`;
  }
  return await QuizModel.sequelize.query(query, {
    plain: true,
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const update = async (req, course_id) => {
  return await QuizModel.update(
    {
      quiz_name: req.body?.quiz_name,
      weeks: req.body?.weeks,
      is_disabled: req.body?.is_disabled,
      questions: req.body?.quizs,
      course_id: req.body?.course_id,
    },
    {
      where: {
        id: req.params.id || course_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const enableQuiz = async (status, course_id) => {
  return await QuizModel.update(
    {
      is_disabled: status,
    },
    {
      where: {
        id: course_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const deleteById = async (req) => {
  return await QuizModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

export default {
  init,
  create,
  get,
  getById,
  update,
  deleteById,
  getByWeekAndCourseId,
  getByCourseId,
};
