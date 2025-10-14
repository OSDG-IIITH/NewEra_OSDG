// Print the machine LAN IP and spawn `next dev` bound to 0.0.0.0
const { spawn } = require('child_process');
const os = require('os');

function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

(function () {
  try {
    const ip = getLanIp();
    const port = process.env.PORT || 3000;
    console.log('Starting dev server...');
    if (ip) {
      console.log(`App will be available on your LAN at: http://${ip}:${port}`);
    } else {
      console.log('Could not determine LAN IP. The server will still start bound to 0.0.0.0.');
    }

    const args = ['dev', '--hostname', '0.0.0.0', '--port', String(port)];
    const child = spawn('npx', ['next', ...args], { stdio: 'inherit', shell: true });

    child.on('exit', (code) => {
      process.exit(code);
    });
  } catch (err) {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  }
})();
