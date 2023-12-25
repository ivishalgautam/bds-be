"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    await table.GroupModel.create(req);
    return res.send({
      message: "New group created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.GroupModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "group not found or group is deleted" });
    }
    return res.send(await table.GroupModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.GroupModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "group not found or group is deleted" });
    }
    return res.send({
      message: "group deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    return res.send(await table.GroupModel.get(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.GroupModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "group not found or group is deleted" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};
