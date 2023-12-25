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
    if (parseInt(record.duration) < req.body.weeks) {
      return res
        .code(400)
        .send({ message: "weeks not greater than course duration" });
    }

    const project = await table.ProjectModel.checkExist(req);
    if (project) {
      return res.send(
        "already_exists",
        "project already exists for this week you can update or create a new weeks project"
      );
      return;
    }
    await table.ProjectModel.create(req);
    return res.send({
      message: "New project created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.ProjectModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "Project not found or project is deleted" });
    }
    if (req.body?.course_id) {
      const course = await table.CourseModel.getById(req);
      if (!course) {
        return res
          .code(404)
          .send({ message: "Course not found or course is deleted" });
      }
    }
    return res.send(await table.ProjectModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProjectModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({
        message: "Project already deleted or not exists in our database",
      });
    }
    return res.send({
      message: "Project deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    return res.send(await table.ProjectModel.get());
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProjectModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "Project not found" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

// for student uploaded homework
const uploadProject = async (req, res) => {
  console.log(req.body);
  try {
    const batch = await table.BatchModel.getById(null, req.body.batch_id);

    if (!batch) {
      return res.code(404).send({ message: "batch not found!" });
    }

    const student = await table.StudentModel.getByUserId(req.user_data.id);

    const exist = await table.ProjectUploadModel.projectExist(
      student.id,
      batch.teacher_id,
      req.body.course_id,
      req.body.batch_id,
      req.body.week,
      req.body.day
    );

    if (exist) {
      return res.code(409).send({ message: "Project already uploaded!" });
    }

    await table.ProjectUploadModel.create(req, student.id, batch.teacher_id);

    res.send({ message: "Project uploaded" });
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message });
  }
};

const getUploadedProjects = async (req, res) => {
  try {
    if (req.user_data.role === "teacher") {
      const teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      return res.send(await table.ProjectUploadModel.get(null, teacher.id));
    }

    const student = await table.StudentModel.getByUserId(req.user_data.id);

    if (!student) {
      return res
        .code(404)
        .send({ message: "You are not registered as a student!" });
    }

    if (req.user_data.role === "student") {
      return res.send(await table.ProjectUploadModel.get(student.id, null));
    }
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message });
  }
};

const deleteUploadedProject = async (req, res) => {
  //   console.log({ params: req.params });
  try {
    let fileToDelete;
    const record = await table.ProjectUploadModel.getById(req.params.id);

    if (!record) {
      return res.code(404).send({ message: "Project not found!" });
    }

    fileToDelete = path.join(
      dirname(fileURLToPath(import.meta.url)),
      "../../../",
      record.file
    );
    console.log({ fileToDelete });
    if (req.user_data.role === "student") {
      await table.ProjectUploadModel.deleteById(req.params.id);

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
  uploadProject: uploadProject,
  getUploadedProjects: getUploadedProjects,
  deleteUploadedProject: deleteUploadedProject,
};
