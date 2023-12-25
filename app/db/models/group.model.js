"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let GroupModel = null;

const init = async (sequelize) => {
  GroupModel = sequelize.define(
    constants.models.GROUP_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      group_name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      group_admin: {
        type: sequelizeFwk.DataTypes.ARRAY(sequelizeFwk.DataTypes.UUID),
        allowNull: false,
        defaultValue: [],
      },
      group_image: {
        type: sequelizeFwk.DataTypes.STRING,
      },
      group_users: {
        type: sequelizeFwk.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      is_community: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await GroupModel.sync({ alter: true });
};

const create = async (req, user_ids = []) => {
  console.log({ id: req.user_data.id });
  return await GroupModel.create({
    group_name: req.body?.group_name || req.body?.batch_name,
    group_admin: req.body?.group_admin || [req.body.teacher_id],
    group_users: [req.user_data.id, ...user_ids],
    group_image: req.body?.group_image,
  });
};

const createCommunityGroup = async (group_name, group_admin) => {
  return await GroupModel.create({
    group_name: group_name,
    group_admin: [group_admin],
    group_users: [group_admin],
  });
};

const update = async (req) => {
  return await GroupModel.update(
    {
      group_name: req.body?.group_name,
      group_admin: req.body?.group_admin,
      group_users: req.body?.group_users,
      group_image: req.body?.group_image,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: true,
      plain: true,
    }
  );
};

const addToGroup = async (prev_users, new_user, group_id) => {
  return await GroupModel.update(
    {
      group_users: [...prev_users, new_user],
    },
    {
      where: {
        id: group_id,
      },
    }
  );
};

const get = async (req) => {
  let query = `
        SELECT
            *
          FROM groups grp
          WHERE grp.group_users @> '["${req.user_data.id}"]'::jsonb
          ORDER BY grp.created_at
        `;
  return await GroupModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getGroupMembers = async (group_id) => {
  let query = `
      SELECT
          CONCAT(usr.first_name, ' ', usr.last_name) as fullname,
          usr.image_url
      FROM groups grp
      JOIN users usr ON usr.id = ANY(SELECT jsonb_array_elements_text(grp.group_users)::uuid)
      WHERE grp.id = '${group_id}'
      ORDER BY grp.created_at
  `;
  return await GroupModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const countUserGroup = async (req) => {
  let query = `
  SELECT 
      count(*)::integer as total_groups
      FROM groups grp
      WHERE '${req.user_data.id}' = ANY(grp.group_admin) 
  `;
  return await GroupModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
    returning: true,
    plain: true,
  });
};

const getById = async (req, id) => {
  return await GroupModel.findOne({
    where: {
      id: req?.params?.id || id,
    },
  });
};

const deleteById = async (req) => {
  return await GroupModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

export default {
  init,
  get,
  create,
  update,
  getById,
  deleteById,
  addToGroup,
  countUserGroup,
  getGroupMembers,
  createCommunityGroup,
};
