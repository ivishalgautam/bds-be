"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let RewardModel;

const init = async (sequelize) => {
  RewardModel = sequelize.define(
    constants.models.REWARD_TABLE,
    {
      id: {
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        allowNull: false,
      },
      student_id: {
        type: sequelizeFwk.DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        unique: true,
        references: {
          model: constants.models.STUDENT_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      reward_points: {
        type: sequelizeFwk.DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await RewardModel.sync({ alter: true });
};

const create = async (req, student_id) => {
  return await RewardModel.create({
    student_id: student_id,
    reward_points: req.body.reward_points,
  });
};

const updateByStudentId = async (reward, student_id) => {
  return await RewardModel.update(
    {
      reward_points: reward,
    },
    {
      where: {
        student_id: student_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const get = async (req, student_id) => {
  let whereQuery = "";

  if (req.user_data.role === "student") {
    whereQuery = `WHERE student_id = '${student_id}'`;
  }

  let query = `
    SELECT 
        *
      FROM 
      rewards
      ${whereQuery}
  `;
  return await RewardModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByStudentId = async (student_id) => {
  return await RewardModel.findOne({
    where: {
      student_id: student_id,
    },
  });
};

const getById = async (id) => {
  return await RewardModel.findOne({
    where: {
      id: id,
    },
  });
};

const deleteById = async (req) => {
  return await RewardModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

export default {
  init,
  create,
  updateByStudentId,
  get,
  getByStudentId,
  deleteById,
  getById,
};
