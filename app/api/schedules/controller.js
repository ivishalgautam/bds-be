"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  // console.log(req.body);
  try {
    if (req.user_data.role === "sub_franchisee") {
      let record = await table.FranchiseeModel.getByUserId(req);
      if (!record) {
        return res.code(404).send({
          message:
            "sub franchisee not exists. Please contact us our support team",
        });
      }
    }

    if (req.user_data.role === "teacher") {
      let teacher = await table.TeacherModel.getByUserId(req.user_data.id);
      if (!teacher) {
        return res.send({
          message:
            "teacher not exists. Please create new teacher or assign valid teacher",
        });
      }
    }

    const batch = await table.BatchModel.getById(req, req.body.batch_id);

    if (!batch) {
      return res.code(404).send({ message: "batch not found!" });
    }

    const scheduleExist = await table.ScheduleModel.getByStartTimeAndBatchId(
      req,
      batch?.id
    );

    if (scheduleExist) {
      return res.code(409).send({
        message: `schedule exist for '${new Date(
          req.body.start_time
        ).toLocaleString()}'`,
      });
    }

    // res.send(schedules);
    await table.ScheduleModel.create(
      req,
      batch.id,
      batch.start_time,
      batch.end_time
    );
    res.send({ message: "schedule created" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const get = async (req, res) => {
  const { batch_id } = req.params;
  let student;
  try {
    const batchRecord = await table.BatchModel.getById(req, batch_id);

    if (!batchRecord) {
      return res.code(404).send({ message: "batch not found!" });
    }

    if (req.user_data.role === "student") {
      student = await table.StudentModel.getByUserId(req.user_data.id);
      console.log(req.user_data.id);
    }

    const meetings = await table.ScheduleModel.getById(
      req,
      batch_id,
      student?.id
    );
    // console.log({ meetings });
    return res.send(meetings);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const update = async (req, res) => {
  console.log({ body: req.body });
  try {
    const record = await table.ScheduleModel.getByScheduleId(
      req.params.schedule_id
    );

    if (!record) {
      return res.code(404).send({ message: "schedule not found!" });
    }

    const batch = await table.BatchModel.getById(req, req.body.batch_id);

    if (!batch) {
      return res.code(404).send({ message: "batch not found!" });
    }

    req.body.start_time = `${req.body.start_time}T${batch.start_time}`;

    const scheduleExist = await table.ScheduleModel.getByStartTimeAndBatchId(
      req,
      record?.batch_id
    );

    if (!scheduleExist || req.params.schedule_id === scheduleExist?.id) {
      const data = await table.ScheduleModel.update(req, record?.batch_id);
      console.log({ updated: data });
      res.send({ message: "schedule updated" });
    } else {
      return res.code(409).send({
        message: `schedule exist for '${new Date(
          req.body.start_time
        ).toLocaleString()}'`,
      });
    }
  } catch (error) {
    console.error(error);
    res.code(500).send({ error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ScheduleModel.getByScheduleId(
      req.params.schedule_id
    );

    if (!record) {
      return res.code(404).send({ message: "schedule not found" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(500).send({ error });
  }
};

export default { create: create, get: get, update: update, getById: getById };
