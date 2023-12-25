"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    await table.NotesModel.create(req);
    return res.send({
      message: "New notes created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.NotesModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "notes not found or notes is deleted" });
    }
    return res.send(await table.NotesModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.NotesModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "notes not found or notes is deleted" });
    }
    return res.send({
      message: "notes deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    return res.send(await table.NotesModel.get(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.NotesModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "notes not found or notes is deleted" });
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
