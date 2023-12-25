"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let RecordingModel = null;

const init = async (sequelize) => {
    RecordingModel = sequelize.define(
        constants.models.RECORDINGS_TABLE,
        {
            id: {
                allowNull: false,
                primaryKey: true,
                unique: true,
                type: sequelizeFwk.DataTypes.UUID,
                defaultValue: sequelizeFwk.DataTypes.UUIDV4,
            },
            heading: {
                type: sequelizeFwk.DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: sequelizeFwk.DataTypes.TEXT,
                allowNull: false,
            },
            video_url: {
                type: sequelizeFwk.DataTypes.STRING,
                allowNull: false,
            },
            thumbnail: {
                type: sequelizeFwk.DataTypes.STRING,
                defaultValue: "",
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
            batch_id: {
                type: sequelizeFwk.DataTypes.UUID,
                onDelete: "CASCADE",
                references: {
                    model: constants.models.BATCH_TABLE,
                    key: "id",
                    allowNull: false,
                    deferrable: sequelizeFwk.Deferrable.INITIALLY_IMMEDIATE,
                },
            },
            teacher_id: {
                type: sequelizeFwk.DataTypes.UUID,
                onDelete: "CASCADE",
                references: {
                    model: constants.models.TEACHER_TABLE,
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
    await RecordingModel.sync({ alter: true });
};

const create = async (req, teacher_id) => {
    const data = req.body.video_url.split("public");
    return await RecordingModel.create({
        heading: req.body.heading,
        description: req.body.description,
        video_url: req.body.video_url,
        course_id: req.body.course_id,
        batch_id: req.body.batch_id,
        teacher_id: teacher_id,
    });
};

const update = async (req, teacher_id) => {
    let image;
    return await RecordingModel.update(
        {
            heading: req.body?.heading,
            description: req.body?.description,
            video_url: req.body?.video_url,
            course_id: req.body?.course_id,
            batch_id: req.body?.batch_id,
            teacher_id: teacher_id,
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

const get = async (req, idenitifier) => {
    let joinQuery;

    if (req.user_data.role === "teacher") {
        joinQuery = `
            LEFT JOIN batches bt ON bt.id = rcd.batch_id
            LEFT JOIN courses crs ON crs.id = rcd.course_id
            WHERE
                rcd.teacher_id = '${idenitifier}'    
        `;
    }
    if (req.user_data.role === "student") {
        joinQuery = `
            LEFT JOIN courses crs ON crs.id = rcd.course_id
            INNER JOIN batches bt ON bt.students_id @>'["${idenitifier}"]'::jsonb
        `;
    }
    let query = `
      SELECT 
        rcd.id,
        rcd.heading,
        rcd.description,
        rcd.video_url,
        rcd.course_id,
        rcd.batch_id,
        rcd.teacher_id,
        rcd.thumbnail,
        bt.batch_name,
        crs.course_name
      FROM
        recordings rcd
      ${joinQuery}
    `;
    return await RecordingModel.sequelize.query(query, {
        type: sequelizeFwk.QueryTypes.SELECT,
    });
};

const getById = async (req, id) => {
    return await RecordingModel.findOne({
        where: {
            id: req?.params?.id || id,
        },
    });
};

const deleteById = async (req) => {
    return await RecordingModel.destroy({
        where: {
            id: req.params.id,
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
};
