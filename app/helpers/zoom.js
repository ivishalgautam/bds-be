import config from "../config/index.js";
import qs from "query-string";
import axios from "axios";

const zoom = {
  token: async () => {
    return (
      await axios.post(
        config.zoom_oauth_url,
        qs.stringify({
          grant_type: "account_credentials",
          account_id: config.zoom_account_id,
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.zoom_client_id}:${config.zoom_client_secret}`
            ).toString("base64")}`,
          },
        }
      )
    ).data;
  },

  meeting: async (req) => {
    const { access_token, expires_in } = await zoom.token();
    const data = {
      agenda: req.body.agenda,
      default_password: false,
      settings: {
        waiting_room: true,
        registration_type: 1,
        private_meeting: true,
        show_share_button: true,
        email_notification: false,
        allow_multiple_devices: true,
        enable_dedicated_group_chat: true,
        registrants_confirmation_email: false,
        registrants_email_notification: false,
      },
      topic: req.body.topic,
      timezone: "Asia/Kolkata",
      start_time: req.body?.scheduled_at,
      type: req.body.meeting_type,
    };
    return (
      await axios.post(config.zoom_base_url + "/users/me/meetings", data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).data;
  },
};

export default zoom;
