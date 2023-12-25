"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const student = await table.StudentModel.getByUserId(req.user_data.id);

    if (!student) {
      return res.code(404).send({ message: "student not found!" });
    }

    let record = await table.RewardModel.getByStudentId(student.id);

    if (record) {
      return res.code(409).send({ message: "Reward already exist!" });
    }

    await table.RewardModel.create(req);
    res.send({ message: "Reward added" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const update = async (req, res) => {
  try {
    const student = await table.StudentModel.getById(req.params.student_id);

    if (!student) {
      return res.code(404).send({ message: "student not found!" });
    }

    // return console.log({ student, body: req.body });

    let record = await table.RewardModel.getByStudentId(student.id);

    if (!record) {
      await table.RewardModel.create(req, student.id);
    } else {
      await table.RewardModel.updateByStudentId(
        record.reward_points + parseInt(req.body.reward_points),
        student?.id
      );
    }

    res.send({ message: "Reward updated" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const student = await table.StudentModel.getByUserId(req.user_data.id);

    if (!student) {
      return res.code(404).send({ message: "student not found!" });
    }

    let record = await table.RewardModel.getByStudentId(student.id);

    if (record) {
      return res.code(409).send({ message: "Reward already exist!" });
    }

    await table.RewardModel.deleteById(req, student?.id);
    res.send({ message: "Reward updated" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const get = async (req, res) => {
  try {
    if (req.user_data.role === "student") {
      const record = await table.StudentModel.getByUserId(req.user_data.id);

      return res.send(await table.RewardModel.get(req, record.id));
    }
    res.send(await table.RewardModel.get(req, null));
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const student = await table.RewardModel.getById(req.params.id);

    if (!student) {
      return res.code(404).send({ message: "student not found!" });
    }

    res.send(await table.RewardModel.getByStudentId(req.params.student_id));
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create,
  update,
  deleteById,
  get,
  getById,
};
