"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let ProductModel = null;

const init = async (sequelize) => {
  ProductModel = sequelize.define(
    constants.models.PRODUCT_TABLE,
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
      category: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      tags: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      product_type: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      short_description: {
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
      regular_price: {
        type: sequelizeFwk.DataTypes.FLOAT,
        allowNull: false,
      },
      discount_price: {
        type: sequelizeFwk.DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      thumbnail: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      product_gallery: {
        type: sequelizeFwk.DataTypes.JSONB,
        defaultValue: [],
      },
      product_videos: {
        type: sequelizeFwk.DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await ProductModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductModel.create({
    title: req.body.title,
    product_type: req.body?.product_type,
    category: req.body?.category,
    tags: req.body?.tags,
    short_description: req.body.short_description,
    product_gallery: req.body?.product_gallery,
    thumbnail: req.body.thumbnail,
    regular_price: req.body?.regular_price,
    discount_price: req.body?.discount_price,
    product_videos: req.body?.product_videos,
  });
};

const update = async (req) => {
  return await ProductModel.update(
    {
      title: req.body?.title,
      product_type: req.body?.product_type,
      category: req.body?.category,
      tags: req.body?.tags,
      short_description: req.body?.short_description,
      product_gallery: req.body?.product_gallery,
      thumbnail: req.body?.thumbnail,
      regular_price: req.body?.regular_price,
      discount_price: req.body?.discount_price,
      product_videos: req.body?.product_videos,
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
  return await ProductModel.findAll();
};

const getById = async (req, id) => {
  return await ProductModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
  });
};

const deleteById = async (req) => {
  return await ProductModel.destroy({
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
  getById,
  deleteById,
};
