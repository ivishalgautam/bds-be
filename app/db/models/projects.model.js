"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { Deferrable } from "sequelize";

let ProjectModel = null;

const init = async (sequelize) => {
    ProjectModel = sequelize.define(
        constants.models.PROJECT_TABLE,
        {
            id: {
                allowNull: false,
                primaryKey: true,
                unique: true,
                type: sequelizeFwk.DataTypes.UUID,
                defaultValue: sequelizeFwk.DataTypes.UUIDV4,
            },
            project_name: {
                type: sequelizeFwk.DataTypes.STRING,
                allowNull: false,
            },
            weeks: {
                type: sequelizeFwk.DataTypes.STRING,
                allowNull: false,
            },
            is_disabled: {
                type: sequelizeFwk.DataTypes.BOOLEAN,
                defaultValue: true,
            },
            project_file: {
                type: sequelizeFwk.DataTypes.STRING,
                allowNull: false,
            },
            course_id: {
                type: sequelizeFwk.DataTypes.UUID,
                onDelete: "CASCADE",
                references: {
                    model: constants.models.COURSES_TABLE,
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
    await ProjectModel.sync({ alter: true });
};

const create = async (req) => {
    return await ProjectModel.create({
        project_name: req.body.project_name,
        weeks: req.body.weeks,
        is_disabled: req.body?.is_disabled,
        project_file: req.body.project_file,
        course_id: req.body.course_id,
    });
};

const update = async (req) => {
    return await ProjectModel.update(
        {
            project_name: req.body?.project_name,
            weeks: req.body?.weeks,
            is_disabled: req.body?.is_disabled,
            project_file: req.body?.project_file,
            course_id: req.body?.course_id,
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

const get = async () => {
    
    let query = `
        SELECT 
            prj.id,
            prj.created_at,
            prj.project_name,
            prj.weeks,
            prj.is_disabled,
            prj.project_file,
            prj.course_id,
            co.course_name
        FROM projects prj
        INNER JOIN courses co ON co.id = prj.course_id
        ORDER BY prj.created_at DESC
    `;

    return await ProjectModel.sequelize.query(query, {
        type: sequelizeFwk.QueryTypes.SELECT,
    });
};

const getById = async (req) => {
    return await ProjectModel.findOne({
        where: {
            id: req.params.id,
        },
    });
};

const deleteById = async (req) => {
    return await ProjectModel.destroy({
        where: {
            id: req.params.id,
        },
    });
};

const checkExist = async (req) => {
    return await ProjectModel.findOne({
        where: {
            course_id: req.body.course_id,
            weeks: String(req.body.weeks),
        },
    });
};
export default {
    init,
    create,
    update,
    get,
    getById,
    deleteById,
    checkExist,
};
