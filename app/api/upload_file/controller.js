"use strict";

import pump from "pump";
import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { deleteVideo, uploadToS3 } from "../../config/s3Service.js";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
// ffmpeg.setFfmpegPath("../../../ffmpeg");

const imageMime = ["jpeg", "jpg", "png", "gif", "webp"];
const videoMime = ["mp4", "mpeg", "ogg", "webm", "m4v", "mov", "mkv"];
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
        `${folder}` +
        file.filename
          .replaceAll(" ", "_")
          .replaceAll("'", "_")
          .replaceAll("/", "_");

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

const uploadVideo = async (req, res) => {
  let path = [];
  try {
    const files = req.files();
    for await (const file of files) {
      let folder;
      // const mime = file.mimetype.split("/").pop();
      const mime = file.mimetype;
      console.log({ file });
      if (mime.startsWith("video")) {
        folder = "public/videos";
      } else {
        throw new Error("File should be video.");
      }

      const compressedFilePath = `temp/${uuidv4()}-${file.filename}`;
      // Perform video compression using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(file.toBuffer())
          .videoCodec("libx264")
          .audioCodec("libmp3lame")
          .size("720x?")
          .on("end", resolve)
          .on("error", function (error) {
            reject(error);
          })
          .save(compressedFilePath);
      });

      const compressedFileBuffer = await fs.promises.readFile(
        compressedFilePath
      );

      const filePath =
        `${folder}` +
        file.filename
          .replaceAll(" ", "_")
          .replaceAll("'", "_")
          .replaceAll("/", "_");

      const data = await uploadToS3(compressedFileBuffer, folder);
      path.push(data);
    }
    return res.send({
      path: path,
    });
  } catch (error) {
    console.error(error);
    return res.send(error);
  } finally {
    fs.unlinkSync(compressedFilePath);
  }
};

const deleteVideoFile = async (req, res) => {
  // return console.log(req.query);
  try {
    await deleteVideo(req.query.key);
    res.send({ message: "Video deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

const getFile = async (req, res) => {
  if (!req.query || !req.query.file_path) {
    return res.send({
      message: "file_path is required parameter",
    });
  }

  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const publicPath = path.join(
    currentDirPath,
    "../../../public",
    req.query.file_path
  );

  if (!fs.existsSync(publicPath)) {
    console.log("file not found");
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

  try {
    return res.send(await fs.readFileSync(publicPath));
  } catch (error) {
    console.error({ error });
  }
};

export default {
  uploadFiles,
  getFile,
  uploadVideo,
  deleteVideoFile,
};
