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
          account_id: "xUu2ZcT7S_GEfx_SRangLQ",
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${"GgaTMX1yTQexzClILvhzxA"}:${"Un0tE3O1cqmwFI2Q48HGAH5eEOVp456l"}`
            ).toString("base64")}`,
          },
        }
      )
    ).data;
  },

  meeting: async (req, user) => {
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
    try {
      return (
        await axios.post(
          `${config.zoom_base_url}/users/${user}/meetings`,
          data,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
      ).data;
    } catch (error) {
      return error;
    }
  },

  user: async (req) => {
    const { access_token, expires_in } = await zoom.token();

    const data = {
      action: "create",
      user_info: {
        email: req.user_data.email,
        type: 1,
      },
    };

    return (
      await axios.post(config.zoom_base_url + "/users", data, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).data;
  },
};

export default zoom;
