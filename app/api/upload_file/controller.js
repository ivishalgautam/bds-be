"use strict";

import pump from "pump";
import fs from "fs";

const imageMime = ["jpeg", "jpg", "png", "gif", "webp"];
const videoMime = ["mp4", "mpeg", "ogg", "webm", "m4v", ".mov"];
const docsMime = [
  "pdf",
  "ppt",
  "pptx",
  "docx",
  "application/msword",
  "msword",
  "vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const uploadFiles = async (req, res) => {
  let path = [];
  try {
    const files = req.files();
    for await (const file of files) {
      let folder;
      //   console.log(file);
      const mime = file.mimetype.split("/").pop();
      if (imageMime.includes(mime)) {
        folder = "public/images/";
      } else if (videoMime.includes(mime)) {
        folder = "public/videos/";
      } else if (docsMime.includes(mime)) {
        folder = "public/";
      } else {
        folder = "public/";
      }

      const filePath =
        `${folder}` + file.filename.replaceAll(" ", "_").replaceAll("'", "_");

      await fs.promises.mkdir(folder, { recursive: true });

      path.push(await pump(file.file, fs.createWriteStream(filePath)).path);
    }
    return res.send({
      path: path,
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const getFile = async (req, res) => {
  if (!req.query || !req.query.file_path) {
    return res.send(
      "missing_mandatory_paramter",
      "file_path is required parameter"
    );
  }
  if (!fs.existsSync(req.query.file_path)) {
    return res.code(404).send({ message: "file not found" });
  }
  let mime = req.query.file_path.split(".").pop();
  if (["jpeg", "jpg", "png", "gif", "webp"].includes(mime)) {
    if (mime === "jpg") {
      res.type(`image/jpeg`);
    } else {
      res.type(`image/${mime}`);
    }
  }
  if (["mp4", "mpeg", "ogg", "webm"].includes(mime)) {
    res.type(`video/${mime}`);
  }
  if (mime === "pdf") {
    res.type("application/pdf");
  }
  if (mime === "ppt") {
    res.type("application/vnd.ms-powerpoint");
  }

  if (mime === "docx") {
    res.type(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  }

  if (mime === "doc") {
    res.type("application/msword");
  }
  return res.send(await fs.readFileSync(req.query.file_path));
  return;
};

export default {
  uploadFiles,
  getFile,
};
