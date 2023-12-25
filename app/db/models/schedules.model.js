"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ScheduleModel = null;

const init = async (sequelize) => {
  ScheduleModel = sequelize.define(
    constants.models.SCHEDULE_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      batch_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.BATCH_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      schedule_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      schedule_desc: {
        type: sequelizeFwk.DataTypes.STRING,
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
  await ScheduleModel.sync({ alter: true });
};

const create = async (req, batch_id, start_time, end_time) => {
  // console.log({ start_time, end_time });
  return await ScheduleModel.create({
    batch_id: req.body.batch_id || batch_id,
    schedule_name: req.body.schedule_name,
    schedule_desc: req.body.schedule_desc,
    start_time: `${req.body.start_time}T${start_time}`,
    end_time: `${req.body.end_time}T${end_time}`,
  });
};

const get = async () => {
  return await ScheduleModel.findAll();
};

const getByScheduleId = async (schedule_id) => {
  return await ScheduleModel.findOne({
    where: {
      id: schedule_id,
    },
  });
};

const getById = async (req, batch_id, student_id) => {
  let whereQuery = `WHERE batch_id = '${batch_id}'`;

  if (req.user_data.role === "student") {
    whereQuery += ` AND btc.students_id @> '["${student_id}"]'::jsonb`;
  }

  const query = `
          SELECT
              sch.*,
              btc.course_name,
              usr.first_name as teacher_firstname,
              usr.last_name as teacher_lastname,
              usr.image_url as teacher_image
          FROM schedules sch
              JOIN batches btc ON btc.id = sch.batch_id
              JOIN teachers tch ON tch.id = btc.teacher_id
              JOIN users usr ON usr.id = tch.user_id
          ${whereQuery}
          ;
  `;

  return await ScheduleModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByStartTimeAndBatchId = async (req, batch_id) => {
  // console.log({ start_time: req.body.start_time, batch_id });
  return await ScheduleModel.findOne({
    where: {
      batch_id: req?.body?.batch_id || batch_id,
      start_time: req.body.start_time,
    },
  });
};

const update = async (req, batch_id) => {
  return await ScheduleModel.update(
    {
      batch_id: req.body?.batch_id || batch_id,
      schedule_name: req?.body?.schedule_name,
      schedule_desc: req?.body?.schedule_desc,
      start_time: req?.body?.start_time,
      end_time: req?.body?.end_time,
    },
    {
      where: {
        id: req.params.schedule_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const deleteById = async (req) => {
  return await ScheduleModel.destroy({
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
  getByStartTimeAndBatchId,
  update,
  deleteById,
  getByScheduleId,
};
