module.exports = {
  apps: [
    {
      name: 'i_o_t-frontend',
      cwd: 'E:/IOT/i_o_t-frontend/frontend_backup',
      script: 'npm',
      args: 'run serve:prod',
      // Remove interpreter for Windows
      // interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};