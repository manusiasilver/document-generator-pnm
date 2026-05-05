module.exports = {
  apps: [{
    name: 'doc-generator',
    script: 'server.js',
    cwd: __dirname,
    watch: false,
    autorestart: true,
    restart_delay: 8096,
    env: {
      PORT: 8096
    }
  }]
}
