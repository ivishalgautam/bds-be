"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const user = await table.UserModel.getById(undefined, req.body.user_id);
    if (!user) {
      return res.code(404).send({ message: "user not exists in our database" });
    }
    const record = await table.AddressModel.getByUserId(req.body.user_id);

    if (record) {
      return res.code(409).send({
        message: "user address already exists. you can update your address",
      });
    }
    await table.AddressModel.create(req, req.body.user_id);
    return res.send({
      message: "Address created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.AddressModel.getByUserId(req.params.userid);
    if (!record) {
      return res
        .code(404)
        .send({ message: "Address not exists in our database" });
    }
    return res.send(await table.AddressModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

// only for admin use
const getByUserId = async (req, res) => {
  try {
    const record = await table.AddressModel.getByUserId(req.params.userid);
    if (!record) {
      return res
        .code(404)
        .send({ message: "Address not exists in our database" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.AddressModel.deleteById(req.params.userid);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "Address not exists in our database" });
    }
    return res.send({
      message: "Address deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

export default {
  create: create,
  update: update,
  getByUserId: getByUserId,
  deleteById: deleteById,
};
