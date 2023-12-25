"use strict";

import table from "../../db/models.js";

const create = async (req, res) => {
  let record;
  try {
    if (req.user_data.role !== "admin") {
      res.code(401).send({ message: "Unauthorized!" });
    }

    record = await table.LevelModel.getByLevel(req.body.level);

    if (record) {
      return res
        .code(409)
        .send({ message: `Level: '${req.body.level}' exist!` });
    }

    record = await table.LevelModel.getByRewardPoint(
      parseInt(req.body.min_reward_point)
    );

    if (record) {
      return res.code(409).send({
        message: `Min reward point exist: '${req.body.min_reward_point}'`,
      });
    }

    await table.LevelModel.create(req);
    return res.send({ message: "Level created" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};
const update = async (req, res) => {
  try {
    if (req.user_data.role !== "admin") {
      res.code(401).send({ message: "Unauthorized!" });
    }

    const record = await table.LevelModel.getById(req.params.id);

    if (!record) {
      return res.code(404).send({ message: `Level not exist!` });
    }

    const levelExist = await table.LevelModel.getByLevel(req.body.level);

    if (levelExist) {
      return res
        .code(409)
        .send({ message: `Level: '${req.body.level}' exist!` });
    }

    await table.LevelModel.update(req);
    return res.send({ message: "Level updated" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};
const deleteById = async (req, res) => {
  try {
    if (req.user_data.role !== "admin") {
      res.code(401).send({ message: "Unauthorized!" });
    }

    const record = await table.LevelModel.getById(req.params.id);

    if (!record) {
      return res.code(404).send({ message: `Level not exist!` });
    }

    await table.LevelModel.deleteById(req.params.id);
    return res.send({ message: "Level deleted" });
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const get = async (req, res) => {
  try {
    // return res.send("hello");
    res.send(await table.LevelModel.get());
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

const getById = async (req, res) => {
  try {
    if (req.user_data.role !== "admin") {
      res.code(401).send({ message: "Unauthorized!" });
    }

    const record = await table.LevelModel.getById(req.params.id);

    if (!record) {
      return res.code(404).send({ message: `Level not exist!` });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(500).send(error);
  }
};

export default {
  create,
  update,
  deleteById,
  get,
  getById,
};
