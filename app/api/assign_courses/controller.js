"use strict";

import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const assignCourse = async (req, res) => {
  try {
    let record = await table.CourseModel.getById(req);
    if (!record) {
      return res.code(404).send({
        message: "Courses not found. Please enter a valid course id",
      });
    }

    const assignedTo = await table.UserModel.getById(null, req.body.user_id);
    if (!assignedTo) {
      return res.code(404).send({ message: "User not exist" });
    }

    const assign_course = await table.CourseAssignModel.checkExists(req);
    if (assign_course) {
      return res.code(409).send({
        message: "This Course already assign to the user.",
      });
    }

    const enquiryRecord = await table.CourseEnquiryModel.exist(
      assignedTo?.dataValues.id,
      record?.dataValues.id,
      assignedTo.role === "master_franchisee" ? null : req.user_data.id
    );

    req.body.course_name = record.course_name;
    const data = await table.CourseAssignModel.create(req);

    res.send({ message: "New course Assigned." });

    if (data) {
      enquiryRecord !== null &&
        (await table.CourseEnquiryModel.deleteById(
          enquiryRecord?.dataValues?.id
        ));

      await sendMail(
        assignedTo?.dataValues.email,
        "Course assigned",
        "",
        `<html>
        <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; text-align: center; padding: 20px;">
          <h1 style="color: #3498db;">Course assigned</h1>
          <p style="margin-top: 20px;">
            You are assigned to a new course: ${data?.course_name} 
          </p>
        </body>
      </html>`
      );
    }
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const updateAssignCourse = async (req, res) => {
  try {
    let record = await table.CourseAssignModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "not found!" });
    }

    if (req.body?.course_id) {
      record = await table.CourseModel.getById(req);
      if (!record) {
        return res.send({
          message: "Courses not found. Please enter a valid course id",
        });
      }
    }

    return res.send(await table.CourseAssignModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.CourseAssignModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({ message: "course not assign" });
    }
    return res.send({
      message: "Course deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    const courses = await table.CourseAssignModel.get(
      req.user_data.id,
      req.user_data.role === "admin"
    );
    // console.log({ courses });
    return res.send(courses);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getByFranchiseeId = async (req, res) => {
  // console.log(req.user_data.id);
  try {
    const courses = await table.CourseAssignModel.getAllCourseByFranchiseeId(
      req.user_data.id
    );
    // console.log({ courses });
    return res.send(courses);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.CourseAssignModel.getById(req);
    if (!record) {
      return res.code(404).send({ message: "course not assign" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const fetchCoursesBatches = async (req, res) => {
  try {
  } catch (error) {}
};

export default {
  assignCourse,
  updateAssignCourse,
  deleteById,
  get: get,
  getById: getById,
  getByFranchiseeId,
};
