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

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
`;

writeFile(".env", envContent.trim(), (err) => {
  if (err) {
    console.error("Error creating .env file ❌:", err);
  } else {
    console.log(".env file created successfully ✅");
  }
});
