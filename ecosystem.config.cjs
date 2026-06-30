module.exports = {
  apps: [
    {
      name: 'be-kilex-mituni',
      cwd: '/srv/www/node/kilex-api.mituni.id/be-kilex-mituni',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      env_file:
        '/srv/www/node/kilex-api.mituni.id/be-kilex-mituni/.env.production',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file:
        '/srv/www/node/kilex-api.mituni.id/be-kilex-mituni/logs/error.log',
      out_file:
        '/srv/www/node/kilex-api.mituni.id/be-kilex-mituni/logs/combined.log',
      merge_logs: true,
      time: true,
      kill_timeout: 3000,
    },
  ],
};