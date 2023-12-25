"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let TeacherModel = null;

const init = async (sequelize) => {
  TeacherModel = sequelize.define(
    constants.models.TEACHER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      user_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      franchisee_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.FRANCHISEE_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      sub_franchisee_id: {
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        references: {
          model: constants.models.FRANCHISEE_TABLE,
          key: "id",
          allowNull: false,
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await TeacherModel.sync({ alter: true });
};

const create = async (user_id, franchisee_id, sub_franchisee_id) => {
  return await TeacherModel.create({
    user_id: user_id,
    franchisee_id: franchisee_id,
    sub_franchisee_id: sub_franchisee_id,
  });
};

const get = async (sub_franchisee_id) => {
  let query = `
                SELECT
                    tch.id,
                    tch.user_id,
                    usr.username,
                    usr.first_name,
                    usr.last_name,
                    usr.role,
                    usr.profession,
                    usr.image_url,
                    CASE WHEN crs.course_name IS NULL THEN NULL ELSE crs.course_name END as course_name,
                    CASE WHEN crs.id IS NULL THEN NULL ELSE crs.id END as course_id,
                    COUNT(crs.*) AS teacher_courses,
                    COUNT(btch.*) AS teacher_total_batches
                FROM 
                    teachers tch
                INNER JOIN users usr ON usr.id = tch.user_id
                LEFT JOIN users_courses uscr ON uscr.user_id = tch.user_id
                LEFT JOIN courses crs ON crs.id = uscr.course_id
                LEFT JOIN batches btch ON btch.teacher_id = tch.id
                WHERE
                    tch.sub_franchisee_id = '${sub_franchisee_id}'
                GROUP BY
                    tch.id,
                    tch.user_id,
                    usr.username,
                    usr.first_name,
                    usr.last_name,
                    usr.role,
                    usr.profession,
                    usr.image_url,
                    crs.course_name,
                    crs.id
              `;
  return await TeacherModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await TeacherModel.findOne({
    where: {
      id: id,
    },
  });
};

const getByUserId = async (user_id) => {
  return await TeacherModel.findOne({
    where: {
      user_id: user_id,
    },
  });
};

const getUserIdsBySubFranchisee = async (franchisee_id) => {
  const result = await TeacherModel.findAll({
    where: {
      sub_franchisee_id: franchisee_id,
    },
    attributes: ["user_id"],
    raw: true,
  });
  return result.map((row) => row.user_id);
};

export default {
  init,
  create,
  get,
  getById,
  getByUserId,
  getUserIdsBySubFranchisee,
};
