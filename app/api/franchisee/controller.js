"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  console.log(req.params);
  let record;
  let franchisee_id;
  try {
    record = await table.UserModel.getById(undefined, req.body.user_id);
    if (!record) {
      return res.send({ message: "user not exists. Please create user" });
    }
    if (req.user_data.role === "master_franchisee") {
      const master = await table.FranchiseeModel.getByUserId(req);
      franchisee_id = master.id;
    }

    if (req.body?.franchisee_id) {
      record = await table.FranchiseeModel.getById(
        undefined,
        req.body.franchisee_id
      );
      // console.log({ franchisee: record });

      if (!record) {
        return res.send({
          message:
            "Master franchisee not exists. Please enter a valid franchisee",
        });
      }
    }

    const franchisee = await table.FranchiseeModel.create(req, franchisee_id);

    if (record.role === "sub_franchisee") {
      await table.GroupModel.createCommunityGroup(
        franchisee.franchisee_name,
        record.id
      );
    }

    return res.send({ message: "New Franchisee created." });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const update = async (req, res) => {
  let record;
  try {
    record = await table.FranchiseeModel.getById(req);
    if (!record) {
      return res.send({ message: "Franchisee not exists in our database" });
    }

    if (
      req.body?.franchisee_id &&
      !(await table.FranchiseeModel.getById(undefined, req.body.franchisee_id))
    ) {
      return res.send({ message: "Franchisee not exists in our database" });
    }

    if (
      req.body?.user_id &&
      !(await table.UserModel.getById(undefined, req.body.user_id))
    ) {
      return res.send({ message: "User not exists in our database" });
    }

    return res.send(await table.FranchiseeModel.update(req));
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.FranchiseeModel.getById(req);
    if (!record) {
      return res.send({ message: "Franchisee not exists in our database" });
    }
    const user = await table.UserModel.deleteById(undefined, record.user_id);
    return res.send({
      message: "Franchisee deleted.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const get = async (req, res) => {
  try {
    return res.send(await table.FranchiseeModel.get());
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.FranchiseeModel.getById(req);
    if (!record) {
      return res.send({ message: "Franchisee not exists in our database" });
    }
    return res.send(record);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getAllSubFranchisee = async (req, res) => {
  try {
    return res.send(await table.FranchiseeModel.getAllSubFranchisee(req));
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
  getAllSubFranchisee,
};
