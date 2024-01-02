"use strict";

import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const create = async (req, res) => {
  // console.log(req.body);
  try {
    let teacher;
    let record;
    let user_ids = [];

    if (req.user_data.role === "sub_franchisee") {
      record = await table.FranchiseeModel.getByUserId(req);
      if (!record) {
        return res.code(404).send({
          message:
            "master franchisee not exists. Please contact us our support team",
        });
      }

      if (!req.body.teacher_id) {
        return res
          .code(400)
          .send({ message: "teacher_id is required parameter" });
      }

      teacher = await table.TeacherModel.getById(req.body.teacher_id);

      if (!teacher) {
        return res.code(404).send({
          message:
            "teacher not exists. Please create new teacher or assign valid teacher",
        });
      }

      user_ids.push(teacher.user_id);
    }

    if (req.user_data.role === "teacher") {
      teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      if (!teacher) {
        return res.code(404).send({
          message:
            "teacher not exists. Please create new teacher or assign valid teacher",
        });
      }
      req.body.teacher_id = teacher?.id;
    }

    for (const student_id of req.body.students_ids) {
      const student = await table.StudentModel.getById(student_id);
      if (!student) {
        continue;
      }
      user_ids.push(student.user_id);
    }

    const course = await table.CourseModel.getById(req);
    if (!course) {
      return res
        .code(404)
        .send({ message: "course not exists. Please assign valid course" });
    }

    const course_syllabus = course.course_syllabus.map((s) => {
      return {
        ...s,
        day_wise: s.day_wise.map((dw) => ({ ...dw, is_completed: false })),
      };
    });

    let quiz = await table.QuizModel.getByCourseId(course.id);

    if (!quiz) {
      quiz = [];
    } else {
      quiz = quiz.map((i) => {
        const { id, course_id, created_at, updated_at, ...data } = i;
        return { ...data };
      });
    }

    const batch = await table.BatchModel.create(
      req,
      record?.franchisee_id || teacher.franchisee_id,
      record?.id || teacher.sub_franchisee_id,
      course.course_name,
      course_syllabus,
      quiz
    );

    // user_ids.forEach(async (studentId) => {
    //   await table.CourseAssignModel.create({
    //     body: {
    //       course_name: course.course_name,
    //       status: "ASSIGNED",
    //       course_id: course.id,
    //       user_id: studentId,
    //     },
    //     user_data: { id: req.user_data.id },
    //   });
    // });

    const data = await table.GroupModel.create(req, user_ids, batch.id);

    if (data) {
      user_ids.forEach(async (userId) => {
        await new Promise(async (resolve) => {
          const user = await table.UserModel.getById(null, userId);

          await sendMail(
            user.dataValues.email,
            "Course assigned",
            "",
            `<html>
            <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; text-align: center; padding: 20px;">
              <h1 style="color: #3498db;">Product enquiry</h1>
              <p style="margin-top: 20px;">
                YOU ARE ASSIGNED TO A NEW COURSE: ${course.course_name}
              </p>
            </body>
          </html>`
          );

          resolve();
        });
      });
    }

    return res.send({ message: "New batch created" });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  const batchWeeksComplete = [];
  req.body?.course_syllabus?.forEach((cs) => {
    batchWeeksComplete.push({
      weeks: cs.weeks,
      course_id: req.body.course_id,
      completed: [...cs.day_wise.map((i) => i.is_completed)],
    });
  });
  // return console.log({ body: req.body });
  try {
    let user_ids = [];
    const record = await table.BatchModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "batch not exists in our database" });
    }

    let course = await table.CourseModel.getById(req);
    if (!course) {
      return res
        .code(404)
        .send({ message: "course not exists. Please assign valid course" });
    }

    if (req.body?.teacher_id) {
      const teacher = await table.TeacherModel.getById(req.body.teacher_id);
      if (!teacher) {
        return res.code(404).send({
          message:
            "teacher not exists. Please create new teacher or assign valid teacher",
        });
      }
    }

    if (req.body?.students_ids) {
      for (const student_id of req.body?.students_ids) {
        const student = await table.StudentModel.getById(student_id);
        if (!student) {
          return res.code(404).send({
            message: `student not found. Invalid student id:- ${student_id}`,
          });
        }

        if (!record.students_id.includes(student_id)) {
          // console.log(student.user_id);
          // user_ids.push(student.user_id);
          const user = await table.UserModel.getById(null, student.user_id);

          await sendMail(
            user.email,
            "Course assigned",
            "",
            `<html>
              <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; text-align: center; padding: 20px;">
                <h1 style="color: #3498db;">Course assigned</h1>
                <p style="margin-top: 20px;">
                  YOU ARE ASSIGNED TO A NEW COURSE: ${course.course_name}
                </p>
              </body>
            </html>`
          );
        }
      }
    }

    await table.BatchModel.update(req, course.course_name);

    return res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.BatchModel.deleteById(req);
    if (record === 0) {
      return res
        .code(404)
        .send({ message: "batch not exists in our database" });
    }
    return res.send({
      message: "batch deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    let teacher;
    let franchisee;
    let student;

    if (req.user_data.role === "sub_franchisee") {
      franchisee = await table.FranchiseeModel.getByUserId(
        req,
        req?.user_data?.id
      );
      if (!franchisee) {
        return res.code(404).send({
          message:
            "master franchisee not exists. Please contact us our support team",
        });
      }
    }

    if (req.user_data.role === "teacher") {
      teacher = await table.TeacherModel.getByUserId(req.user_data.id);
    }

    if (req.user_data.role === "student") {
      student = await table.StudentModel.getByUserId(req.user_data.id);
      // console.log({ student });
    }

    return res.send(
      await table.BatchModel.get(teacher?.id, franchisee?.id, student?.id)
    );
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.BatchModel.getById(req);
    if (!record) {
      return res
        .code(404)
        .send({ message: "batch not exists in our database" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getBatchStudents = async (req, res) => {
  let students = [];
  try {
    const record = await table.BatchModel.getById(req, req.params.id);

    for (const studentId of record.students_id) {
      const student = await table.StudentModel.getById(studentId);

      const user = await table.UserModel.getById(null, student.user_id);

      students.push({ student_id: studentId, ...user.dataValues });
    }
    res.send(
      students.map((stu) => ({
        student_id: stu.student_id,
        student_name: `${stu.first_name} ${stu.last_name}`,
        student_image: stu.image_url,
      }))
    );
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
  getBatchStudents: getBatchStudents,
};
