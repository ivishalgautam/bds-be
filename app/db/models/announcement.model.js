"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let AnnouncementModel = null;

const init = async (sequelize) => {
  AnnouncementModel = sequelize.define(
    constants.models.ANNOUNCEMENT_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      headline: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      image_url: {
        type: sequelizeFwk.DataTypes.STRING,
        defaultValue: "",
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
  await AnnouncementModel.sync({ alter: true });
};

const create = async (req) => {
  return await AnnouncementModel.create({
    headline: req.body.headline,
    description: req.body.description,
    user_id: req.user_data.id,
    image_url: req.body.image_url,
  });
};

const update = async (req) => {
  return await AnnouncementModel.update(
    {
      headline: req.body?.headline,
      description: req.body?.description,
      image_url: req.body?.image_url,
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

const getAll = async (req, sub_user_id, master_user_id) => {
  let whereQuery = "";

  if (req.user_data.role === "master_franchisee") {
    whereQuery = `WHERE usr.role ='admin'
                      OR anmt.user_id = '${req.user_data.id}'
                    `;
  }

  if (req.user_data.role === "sub_franchisee") {
    whereQuery = `WHERE anmt.user_id = '${master_user_id}'
                      OR  anmt.user_id = '${req.user_data.id}'
                    `;
  }

  if (req.user_data.role === "teacher") {
    whereQuery = `WHERE anmt.user_id ='${sub_user_id}'
                      OR anmt.user_id = '${req.user_data.id}'
                    `;
  }

  if (req.user_data.role === "student") {
    whereQuery = `WHERE anmt.user_id ='${sub_user_id}'
                      OR anmt.user_id = '${req.user_data.id}'
                    `;
  }

  let query = `
        SELECT
            anmt.id,
            anmt.headline,
            anmt.description,
            anmt.image_url as announcement_image_url,
            anmt.created_at,
            usr.first_name,
            usr.last_name,
            usr.username,
            usr.image_url,
            usr.profession
        FROM
            announcements AS anmt
        INNER JOIN users AS usr ON usr.id = anmt.user_id
        ${whereQuery}
        ORDER BY
            anmt.created_at DESC
    `;

  return await AnnouncementModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req) => {
  return await AnnouncementModel.findOne({
    where: {
      id: req.params.id,
    },
  });
};

// user dashboard
const getByUserId = async (req) => {
  return await AnnouncementModel.findAll({
    where: {
      user_id: req.user_data.id,
    },
    order: [["created_at", "DESC"]],
  });
};

const deleteById = async (req) => {
  return await AnnouncementModel.destroy({
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
  getByUserId,
  deleteById,
};
