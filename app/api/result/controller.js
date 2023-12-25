"use strict";
import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const result = await table.ResultModel.create(req);

    if (result) {
      const student = await table.StudentModel.getByUserId(req.user_data.id);
      const rewardRecord = await table.RewardModel.getByStudentId(student.id);
      req.body.reward_points = req.body.your_points;
      await table.RewardModel.updateByStudentId(
        rewardRecord.reward_points + parseInt(req.body.your_points),
        student.id
      );
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const get = async (req, res) => {
  try {
    if (req?.user_data.role === "sub_franchisee") {
      let record = await table.FranchiseeModel.getByUserId(
        req,
        req?.user_data.id
      );
      if (!record) {
        return res.code(404).send({
          message:
            "sub franchisee not exists. Please contact us our support team",
        });
      }

      return res.send(await table.ResultModel.get(null, null, record.id));
    }

    if (req?.user_data?.role === "teacher") {
      let teacher = await table.TeacherModel.getByUserId(req?.user_data?.id);
      if (!teacher) {
        return res.send({
          message:
            "teacher not exists. Please create new teacher or assign valid teacher",
        });
      }
      return res.send(await table.ResultModel.get(null, teacher.id, null));
    }

    res.send(await table.ResultModel.get(req, null, null));
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create,
  get,
};
