"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let NotesModel = null;

const init = async (sequelize) => {
  NotesModel = sequelize.define(
    constants.models.NOTES_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      title: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: sequelizeFwk.DataTypes.ENUM({
          values: ["notes", "to_do"],
        }),
        allowNull: false,
      },
      text: {
        type: sequelizeFwk.DataTypes.TEXT,
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
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await NotesModel.sync({ alter: true });
};

const create = async (req) => {
  return await NotesModel.create({
    title: req.body.title,
    type: req.body.type,
    text: req.body.text,
    user_id: req.user_data.id,
  });
};

const update = async (req) => {
  return await NotesModel.update(
    {
      title: req.body?.title,
      type: req.body?.type,
      text: req.body?.text,
    },
    {
      where: {
        id: req.params.id,
        user_id: req.user_data.id,
      },
      returning: true,
      plain: true,
    }
  );
};

const get = async (req) => {
  let type = "notes";
  if (req.query.type) {
    type = req.query.type;
  }
  return await NotesModel.findAll({
    where: {
      user_id: req.user_data.id,
      type: type,
    },
  });
};

const getById = async (req, id) => {
  return await NotesModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
  });
};

const deleteById = async (req) => {
  return await NotesModel.destroy({
    where: {
      id: req.params.id,
      user_id: req.user_data.id,
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
};
