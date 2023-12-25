"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductEnquiryModel;

const init = async (sequelize) => {
  ProductEnquiryModel = sequelize.define(
    constants.models.PRODUCT_ENQUIRY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      user_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        referances: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      product_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        referances: {
          model: constants.models.PRODUCT_TABLE,
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

  await ProductEnquiryModel.sync({ alter: true });
};

const create = async (user_id, product_id) => {
  return await ProductEnquiryModel.create({
    user_id: user_id,
    product_id: product_id,
  });
};

const exist = async (user_id, product_id) => {
  return await ProductEnquiryModel.findOne({
    where: { user_id: user_id, product_id: product_id },
  });
};

const get = async () => {
  return await ProductEnquiryModel.findAll();
};

const getById = async (id) => {
  return await ProductEnquiryModel.findOne({
    where: { id: id },
  });
};

const deleteById = async (id) => {
  return await ProductEnquiryModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
  exist: exist,
};
