"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  //   console.log({ chat: req.body });
  const { message, message_from, message_to, group_id } = req.body;
  try {
    const record = await table.ChatModel.create(
      message,
      message_from,
      message_to,
      group_id
    );

    res.send(record);
  } catch (error) {
    console.error(error);
  }
};

const get = async (req, res) => {
  try {
    const data = await table.ChatModel.get(req);
    // console.log({ chats: data });
    res.send(data);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create,
  get,
};
