"use strict";

import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let GroupInvtModel = null;

const init = async (sequelize) => {
  GroupInvtModel = sequelize.define(
    constants.models.GROUP_INVITATION_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      created_by: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
      },
      group_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
      },
      group_name: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.STRING,
      },
      user_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
      },
      status: {
        type: sequelizeFwk.DataTypes.ENUM("accepted", "declined", ""),
        defaultValue: "",
      },
      is_viewed: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await GroupInvtModel.sync({ alter: true });
};

const create = async (group_id, group_name, user_id, created_by) => {
  return await GroupInvtModel.create({
    group_id: group_id,
    group_name: group_name,
    user_id: user_id,
    created_by: created_by,
  });
};

const get = async (user_id) => {
  let query = `
        SELECT 
            grpinvt.is_viewed,
            grpinvt.status,
            grpinvt.id,
            grpinvt.created_at,
            grpinvt.updated_at,
            grp.group_name,
            CONCAT(usr.first_name, ' ', usr.last_name) AS admin,
            usr.image_url as admin_profile
        from group_invitations grpinvt
        LEFT JOIN groups grp ON grp.id = grpinvt.group_id
        LEFT JOIN users usr ON usr.id = grpinvt.created_by
        WHERE grpinvt.user_id = '${user_id}' ORDER BY grpinvt.created_at DESC;
    `;

  return await GroupInvtModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (invitation_id) => {
  return await GroupInvtModel.findOne({
    where: {
      id: invitation_id,
    },
  });
};

const update = async (invitation_id, status) => {
  return await GroupInvtModel.update(
    {
      status: status,
      is_viewed: true,
    },
    {
      where: {
        id: invitation_id,
      },
      returning: true,
      plain: true,
    }
  );
};

const deleteById = async (id) => {
  return await GroupInvtModel.destroy({
    where: {
      id: id,
    },
  });
};

const deleteByGroupId = async (group_id) => {
  return await GroupInvtModel.destroy({
    where: {
      group_id: group_id,
    },
  });
};

export default {
  init,
  create,
  get,
  getById,
  update,
  deleteByGroupId,
  deleteById,
};
