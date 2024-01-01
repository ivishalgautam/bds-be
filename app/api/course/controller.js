"use strict";

import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const create = async (req, res) => {
  try {
    await table.CourseModel.create(req);
    return res.send({
      message: "New course created.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.CourseModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "course not exists in our database" });
    }
    return res.send(await table.CourseModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.CourseModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "course not exists in our database" });
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
    // console.log(await table.CourseModel.get(req));
    return res.send(await table.CourseModel.get(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.CourseModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "course not exists in our database" });
    }
    console.log({ record });
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getUnassignedCourses = async (req, res) => {
  let unAssignedCourses = [];
  let courses = [];
  let is_queried = false;
  try {
    if (req.user_data.role === "student") {
      const student = await table.StudentModel.getByUserId(req.user_data.id);

      if (!student) {
        return res.code(404).send({ message: "Student not exist" });
      }

      const studentCourses =
        await table.CourseAssignModel.getAllCourseByFranchiseeId(
          student.user_id
        );

      let sub_franchisee = await table.FranchiseeModel.getById(
        null,
        student.sub_franchisee_id
      );

      let assignedToSub =
        await table.CourseAssignModel.getAllCourseByFranchiseeId(
          sub_franchisee.user_id
        );

      unAssignedCourses = assignedToSub
        ?.map((i) => i.course_id)
        .filter((a) => !studentCourses?.map((i) => i.course_id).includes(a));

      if (unAssignedCourses.length > 0) {
        for await (const courseId of unAssignedCourses) {
          const data = await table.CourseModel.getById({
            body: { course_id: courseId },
          });

          const record = await table.CourseEnquiryModel.exist(
            req.user_data.id,
            courseId,
            sub_franchisee.user_id
          );

          if (record) {
            is_queried = true;
          }

          courses.push(Object.assign(data.dataValues, { is_queried }));
          is_queried = false;
        }
      }
    }

    if (req.user_data.role === "sub_franchisee") {
      const sub = await table.FranchiseeModel.getByUserId(
        null,
        req.user_data.id
      );

      if (!sub) {
        return res.code(404).send({ message: "Franchisee not found!" });
      }

      const master = await table.FranchiseeModel.getById(
        null,
        sub.franchisee_id
      );

      const subCourses =
        await table.CourseAssignModel.getAllCourseByFranchiseeId(sub.user_id);
      const assignedToMaster =
        await table.CourseAssignModel.getAllCourseByFranchiseeId(
          master.dataValues.user_id
        );

      unAssignedCourses = assignedToMaster
        .map((c) => c.course_id)
        .filter((i) => !subCourses.map((c) => c.course_id).includes(i));

      if (unAssignedCourses.length > 0) {
        for (const courseId of unAssignedCourses) {
          const data = await table.CourseModel.getById({
            body: { course_id: courseId },
          });

          const record = await table.CourseEnquiryModel.exist(
            req.user_data.id,
            courseId,
            master.dataValues.user_id
          );

          if (record) {
            is_queried = true;
          }

          courses.push(Object.assign(data.dataValues, { is_queried }));
          is_queried = false;
        }
      }
    }

    if (req.user_data.role === "master_franchisee") {
      // console.log("master");
      const master = await table.FranchiseeModel.getByUserId(
        null,
        req.user_data.id
      );

      const masterCourses =
        await table.CourseAssignModel.getAllCourseByFranchiseeId(
          master.user_id
        );
      const allCourses = await table.CourseModel.getAllCourses();

      unAssignedCourses = allCourses
        .map((i) => i.id)
        .filter((i) => !masterCourses.map((c) => c.course_id).includes(i));

      if (unAssignedCourses.length > 0) {
        for await (const courseId of unAssignedCourses) {
          const data = await table.CourseModel.getById({
            body: { course_id: courseId },
          });

          const record = await table.CourseEnquiryModel.exist(
            req.user_data.id,
            courseId,
            null
          );

          if (record) {
            is_queried = true;
          }

          courses.push(Object.assign(data.dataValues, { is_queried }));
          is_queried = false;
        }
      }
    }

    res.send(courses);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const createEnquiry = async (req, res) => {
  let data;
  let fran;
  let course;
  try {
    // (req, enquiry_to_id, course_id)
    course = await table.CourseModel.getById(req);

    if (!course) {
      return res.code(404).send({ message: "Course not exist!" });
    }

    if (req.user_data.role === "student") {
      const student = await table.StudentModel.getByUserId(req.user_data.id);
      fran = await table.FranchiseeModel.getById(
        null,
        student?.sub_franchisee_id
      );

      const record = await table.CourseEnquiryModel.exist(
        req.user_data.id,
        req.body.course_id,
        fran?.dataValues.user_id
      );

      if (record) {
        return res
          .code(409)
          .send({ message: "You already enquired for this course!" });
      }

      data = await table.CourseEnquiryModel.create(
        req,
        fran?.dataValues.user_id
      );
    }

    if (req.user_data.role === "sub_franchisee") {
      let sub = await table.FranchiseeModel.getByUserId(null, req.user_data.id);
      fran = await table.FranchiseeModel.getById(
        null,
        sub?.dataValues.franchisee_id
      );
      console.log({ fran });
      const record = await table.CourseEnquiryModel.exist(
        req.user_data.id,
        req.body.course_id,
        fran?.dataValues.user_id
      );

      if (record) {
        return res
          .code(409)
          .send({ message: "You already enquired for this course!" });
      }

      data = await table.CourseEnquiryModel.create(
        req,
        fran?.dataValues.user_id
      );
    }

    if (req.user_data.role === "master_franchisee") {
      fran = await table.FranchiseeModel.getByUserId(null, req.user_data.id);

      const record = await table.CourseEnquiryModel.exist(
        req.user_data.id,
        req.body.course_id
      );

      if (record) {
        return res
          .code(409)
          .send({ message: "You already enquired for this course!" });
      }

      data = await table.CourseEnquiryModel.create(req, null, true);
    }

    if (data) {
      const { enquiry_from_id, enquiry_to_id } = data?.dataValues;
      const { course_name } = course?.dataValues;

      const enquiry_from_user = await table.UserModel.getById(
        null,
        enquiry_from_id
      );

      const enquiry_to_user =
        enquiry_to_id !== null
          ? await table.UserModel.getById(null, enquiry_to_id)
          : null;

      res.send({ message: "Your enquiry sent" });

      await sendMail(
        enquiry_to_id === null
          ? process.env.SMTP_EMAIL
          : enquiry_to_user.dataValues.email,
        "Course enquiry",
        `User ${enquiry_from_user.dataValues.username} enquire for course ${course_name}`,
        `<html>
          <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; text-align: center; padding: 20px;">
            <h1 style="color: #3498db;">Course enquiry</h1>
            <table style="border-collapse: collapse; width: 100%; border: 2px solid #4CAF50;">
                <tr style="background-color: #4CAF50; color: white;">
                  <th style="border: 2px solid #4CAF50; padding: 12px; text-align: left;">
                    Username
                  </th>
                  <th style="border: 2px solid #4CAF50; padding: 12px; text-align: left;">
                    Email
                  </th>
                  <th style="border: 2px solid #4CAF50; padding: 12px; text-align: left;">
                    Phone
                  </th>
                  <th style="border: 2px solid #4CAF50; padding: 12px; text-align: left;">
                    Course
                  </th>
                </tr>

                <tr>
                  <td style="border: 2px solid #4CAF50; padding: 12px;">
                    ${enquiry_from_user.dataValues.username}
                  </td>
                  <td style="border: 2px solid #4CAF50; padding: 12px;">
                    ${enquiry_from_user.dataValues.email}
                  </td>
                  <td style="border: 2px solid #4CAF50; padding: 12px;">
                    ${enquiry_from_user.dataValues.mobile_number}
                  </td>
                  <td style="border: 2px solid #4CAF50; padding: 12px;">
                    ${course_name}
                  </td>
                </tr>
              </table>
          </body>
        </html>`
      );
    }
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const getEnquiries = async (req, res) => {
  let data;
  try {
    if (req.user_data.role !== "admin") {
      data = await table.CourseEnquiryModel.get(req, req.user_data.id);
    } else {
      data = await table.CourseEnquiryModel.get(req, null);
    }

    // console.log({ data });
    res.send(data);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  getUnassignedCourses: getUnassignedCourses,
  createEnquiry: createEnquiry,
  getEnquiries: getEnquiries,
};
