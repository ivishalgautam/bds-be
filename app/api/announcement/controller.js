"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    await table.AnnouncementModel.create(req);
    return res.send({
      message: "Announcement created",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  let record;
  try {
    record = await table.AnnouncementModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "Announcement not found. Please enter a valid announcement id",
      });
    }
    return res.send(await table.AnnouncementModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

// admin
const get = async (req, res) => {
  let sub_user_id = null;
  let master_user_id = null;
  try {
    if (req.user_data.role === "sub_franchisee") {
      const sub = await table.FranchiseeModel.getByUserId(
        null,
        req.user_data.id
      );

      if (!sub) {
        return res.code(404).send({ message: "Franchisee not exist!" });
      }

      const master = await table.FranchiseeModel.getById(
        null,
        sub.dataValues.franchisee_id
      );

      master_user_id = master.user_id;
    }

    if (req.user_data.role === "teacher") {
      const teacher = await table.TeacherModel.getByUserId(req.user_data.id);

      if (!teacher) {
        return res.code(404).send({ message: "teacher not exist!" });
      }

      const sub = await table.FranchiseeModel.getById(
        null,
        teacher.dataValues.sub_franchisee_id
      );

      sub_user_id = sub.user_id;
    }

    if (req.user_data.role === "student") {
      const student = await table.StudentModel.getByUserId(req.user_data.id);

      if (!student) {
        return res.code(404).send({ message: "student not exist!" });
      }

      const sub = await table.FranchiseeModel.getById(
        null,
        student.dataValues.sub_franchisee_id
      );

      sub_user_id = sub.user_id;
    }

    return res.send(
      await table.AnnouncementModel.getAll(req, sub_user_id, master_user_id)
    );
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.AnnouncementModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "Announcement not found. Please enter a valid announcement id",
      });
      return;
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getByUserId = async (req, res) => {
  try {
    const record = await table.AnnouncementModel.getByUserId(req);
    if (!record) {
      return res.code(404).send({
        message: "Announcement not found. You don't have any announcement",
      });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.AnnouncementModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "Announcement not found or deleted already" });
    }
    return res.send({
      message: "Announcement deleted successfully",
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
  get: get,
  getById: getById,
  deleteById: deleteById,
};
