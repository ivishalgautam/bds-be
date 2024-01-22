"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let HomeWorkModel = null;

const init = async (sequelize) => {
  HomeWorkModel = sequelize.define(constants.models.HOMEWORK_TABLE, {
    id: {
      allowNull: false,
      primaryKey: true,
      unique: true,
      type: sequelizeFwk.DataTypes.UUID,
      defaultValue: sequelizeFwk.DataTypes.UUIDV4,
    },
    is_disabled: {
      type: sequelizeFwk.DataTypes.BOOLEAN,
      defaultValue: true,
    },
    homework: {
      type: sequelizeFwk.DataTypes.JSONB,
      allowNull: false,
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
  });
  await HomeWorkModel.sync({ alter: true });
};

const create = async (req) => {
  return await HomeWorkModel.create({
    is_disabled: req.body?.is_disabled,
    homework: req.body.homework,
    course_id: req.body.course_id,
  });
};

const update = async (req) => {
  return await HomeWorkModel.update(
    {
      is_disabled: req.body?.is_disabled,
      homework: req.body.homework,
      course_id: req.body.course_id,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: ["id", "is_disabled", "homework", "course_id"],
      plain: true,
    }
  );
};

const get = async () => {
  let query = `
        SELECT 
            hmw.id,
            hmw.is_disabled,
            hmw.homework,
            co.id as course_id,
            co.course_name,
            co.duration
        FROM
            homeworks hmw
        INNER JOIN courses co ON co.id = hmw.course_id
    `;
  return await HomeWorkModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req, course_id) => {
  //   return console.log({ req: req.params, course_id });
  let query = `
        SELECT
            hmw.id,
            hmw.is_disabled,
            hmw.homework,
            co.id as course_id,
            co.course_name,
            co.duration
        FROM
            homeworks hmw
        INNER JOIN courses co ON co.id = hmw.course_id
        WHERE hmw.id = '${req.params.id}'
    `;
  if (course_id) {
    query += `AND course_id = '${course_id}'`;
  }
  return await HomeWorkModel.sequelize.query(query, {
    plain: true,
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByCourseId = async (course_id) => {
  let query = `
        SELECT 
            hmw.id,
            hmw.is_disabled,
            hmw.homework,
            co.id as course_id,
            co.course_name,
            co.duration
        FROM
            homeworks hmw
        INNER JOIN courses co ON co.id = hmw.course_id
        WHERE hmw.course_id = '${course_id}'
    `;
  return await HomeWorkModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const deleteById = async (req) => {
  return await HomeWorkModel.destroy({
    where: {
      id: req.params.id,
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
  getByCourseId,
};
