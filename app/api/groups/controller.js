"use strict";
import table from "../../db/models.js";

const getUserGroups = async (req, res) => {
  try {
    const data = await table.GroupModel.get(req);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};

const create = async (req, res) => {
  const { group_users } = req.body;
  try {
    if (group_users?.length === 0) {
      return res.code(400).send({ message: "Please select atleast 1 member" });
    }

    const { total_groups } = await table.GroupModel.countUserGroup(req);

    if (total_groups >= 2) {
      return res
        .code(400)
        .send({ message: "You cannot create more than 2 groups!" });
    }

    for (const userId of group_users) {
      const userRecord = await table.UserModel.getById(req, userId);

      if (!userRecord) {
        return res.code(404).send({ message: "user not found!" });
      }

      const group = await table.GroupModel.create(req);
      console.log({ group });

      await table.GroupInvtModel.create(
        group.id,
        req.body.group_name,
        userId,
        req.user_data.id
      );
    }

    res.send({ message: "invitations sent!" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const get = async (req, res) => {
  try {
    const userRecord = await table.UserModel.getById(req, req.user_data.id);

    if (!userRecord) {
      return res.code(404).send({ message: "user not found!" });
    }

    const records = await table.GroupInvtModel.get(userRecord.id);
    res.send(records);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const data = await table.GroupModel.getGroupMembers(req.params.group_id);
    console.log({ data });
    res.send(data);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const update = async (req, res) => {
  try {
    const record = await table.GroupInvtModel.getById(req.params.invitation_id);

    if (!record) {
      return res.code(404).send({ message: "Invitation not found!" });
    }

    const updatedInvite = await table.GroupInvtModel.update(
      req.params.invitation_id,
      req.body.status
    );

    const group = await table.GroupModel.getById(
      null,
      updatedInvite[1].group_id
    );

    if (!group) {
      return res.code(404).send({ message: "group not found!" });
    }

    if (updatedInvite && updatedInvite?.[1].status === "accepted") {
      await table.GroupModel.addToGroup(
        group.group_users,
        updatedInvite[1].user_id,
        updatedInvite?.[1].group_id
      );
    }

    res.send({ message: "updated" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create,
  get,
  update,
  getUserGroups,
  getGroupMembers,
};
