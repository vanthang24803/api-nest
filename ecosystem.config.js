module.exports = {
  apps: [
    {
      name: "nest-api",
      script: "dist/main.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
