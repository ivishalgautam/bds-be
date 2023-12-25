"use strict";

import zoom from "../../helpers/zoom.js";
import table from "../../db/models.js";

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
    console.log(batch.students_id);
    return res.send({
      meeting_id: meeting.id,
      meeting_type: meeting_type,
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      meeting_host: meeting.host_email,
      scheduled_at: meeting?.start_time || "",
      batch_name: batch.batch_name,
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

export default {
  create: create,
};
