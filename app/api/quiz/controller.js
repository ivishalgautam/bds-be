"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const record = await table.CourseModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "Course not found. Please enter a valid course name",
      });
    }

    const quizExist = await table.QuizModel.getByWeekAndCourseId(
      req.body.weeks,
      req.body.course_id
    );

    if (quizExist.length > 0) {
      return res
        .code(409)
        .send({ message: `Quiz already exist for week: ${req.body.weeks}` });
    }

    await table.QuizModel.create(req);
    return res.send({
      message: "New quiz created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  let record;
  try {
    record = await table.QuizModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "quiz not found or deleted" });
    }
    if (req.body?.course_id) {
      record = await table.CourseModel.getById(req);
      if (!record) {
        return res.code(404).send({
          message: "Course not found. Please enter a valid course name",
        });
      }
    }
    return res.send(await table.QuizModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.QuizModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({ message: "quiz not found or deleted" });
    }
    return res.send({
      message: "Quiz deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    return res.send(await table.QuizModel.get());
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.QuizModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "quiz not found or deleted" });
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
