"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const teacher_id = (await table.TeacherModel.getByUserId(req.user_data.id))
      .id;
    if (!teacher_id) {
      return res.send({
        message: "you do not have permissions to upload video",
      });
    }
    await table.RecordingModel.create(req, teacher_id);
    return res.send({
      message: "New recordings created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const teacher_id = (await table.TeacherModel.getByUserId(req.user_data.id))
      .id;
    if (!teacher_id) {
      return res
        .code(400)
        .send({ message: "you have not permissions to upload video" });
    }
    const record = await table.RecordingModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "recordings not found or recordings is deleted" });
    }
    return res.send(await table.RecordingModel.update(req, teacher_id));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.RecordingModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "recording not found or product is deleted" });
    }
    return res.send({
      message: "Recording deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    if (req.user_data.role === "teacher") {
      const teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      if (!teacher) {
        return res.code(404).send({ message: "teacher not exists" });
      }
      return res.send(await table.RecordingModel.get(req, teacher.id));
    }
    if (req.user_data.role === "student") {
      const student = await table.StudentModel.getByUserId(req.user_data.id);
      const recordings = await table.RecordingModel.get(req, student.id);
      return res.send(recordings);
    }
    return res.send({ message: "You have not permissions to view recordings" });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.RecordingModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "recordings not found or recordings is deleted",
      });
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
