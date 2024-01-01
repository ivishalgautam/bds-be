"use strict";

import zoom from "../../helpers/zoom.js";
import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const create = async (req, res) => {
  try {
    let status;
    let meeting_type;
    const meeting = await zoom.meeting(req);
    if (req.body.meeting_type === 1) {
      status = "COMPLETED";
      meeting_type = "INSTANT";
    } else {
      status = "PENDING";
      meeting_type = "SCHEDULED";
    }

    const batch = await table.BatchModel.getById(undefined, req.body.batch_id);

    if (!batch) {
      return res.code(404).send({ message: "batch not exist!" });
    }

    if (meeting_type === "SCHEDULED") {
      const data = await table.MeetingModel.create(req, meeting);
      res.send(data);
    } else {
      res.send(meeting);
    }

    batch.students_id.forEach(async (id) => {
      const student = (await table.StudentModel.getDetailsById(id))[0];
      if (meeting_type === "SCHEDULED") {
        await sendMail(
          student.email,
          "Meeting scheduled",
          "",
          `<html lang="en">
              <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 50px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #333;">Invitation to Join Zoom Meeting - ${data?.meeting_topic}</h2>
                  <p style="color: #555;">I hope this message finds you well. We would like to invite you to an upcoming Zoom meeting with the following details:</p>
                  <ul>
                    <li><strong>Meeting Topic:</strong> ${data?.meeting_topic}</li>
                    <li><strong>Start Time:</strong> ${data?.start_time}</li>
                    <li><strong>Join url:</strong> ${data?.join_url}</li>
                    <li><strong>Passcode:</strong> ${data?.passcode}</li>
                  </ul>
                  <p style="color: #555;">To join the meeting, simply click on the following link:</p>
                  <a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; transition: background-color 0.3s ease;" href="${data?.join_url}">Join Zoom Meeting</a>
                  <p style="color: #555;">If prompted, use the following details to join the meeting:</p>
                  <p style="color: #555;">We look forward to your participation in this meeting. If you have any questions or concerns, please feel free to reach out.</p>
                </div>
              </body>
              </html>`
        );
      } else {
        await sendMail(
          student.email,
          "Meeting scheduled",
          "",
          `<html lang="en">
            <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 50px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333;">Invitation to Join Zoom Meeting - ${req.body.meeting_topic}</h2>
                <p style="color: #555;">I hope this message finds you well. We would like to invite you to an upcoming Zoom meeting with the following details:</p>
                <ul>
                  <li><strong>Meeting Topic:</strong> ${req.body.meeting_topic}</li>
                  <li><strong>Join url:</strong> ${meeting.join_url}</li>
                  <li><strong>Passcode:</strong> ${meeting.password}</li>
                </ul>
                <p style="color: #555;">To join the meeting, simply click on the following link:</p>
                <a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; transition: background-color 0.3s ease;" href="${meeting.join_url}">Join Zoom Meeting</a>
                <p style="color: #555;">If prompted, use the following details to join the meeting:</p>
                <p style="color: #555;">We look forward to your participation in this meeting. If you have any questions or concerns, please feel free to reach out.</p>
              </div>
            </body>
            </html>`
        );
      }
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

export default {
  create: create,
};
