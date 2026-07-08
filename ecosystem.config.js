module.exports = {
  apps: [
    {
      name: "devsquad-api",
      cwd: "./apps/api",
      script: "uv",
      args: "run uvicorn app.main:app --host 0.0.0.0 --port 8000",
      interpreter: "none",
      env: {
        APP_ENV: "production",
      },
    },
    {
      name: "devsquad-web",
      cwd: "./apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
