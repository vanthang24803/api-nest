Set-Location ..

if (-Not (Test-Path .env)) {
@"
PORT=3005

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_REFRESH=

MINIO_PORT=9000
MINIO_ROOT_USER=
MINIO_ROOT_PASSWORD=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=
MINIO_ENDPOINT=localhost

REDIS_HOST=
REDIS_PORT=6379

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
"@ > .env
    Write-Host "Created .env successfully! 🎉"
}
else {
    Write-Host ".env already exists. Skipping installation. 👍"
}

if (-Not (Test-Path node_modules)) {
    pnpm install
    Write-Host "Dependencies installed successfully! 🎉"
}
else {
    Write-Host "node_modules already exists. Skipping installation. 👍"
}
