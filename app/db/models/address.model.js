"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let AddressModel = null;

const init = async (sequelize) => {
  AddressModel = sequelize.define(constants.models.ADDRESS_TABLE, {
    id: {
      allowNull: false,
      primaryKey: true,
      unique: true,
      type: sequelizeFwk.DataTypes.UUID,
      defaultValue: sequelizeFwk.DataTypes.UUIDV4,
    },
    office_address: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: sequelizeFwk.DataTypes.JSONB,
      allowNull: false,
    },
    state: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
    },
    pin_code: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
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
  });
  await AddressModel.sync({ alter: true });
};

// admin use
const create = async (req, user_id) => {
  return await AddressModel.create({
    office_address: req.body.office_address,
    district: req.body.district,
    state: req.body.state,
    country: req.body.country,
    pin_code: req.body.pin_code,
    user_id: user_id,
  });
};

//
// const createByUser = async (req) => {
//     return await AddressModel.create({
//         house_number: req.body.house_number,
//         street_number: req.body.street_number,
//         district: req.body.district,
//         state: req.body.state,
//         country: req.body.country,
//         pin_code: req.body.pin_code,
//         user_id: req.user_data.user_id,
//     });
// };

const update = async (req, user_id) => {
  return await AddressModel.update(
    {
      office_address: req.body?.office_address,
      district: req.body?.district,
      state: req.body?.state,
      country: req.body?.country,
      pin_code: req.body?.pin_code,
    },
    {
      where: {
        user_id: req.params?.userid,
      },
      returning: true,
      plain: true,
    }
  );
};

const getByUserId = async (user_id) => {
  return await AddressModel.findOne({
    where: {
      user_id: user_id,
    },
  });
};

const deleteById = async (user_id) => {
  return await AddressModel.destroy({
    where: {
      user_id: user_id,
    },
  });
};

export default {
  init,
  create,
  update,
  getByUserId,
  deleteById,
  // createByUser,
};
