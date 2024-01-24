"use strict";
import table from "../../db/models.js";

const create = async (req, res) => {
  const course = await table.CourseModel.getById(req);
  if (!course) {
    return res.code(404).send({ message: "course not found!" });
  }

  const franchisee = await table.FranchiseeModel.getByUserId(
    req,
    res.user_data.id
  );
  if (!franchisee) {
    return res.code(404).send({ message: "franchisee not found!" });
  }

  res.send(await table.leadsModel.create(req, franchisee?.id));
};

const get = async (req, res) => {
  res.send(await table.leadsModel.get());
};

export default {
  create: create,
  get: get,
};
