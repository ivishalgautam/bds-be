"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let StudentModel = null;

const init = async (sequelize) => {
  StudentModel = sequelize.define(
    constants.models.STUDENT_TABLE,
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
  await StudentModel.sync({ alter: true });
};

const create = async (user_id, franchisee_id, sub_franchisee_id) => {
  return await StudentModel.create({
    user_id: user_id,
    franchisee_id: franchisee_id,
    sub_franchisee_id: sub_franchisee_id,
  });
};

const get = async (sub_franchisee_id) => {
  // console.log({ sub_franchisee_id });
  let query = `
        SELECT
            st.id,
            st.user_id,
            usr.username,
            usr.first_name,
            usr.last_name,
            usr.role,
            usr.profession,
            usr.image_url,
            usr.email,
            CASE WHEN crs.course_name IS NULL THEN NULL ELSE crs.course_name END as course_name,
            CASE WHEN crs.id IS NULL THEN NULL ELSE crs.id END as course_id,
            COUNT(uscr.*) as student_courses,
            COUNT(btch.*) as student_batches,
            rwrd.reward_points as student_reward_points
        FROM 
            students st
        INNER JOIN users usr ON usr.id = st.user_id
        LEFT JOIN users_courses uscr ON uscr.user_id = st.user_id
        LEFT JOIN courses crs ON crs.id = uscr.course_id
        LEFT JOIN batches btch ON st.id = ANY(SELECT jsonb_array_elements_text(btch.students_id)::uuid)
        LEFT JOIN rewards rwrd ON rwrd.student_id = st.id
        WHERE
            st.sub_franchisee_id = '${sub_franchisee_id}'
        GROUP BY
            st.id,
            st.user_id,
            usr.username,
            usr.first_name,
            usr.last_name,
            usr.role,
            usr.profession,
            usr.image_url,
            usr.email,
            crs.course_name,
            crs.id,
            rwrd.reward_points
        ;
    `;
  return await StudentModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getDetailsById = async (id) => {
  let query = `
        SELECT
            st.id,
            st.user_id,
            usr.username,
            usr.first_name,
            usr.last_name,
            usr.role,
            usr.profession,
            usr.image_url,
            usr.email,
            CASE WHEN crs.course_name IS NULL THEN NULL ELSE crs.course_name END as course_name,
            CASE WHEN crs.id IS NULL THEN NULL ELSE crs.id END as course_id
        FROM 
            students st
        INNER JOIN users usr ON usr.id = st.user_id
        LEFT JOIN users_courses uscr ON uscr.user_id = st.user_id
        LEFT JOIN courses crs ON crs.id = uscr.course_id
        WHERE
            st.id = '${id}';
    `;
  return await StudentModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await StudentModel.findOne({
    where: {
      id: id,
    },
  });
};

const countStudent = async (id, sub_id, last_30_days = false) => {
  let where_query = {};
  if (last_30_days) {
    where_query = {
      created_at: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }

  if (id) {
    where_query.franchisee_id = id;
  }

  if (sub_id) {
    where_query.sub_franchisee_id = sub_id;
  }

  return await StudentModel.count({
    where: where_query,
  });
};

const getByUserId = async (user_id) => {
  return await StudentModel.findOne({
    where: {
      user_id: user_id,
    },
  });
};

const getUserIdsBySubFranchisee = async (franchisee_id) => {
  const result = await StudentModel.findAll({
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
  getDetailsById,
  getById,
  countStudent,
  getByUserId,
  getUserIdsBySubFranchisee,
};
