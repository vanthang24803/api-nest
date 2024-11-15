import { writeFile } from "fs";

process.chdir("..");

const envContent = `
PORT=3005

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_REFRESH=

MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=
MINIO_ENDPOINT=localhost
`;

writeFile(".env", envContent.trim(), (err) => {
  if (err) {
    console.error("Error creating .env file ❌:", err);
  } else {
    console.log(".env file created successfully ✅");
  }
});
