"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ZoomUserModel = null;

const init = async (sequelize) => {
  ZoomUserModel = sequelize.define(
    constants.models.ZOOM_USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
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
      host_id: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await ZoomUserModel.sync({ alter: true });
};

const create = async (user_id, host_id) => {
  return await ZoomUserModel.create({
    user_id: user_id,
    host_id: host_id,
  });
};

const get = async () => {
  let query = `
                SELECT
                    *
                FROM 
                    zoom_users zu
                INNER JOIN users usr ON usr.id = zu.user_id
              `;
  return await ZoomUserModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await ZoomUserModel.findOne({
    where: {
      id: id,
    },
  });
};

const getByUserId = async (user_id) => {
  return await ZoomUserModel.findOne({
    where: {
      user_id: user_id,
    },
    raw: true,
  });
};

export default {
  init,
  create,
  get,
  getById,
  getByUserId,
};
