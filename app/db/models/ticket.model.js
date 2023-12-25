"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let TicketModel = null;

const init = async (sequelize) => {
  TicketModel = sequelize.define(
    constants.models.TICKET_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      heading: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
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
  await TicketModel.sync({ alter: true });
};

const create = async (req) => {
  return await TicketModel.create({
    heading: req.body.heading,
    description: req.body.description,
    user_id: req.user_data.id,
  });
};

// admin dashboard
const update = async (req) => {
  return await TicketModel.update(
    {
      answer: req?.body?.answer,
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

const updateByUser = async (req) => {
  return await TicketModel.update(
    {
      heading: req.body?.heading,
      description: req.body?.description,
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

const getAll = async (req) => {
  let whereQuery;
  if (req.user_data.role !== "admin") {
    whereQuery = `WHERE ts.user_id = '${req.user_data.id}'`;
  } else {
    whereQuery = "";
  }
  let query = `
        SELECT
            ts.id,
            ts.created_at,
            ts.heading,
            ts.description,
            ts.answer,
            usr.first_name,
            usr.last_name,
            usr.username,
            usr.image_url,
            usr.profession
        FROM
            tickets ts
        INNER JOIN users usr ON usr.id = ts.user_id
        ${whereQuery}
        ORDER BY created_at DESC
    `;

  return await TicketModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req) => {
  return await TicketModel.findOne({
    where: {
      id: req.params.id,
    },
  });
};

const deleteById = async (req) => {
  return await TicketModel.destroy({
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
  getById,
  getAll,
  deleteById,
  updateByUser,
};
