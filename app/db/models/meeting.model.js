"use strict";

import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let MeetingModel = null;

const init = async (sequelize) => {
  MeetingModel = sequelize.define(
    constants.models.MEETING_TABLE,
    {
      id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        primaryKey: true,
      },
      meeting_uuid: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.TEXT,
      },
      meeting_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.BIGINT,
      },
      meeting_topic: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.TEXT,
      },
      start_url: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.TEXT,
      },
      join_url: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.TEXT,
      },
      start_time: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.STRING,
      },
      meeting_by: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
        },
      },
      batch_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.BATCH_TABLE,
          key: "id",
        },
      },
      passcode: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.BIGINT,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await MeetingModel.sync({ alter: true });
};

const create = async (req, meeting) => {
  return await MeetingModel.create({
    meeting_uuid: meeting.uuid,
    meeting_id: meeting.id,
    meeting_topic: req.body.meeting_topic,
    start_url: meeting.start_url,
    join_url: meeting.join_url,
    meeting_by: req.user_data.id,
    batch_id: req.body.batch_id,
    start_time: meeting.start_time,
    passcode: meeting.password,
  });
};

const get = async (user_id) => {
  const query = `
          SELECT 
              m.*,
              btc.batch_name
            FROM meetings m
            LEFT JOIN users usr on usr.id = m.meeting_by
            LEFT JOIN batches btc on btc.id = m.batch_id
            WHERE m.meeting_by = '${user_id}'
            ORDER BY m.created_at DESC;
  `;

  return await MeetingModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const deleteById = async (id) => {
  return MeetingModel.destroy({
    where: {
      id: id,
    },
  });
};

export default { init: init, create: create, get: get, deleteById: deleteById };
