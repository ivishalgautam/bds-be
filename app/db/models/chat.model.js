"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ChatModel = null;

const init = async (sequelize) => {
  ChatModel = sequelize.define(
    constants.models.CHAT_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      message: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      message_to: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      message_from: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      group_chat_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.GROUP_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await ChatModel.sync({ alter: true });
};

const create = async (message, message_from, message_to, group_id) => {
  let record;
  record = {
    message: message,
    message_from: message_from,
  };

  if (message_to) {
    record.message_to = message_to;
  }

  if (group_id) {
    record.group_chat_id = group_id;
  }

  return await ChatModel.create(record);
};

const update = async (message, message_from, message_to, groupId) => {
  let record;
  record = {
    message: message,
    message_from: message_from,
  };

  if (message_to) {
    record.message_to = message_to;
  }

  if (groupId) {
    record.group_chat_id = groupId;
  }

  return await ChatModel.update(record, {
    where: {
      id: req.params.id,
    },
    returning: true,
    plain: true,
  });
};

const get = async (req) => {
  let query = `
        SELECT 
          cht.message,
          cht.message_from as message_from_id,
          cht.created_at,
          cht.updated_at,
          CONCAT(usr.first_name, ' ', usr.last_name) as message_from_fullname,
          usr.image_url,
          usr.profession,
          usr.role
        FROM chats cht
        JOIN users usr ON cht.message_from = usr.id OR cht.message_to = usr.id
        WHERE
          cht.group_chat_id = '${req.params.group_chat_id}' 
        ORDER BY cht.created_at
        `;
  // WHERE
  //   cht.message_to = '${req.user_data.id}'
  // OR
  //   cht.message_from = '${req.user_data.id}'
  // AND

  return await ChatModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getChats = async (req) => {
  let query = `
        SELECT DISTINCT
            usr.id,
            usr.role,
            usr.username,
            usr.image_url
        FROM chats cht
        JOIN users usr ON cht.message_from = usr.id OR cht.message_to = usr.id  
        WHERE 
            cht.message_to = '${req.user_data.id}' 
        OR 
            cht.message_from = '${req.user_data.id}' 
        AND 
            cht.group_chat_id = '${req.params.group_chat_id}'  
    `;

  return await ChatModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req, id) => {
  return await ChatModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
  });
};

const deleteById = async (req) => {
  return await ChatModel.destroy({
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
  getChats,
  getById,
  deleteById,
};
