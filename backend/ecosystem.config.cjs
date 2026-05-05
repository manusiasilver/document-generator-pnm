module.exports = {
  apps: [{
    name: 'doc-generator',
    script: 'server.js',
    cwd: __dirname,
    watch: false,
    autorestart: true,
    restart_delay: 3000,
    env: {
      PORT: 3001
    }
  }]
}
