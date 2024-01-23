"use strict";
import table from "../../db/models.js";
import sendMail from "../../helpers/mailer.js";

const birthdayWish = async (req, res) => {
  try {
    const users = (await table.UserModel.findUsersWithBirthdayToday())?.map(
      (user) => ({
        email: user.email,
      })
    );

    await users?.forEach((user) => {
      sendMail(
        user.email,
        `Happy Birthday`,
        "Happy Birthday",
        `
            <body style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">

            <div class="container" style="max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">

                <div class="header" style="background-color: #5542D7; color: #fff; text-align: center; padding: 20px;">
                    <h1 style="margin: 0;">Happy Birthday!</h1>
                </div>

                <div class="content" style="padding: 20px; text-align: center;">
                    <p style="margin: 0;">On this special day, we want to celebrate you! Wishing you a fantastic birthday filled with joy, laughter, and all the success in your learning journey. May this year bring you new insights and exciting challenges to conquer!</p>
                    <p style="margin: 0;">Keep learning and growing!</p>
                    <p style="margin: 0;">Best Wishes,</p>
                    <p style="margin: 0;">The BDS Team</p>
                </div>

                <!-- Add a container for confetti -->
                <div id="confetti-container" class="content" style="position: relative; height: 100px;"></div>

                <div class="footer" style="background-color: #5542D7; color: #fff; text-align: center; padding: 10px;">
                <p style="margin: 0;">Thank you for being a valued learner on our platform!</p>
                </div>

            </div>
            </body>
        `
      );
    });
    console.log("Birthday wishes sent");
  } catch (error) {
    console.error(error);
  }
};

export default {
  birthdayWish: birthdayWish,
};
