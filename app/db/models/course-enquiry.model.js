"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let CourseEnquiryModel;

const init = async (sequelize) => {
  CourseEnquiryModel = sequelize.define(
    constants.models.COURSE_ENQUIRY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
      },
      enquiry_from_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        referances: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      enquiry_to_id: {
        allowNull: true,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        referances: {
          model: constants.models.USER_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      course_id: {
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        onDelete: "CASCADE",
        referances: {
          model: constants.models.COURSES_TABLE,
          key: "id",
          deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      for_admin: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_assigned: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await CourseEnquiryModel.sync({ alter: true });
};

const create = async (req, enquiry_to_id, for_admin = false) => {
  return await CourseEnquiryModel.create({
    enquiry_from_id: req.user_data.id,
    enquiry_to_id: enquiry_to_id,
    course_id: req.body.course_id,
    for_admin: for_admin,
  });
};

const exist = async (enq_from_id, course_id, enq_to_id = null) => {
  return await CourseEnquiryModel.findOne({
    where: {
      enquiry_from_id: enq_from_id,
      course_id: course_id,
      enquiry_to_id: enq_to_id,
    },
  });
};

const get = async (req, enq_to_id) => {
  let whereQuery = `WHERE ce.enquiry_to_id is null AND ce.for_admin = true`;

  if (req.user_data.role !== "admin") {
    whereQuery = `WHERE ce.enquiry_to_id = '${enq_to_id}'`;
  }

  let query = `
        SELECT 
            ce.*,
            usr.email,
            usr.mobile_number,
            usr.username,
            crs.course_name
        FROM course_enquiries ce
        LEFT JOIN users usr on usr.id = ce.enquiry_from_id
        LEFT JOIN courses crs on crs.id = ce.course_id
        ${whereQuery}
`;

  return await CourseEnquiryModel.sequelize.query(query, {
    type: sequelizeFwk.QueryTypes.SELECT,
  });
};

const getById = async (id) => {
  return await CourseEnquiryModel.findOne({
    where: { id: id },
  });
};

const deleteById = async (id) => {
  return await CourseEnquiryModel.destroy({
    where: { id: id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  deleteById: deleteById,
  exist: exist,
};
