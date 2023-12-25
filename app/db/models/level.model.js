"use strict";

import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let LevelModel;

const init = async (sequelize) => {
  LevelModel = sequelize.define(
    constants.models.LEVEL_TABLE,
    {
      id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        primaryKey: true,
      },
      level: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.INTEGER,
      },
      min_reward_point: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.INTEGER,
      },
      color: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await LevelModel.sync({ alter: true });
};

const create = async (req) => {
  return await LevelModel.create({
    level: req.body.level,
    min_reward_point: req.body.min_reward_point,
    color: req.body.color,
  });
};

const update = async (req) => {
  return await LevelModel.update(
    {
      level: req.body.level,
      min_reward_point: req.body.min_reward_point,
      color: req.body.color,
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

const get = async () => {
  return await LevelModel.findAll({
    order: [["level", "ASC"]],
  });
};

const getById = async (id) => {
  return await LevelModel.findOne({
    where: {
      id: id,
    },
  });
};

const getByLevel = async (level) => {
  return await LevelModel.findOne({
    where: {
      level: level,
    },
  });
};

const getByRewardPoint = async (min_reward_point) => {
  return await LevelModel.findOne({
    where: {
      min_reward_point: min_reward_point,
    },
  });
};

const deleteById = async (id) => {
  return await LevelModel.destroy({
    where: {
      id: id,
    },
  });
};

export default {
  init,
  create,
  update,
  get,
  getById,
  getByLevel,
  deleteById,
  getByRewardPoint,
};
