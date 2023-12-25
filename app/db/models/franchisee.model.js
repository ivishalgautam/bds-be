"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let FranchiseeModel = null;

const init = async (sequelize) => {
  FranchiseeModel = sequelize.define(constants.models.FRANCHISEE_TABLE, {
    id: {
      allowNull: false,
      primaryKey: true,
      unique: true,
      type: sequelizeFwk.DataTypes.UUID,
      defaultValue: sequelizeFwk.DataTypes.UUIDV4,
    },
    franchisee_name: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
    },
    document_url: {
      type: sequelizeFwk.DataTypes.JSONB,
      defaultValue: [],
    },
    gst_number: {
      type: sequelizeFwk.DataTypes.STRING,
      allowNull: false,
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
        allowNull: true,
        deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  });
  await FranchiseeModel.sync({ alter: true });
};

const create = async (req, franchisee_id) => {
  return await FranchiseeModel.create({
    franchisee_name: req.body.franchisee_name,
    document_url: req.body?.document_url,
    gst_number: req.body.gst_number,
    user_id: req.body.user_id,
    franchisee_id: req.body?.franchisee_id || franchisee_id,
  });
};

const update = async (req) => {
  return await FranchiseeModel.update(
    {
      franchisee_name: req.body?.franchisee_name,
      document_url: req.body?.document_url,
      gst_number: req.body?.gst_number,
      user_id: req.body?.user_id,
      franchisee_id: req.body?.franchisee_id,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: [
        "id",
        "franchisee_name",
        "document_url",
        "gst_number",
        "franchisee_id",
        "user_id",
      ],
      plain: true,
    }
  );
};

const get = async () => {
  let query = `
        SELECT 
            frs.id,
            frs.franchisee_name,
            frs.document_url,
            frs.gst_number,
            frs.franchisee_id,
            frs.user_id,
            COUNT(fr.*) as total_subfranchisee,
            COUNT(st.*) as total_students
        FROM
            franchisees frs
            LEFT JOIN franchisees fr on fr.franchisee_id = frs.id
            LEFT JOIN students st on st.franchisee_id = frs.id
        WHERE 
            frs.franchisee_id is null
        GROUP BY 
            frs.id,
            frs.franchisee_name,
            frs.document_url,
            frs.gst_number,
            frs.franchisee_id,
            frs.user_id
    `;
  return await FranchiseeModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (req, fran_id) => {
  // console.log(req.params, fran_id);
  // console.log({ fran_id });
  return await FranchiseeModel.findOne({
    where: {
      id: req?.params?.id || fran_id,
    },
  });
};

const deleteById = async (req) => {
  return await FranchiseeModel.destroy({
    where: {
      id: req.params.id,
    },
  });
};

const getSubFranchisee = async (req) => {
  return await FranchiseeModel.findOne({
    where: {
      id: req.body?.sub_franchisee_id,
      franchisee_id: {
        [Op.ne]: null,
      },
    },
  });
};

const getAllSubFranchisee = async (req) => {
  let whereQuery;
  if (req.user_data.role === "admin") {
    whereQuery = "sbfrs.franchisee_id is not null";
  } else {
    const record = await FranchiseeModel.findOne({
      where: {
        user_id: req.user_data.id,
        franchisee_id: {
          [Op.eq]: null,
        },
      },
    });
    whereQuery = `sbfrs.franchisee_id = '${record.id}'`;
  }

  let query = `
        SELECT 
            sbfrs.id,
            sbfrs.franchisee_name,
            sbfrs.document_url,
            sbfrs.gst_number,
            sbfrs.franchisee_id,
            sbfrs.user_id,
            COUNT(st.*) as total_students,
            COUNT(uc.*) as total_courses
        FROM   
            franchisees sbfrs
        LEFT JOIN students st on st.sub_franchisee_id = sbfrs.id
        LEFT JOIN users usr on usr.id = sbfrs.user_id
        LEFT JOIN users_courses uc on uc.user_id = usr.id
        WHERE
            ${whereQuery}
        GROUP BY 
            sbfrs.id,
            sbfrs.franchisee_name,
            sbfrs.document_url,
            sbfrs.gst_number,
            sbfrs.franchisee_id,
            sbfrs.user_id
    `;
  return await FranchiseeModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getByUserId = async (req, user_id) => {
  return await FranchiseeModel.findOne({
    where: {
      user_id: req?.user_data?.id || user_id,
    },
  });
};

const getFranchiseeUserId = async (req) => {
  let query;
  if (req.user_data.role === "admin") {
    const result = await FranchiseeModel.findAll({
      where: {
        franchisee_id: {
          [Op.eq]: null,
        },
      },
      attributes: ["user_id"],
      raw: true,
    });
    return result.map((row) => row.user_id);
  }
  if (req.user_data.role === "master_franchisee") {
    query = `
        SELECT
            (
                SELECT (json_agg(sbfrn.user_id))
                FROM
                    franchisees sbfrn
                WHERE sbfrn.franchisee_id = frn.id
            ) as user_ids
        FROM franchisees frn
        WHERE frn.user_id = '${req.user_data.id}'`;
    const result = await FranchiseeModel.sequelize.query(query, {
      type: sequelizeFwk.QueryTypes.SELECT,
    });

    return [...new Set(result.flatMap((obj) => [...obj.user_ids]))];
  }
};

const countSubFranchisee = async (id, sub_id, last_30_days = false) => {
  let where_query = {};
  if (last_30_days) {
    where_query = {
      createdAt: {
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
    where_query.id = sub_id;
    where_query.franchisee_id = {
      [Op.ne]: null,
    };
  }
  return await FranchiseeModel.count({
    where: where_query,
  });
};

export default {
  init,
  create,
  update,
  get,
  getById,
  deleteById,
  getByUserId,
  getSubFranchisee,
  getAllSubFranchisee,
  countSubFranchisee,
  getFranchiseeUserId,
};
