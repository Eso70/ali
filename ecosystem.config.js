/**
 * PM2 Ecosystem Configuration for Production
 * Optimized for 12-core VPS with cluster mode
 */
module.exports = {
  apps: [
    {
      name: 'ali-network',
      script: 'npm',
      args: 'start',
      cwd: process.cwd(),
      
      // Cluster mode - Use reasonable number of instances (leave resources for other apps)
      // Default: 4 instances (can be changed via PM2_INSTANCES env variable)
      // For 12-core VPS: 4 instances leaves 8 cores for system and other applications
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 4,
      exec_mode: 'cluster', // Cluster mode for load balancing
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001, // Use PORT from .env or default to 3001
      },
      
      // Memory management
      max_memory_restart: '1G', // Restart if memory exceeds 1GB per instance
      
      // Node.js options for better performance
      node_args: [
        '--max-old-space-size=2048', // 2GB heap size per instance
        '--enable-source-maps', // Enable source maps for better error tracking
      ].join(' '),
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // Merge logs from all instances
      
      // Auto restart configuration
      autorestart: true,
      watch: false, // Disable file watching in production
      ignore_watch: ['node_modules', '.next', 'logs'],
      
      // Graceful shutdown
      kill_timeout: 5000, // Wait 5 seconds before force kill
      wait_ready: true, // Wait for app to be ready
      listen_timeout: 10000, // Timeout for app to start listening
      
      // Advanced PM2 options
      min_uptime: '10s', // Consider app stable after 10 seconds
      max_restarts: 10, // Maximum restarts in 1 minute
      restart_delay: 4000, // Wait 4 seconds before restart
      
      // Health monitoring
      shutdown_with_message: true,
      exp_backoff_restart_delay: 100, // Exponential backoff on restarts
    },
  ],
};
