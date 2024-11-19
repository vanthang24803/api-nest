module.exports = {
  apps: [
    {
      name: "nest-api",
      script: "dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
