"use strict";

import table from "../../db/models.js";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const create = async (req, res) => {
  try {
    const record = await table.CourseModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "Course not found. Please a enter a valid course id",
      });
    }
    const homeworkRecord = await table.HomeWorkModel.getByCourseId(
      req.body.course_id
    );

    if (homeworkRecord) {
      return res
        .code(409)
        .send({ message: "Homework already created for this course!" });
    }

    await table.HomeWorkModel.create(req);

    res.send({
      message: "New homework created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.HomeWorkModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "Homework not found or homework is deleted" });
    }
    return res.send(await table.HomeWorkModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.HomeWorkModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({
        message: "Homework already deleted or not exists in our database",
      });
    }

    res.send({
      message: "Homework deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    const data = await table.HomeWorkModel.get();
    console.log({ data });
    return res.send(data);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getByCourseId = async (req, res) => {
  let homework;
  try {
    const batch = await table.BatchModel.getById(req, req.params.id);

    homework = await table.HomeWorkModel.getByCourseId(batch.course_id);

    if (req.user_data.role === "student" && !req.user_data.is_online) {
      homework = homework.map((hwk) => ({
        ...hwk,
        homework: hwk.homework.map((ele) => ({
          ...ele,
          day_wise: ele.day_wise.map((dw) => ({ ...dw, ppt_file: "" })),
        })),
      }));
    }

    return res.send(homework);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.HomeWorkModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "Homework not found" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

// for student uploaded homework
const uploadHomework = async (req, res) => {
  console.log(req.body);
  try {
    const batch = await table.BatchModel.getById(null, req.body.batch_id);

    if (!batch) {
      return res.code(404).send({ message: "batch not found!" });
    }

    const student = await table.StudentModel.getByUserId(req.user_data.id);

    const exist = await table.HomeworkUploadModel.homeworkExist(
      student.id,
      batch.teacher_id,
      req.body.course_id,
      req.body.batch_id,
      req.body.week,
      req.body.day
    );

    if (exist) {
      return res.code(409).send({ message: "Homework already uploaded!" });
    }

    await table.HomeworkUploadModel.create(req, student.id, batch.teacher_id);

    res.send({ message: "homework uploaded" });
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message });
  }
};

const getUploadedHomeworks = async (req, res) => {
  try {
    if (req.user_data.role === "teacher") {
      const teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      return res.send(await table.HomeworkUploadModel.get(null, teacher.id));
    }

    const student = await table.StudentModel.getByUserId(req.user_data.id);

    if (!student) {
      return res
        .code(404)
        .send({ message: "You are not registered as a student!" });
    }

    if (req.user_data.role === "student") {
      return res.send(await table.HomeworkUploadModel.get(student.id, null));
    }
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message });
  }
};

const deleteUploadedHomework = async (req, res) => {
  console.log({ params: req.params });
  try {
    let fileToDelete;
    const record = await table.HomeworkUploadModel.getById(req.params.id);

    if (!record) {
      return res.code(404).send({ message: "Homework not found!" });
    }

    fileToDelete = path.join(
      dirname(fileURLToPath(import.meta.url)),
      "../../../",
      record.file
    );
    console.log({ fileToDelete });
    if (req.user_data.role === "student") {
      await table.HomeworkUploadModel.deleteById(req.params.id);

      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
        console.log("file deleted");
      }
      return res.send({ message: "Homework deleted" });
    }
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message });
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  uploadHomework: uploadHomework,
  getUploadedHomeworks: getUploadedHomeworks,
  deleteUploadedHomework: deleteUploadedHomework,
  getByCourseId: getByCourseId,
};
