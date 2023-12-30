import { v4 as uuidv4 } from "uuid";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file, folder) => {
  console.log({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: process.env.AWS_BUCKET_NAME,
  });

  const key = `${folder}/${uuidv4()}-${file.filename
    .replaceAll(" ", "_")
    .replaceAll("'", "_")
    .replaceAll("/", "_")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: file.mimetype,
    Body: await file.toBuffer(),
  });

  try {
    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
  }
};

const deleteVideo = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log("video deleted");
  } catch (error) {
    console.log("error deleteing video", error);
  }
};

export { uploadToS3, deleteVideo };
