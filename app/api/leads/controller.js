"use strict";
import table from "../../db/models.js";

const create = async (req, res) => {
  const course = await table.CourseModel.getById(req);
  if (!course) {
    return res.code(404).send({ message: "course not found!" });
  }

  const franchisee = await table.FranchiseeModel.getByUserId(
    req,
    req.user_data.id
  );
  if (!franchisee) {
    return res.code(404).send({ message: "franchisee not found!" });
  }

  res.send(await table.LeadsModel.create(req, franchisee?.id));
};

const get = async (req, res) => {
  const franchisee = await table.FranchiseeModel.getByUserId(
    req,
    req.user_data.id
  );

  res.send(await table.LeadsModel.get(franchisee?.id));
};

const getById = async (req, res) => {
  const record = await table.LeadsModel.getById(req.params.id);

  if (!record) {
    return res.code(404).send({ message: "lead not found!" });
  }

  res.send(record);
};

const updateById = async (req, res) => {
  const record = await table.LeadsModel.getById(req.params.id);
  if (!record) return res.code(404).send({ message: "lead not found!" });

  res.send(await table.LeadsModel.updateById(req, req.params.id));
};

export default {
  create: create,
  get: get,
  getById: getById,
  updateById: updateById,
};
