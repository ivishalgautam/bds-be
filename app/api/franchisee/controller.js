"use strict";

import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const create = async (req, res) => {
  let record;
  let franchisee_id;
  console.log({ body: req.body });
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
      const fran = await table.FranchiseeModel.getById(
        undefined,
        req.body.franchisee_id
      );
      // console.log({ franchisee: record });

      if (!fran) {
        return res.send({
          message:
            "Master franchisee not exists. Please enter a valid franchisee",
        });
      }
    }

    const data = await table.FranchiseeModel.create(req, franchisee_id);

    if (data) {
      console.log("mail sent fran");
      await sendMail(
        record?.email,
        "BDS Credentials",
        "",
        `<html>
        <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; text-align: center; padding: 20px;">
        <h1 style="text-align: center;">Credentials for ${
          record.role === "master_franchisee"
            ? "Master Franchisee"
            : "Franchisee"
        }</h1>
        <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin-bottom: 10px;">Username: '${
          record.username
        }' and Password: '${req.body.password}'</p>
        <a href="https://bdsconnectcc.in/login" style="display: inline-block; padding: 10px 20px; font-family: Arial, sans-serif; font-size: 16px; color: #fff; background-color: #4caf50; text-decoration: none; border-radius: 4px; margin-bottom: 10px;">Login</a>
        <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin-bottom: 10px;">Feel free to log in and explore our platform.</p>
        <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin-bottom: 0;">Best regards,<br>BDS Team</p>
        </body>
        </html>`
      );
    }
    res.send({ message: "New Franchisee created." });

    // if (record.role === "sub_franchisee") {
    //   await table.GroupModel.createCommunityGroup(
    //     franchisee.franchisee_name,
    //     record.id
    //   );
    // }
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
