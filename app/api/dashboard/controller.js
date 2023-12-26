"use strict";

import table from "../../db/models.js";

const getReport = async (req, res) => {
  try {
    const user = await table.UserModel.countUser();
    const course = await table.CourseModel.countCourse();
    let reports = {};
    for (const i in user) {
      reports[`total_${user[i].role}`] = parseInt(user[i].total);
    }
    reports.total_course = course;
    return res.send(reports);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getLast30Days = async (req, res) => {
  try {
    const user = await table.UserModel.countUser(true);

    const course = await table.CourseModel.countCourse(true);
    let last30DaysReports = {};
    for (const i in user) {
      last30DaysReports[`total_${user[i].role}`] = parseInt(user[i].total);
    }
    last30DaysReports.total_course = course;
    return res.send(last30DaysReports);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    let sub_user_id = null;
    let master_user_id = null;
    let reports = {};
    let last30DaysReports = {};
    if (req.user_data.role === "admin") {
      // total reports
      const user = await table.UserModel.countUser();
      const course = await table.CourseModel.countCourse();
      //   console.log({ user, course });

      for (const i in user) {
        reports[`total_${user[i].role}`] = parseInt(user[i].total);
      }
      reports.total_course = course;

      // last 30 days reports
      const last30DaysUser = await table.UserModel.countUser(true);
      const last30DaysCourse = await table.CourseModel.countCourse(true);
      for (const i in last30DaysUser) {
        last30DaysReports[`total_${user[i].role}`] = parseInt(user[i].total);
      }
      last30DaysReports.total_course = last30DaysCourse;
    }

    if (req.user_data.role === "master_franchisee") {
      const franchisee = await table.FranchiseeModel.getByUserId(req);
      reports.total_sub_franchisee =
        await table.FranchiseeModel.countSubFranchisee(franchisee.id);
      reports.total_student = await table.StudentModel.countStudent(
        franchisee.id
      );
      reports.total_course = await table.CourseAssignModel.countCourse(
        franchisee.user_id
      );
      last30DaysReports.total_sub_franchisee =
        await table.FranchiseeModel.countSubFranchisee(
          franchisee.id,
          null,
          true
        );
      last30DaysReports.total_student = await table.StudentModel.countStudent(
        franchisee.id,
        null,
        true
      );
      last30DaysReports.total_course =
        await table.CourseAssignModel.countCourse(franchisee.user_id, true);
    }

    if (req.user_data.role === "sub_franchisee") {
      const franchisee = await table.FranchiseeModel.getByUserId(req);
      reports.total_student = await table.StudentModel.countStudent(
        null,
        franchisee.id
      );
      reports.total_course = await table.CourseAssignModel.countCourse(
        franchisee.user_id
      );
      last30DaysReports.total_student = await table.StudentModel.countStudent(
        null,
        franchisee.id,
        true
      );
      last30DaysReports.total_course =
        await table.CourseAssignModel.countCourse(franchisee.user_id, true);

      const master = await table.FranchiseeModel.getById(
        null,
        franchisee.dataValues.franchisee_id
      );

      master_user_id = master.user_id;
    }

    if (req.user_data.role === "teacher") {
      const teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      reports.total_batch = await table.BatchModel.countBatch(teacher.id);
      reports.total_course = await table.CourseAssignModel.countCourse(
        teacher.user_id
      );
      last30DaysReports.total_batch = await table.BatchModel.countBatch(
        teacher.id,
        true
      );
      last30DaysReports.total_course =
        await table.CourseAssignModel.countCourse(teacher.user_id, true);

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

    return res.send({
      reports: reports,
      last_30_days_reports: last30DaysReports,
      tickets: await table.TicketModel.getAll(req),
      announcements: await table.AnnouncementModel.getAll(
        req,
        sub_user_id,
        master_user_id
      ),
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

export default {
  get,
  getReport,
  getLast30Days,
};
