"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let LeadsModel = null;

const init = async (sequelize) => {
  LeadsModel = sequelize.define(constants.models.LEVEL_TABLE, {
    id: {
      allowNull: false,
      primaryKey: true,
      type: sequelizeFwk.DataTypes.UUID,
      defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      unique: true,
    },
    fullname: {
      allowNull: false,
      type: sequelizeFwk.DataTypes.STRING,
    },
    phone: {
      allowNull: false,
      type: sequelizeFwk.DataTypes.STRING,
    },
    email: {
      allowNull: false,
      type: sequelizeFwk.DataTypes.STRING,
    },
    course_id: {
      allowNull: false,
      type: sequelizeFwk.DataTypes.UUID,
      onDelete: "CASCADE",
      references: {
        model: constants.models.COURSES_TABLE,
        key: "id",
      },
    },
    franchisee_id: {
      allowNull: false,
      type: sequelizeFwk.DataTypes.UUID,
      onDelete: "CASCADE",
      references: {
        model: constants.models.FRANCHISEE_TABLE,
        key: "id",
      },
    },
  });

  await LeadsModel.sync({ alter: true });
};

const create = async (req, fran_id) => {
  return await LeadsModel.create({
    fullname: req.body.fullname,
    phone: req.body.phone,
    email: req.body.email,
    course_id: req.body.course_id,
    franchisee_id: fran_id,
  });
};

const get = async () => {
  const query = `
            SELECT 
                lds.*,
                frn.franchisee_name,
                crs.course_name
              FROM leads lds
            JOIN franchisees frn ON frn.id = lds.franchisee_id
            JOIN users usr ON usr.id = frn.user_id
            JOIN courses crs ON crs.id = lds.course_id
    `;

  return await LeadsModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

export default {
  init: init,
  create: create,
  get: get,
};
