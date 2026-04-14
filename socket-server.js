// Socket.IO Relay Server — Kavach Titanium
// Standalone Node.js server that bridges the Python feeder with browser clients
// Run: node socket-server.js

const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
});

let simulationActive = true;
let connectedClients = 0;
let pythonFeeder = null;

io.on('connection', (socket) => {
  connectedClients++;

  if (socket.handshake.query.role === 'feeder') {
    pythonFeeder = socket;
    console.log(`[+] Python Feeder connected: ${socket.id}`);

    // Forward events from feeder to all dashboard clients
    socket.on('new_transaction', (data) => {
      socket.broadcast.emit('new_transaction', data);
    });

    socket.on('new_alert', (data) => {
      socket.broadcast.emit('new_alert', data);
    });

    socket.on('disconnect', () => {
      console.log('[-] Python Feeder disconnected');
      pythonFeeder = null;
    });

  } else {
    // Dashboard browser client connected
    console.log(`[+] Dashboard client: ${socket.id} (Total: ${connectedClients})`);

    // Send current state
    socket.emit('system_status', {
      status: 'connected',
      simulation: simulationActive,
      feeder_connected: pythonFeeder !== null,
    });

    // Simulation controls from dashboard
    socket.on('start_simulation', () => {
      simulationActive = true;
      if (pythonFeeder) pythonFeeder.emit('start_simulation');
      io.emit('sim_status', { running: true });
      console.log('>>> SIMULATION STARTED <<<');
    });

    socket.on('stop_simulation', () => {
      simulationActive = false;
      if (pythonFeeder) pythonFeeder.emit('stop_simulation');
      io.emit('sim_status', { running: false });
      console.log('>>> SIMULATION PAUSED <<<');
    });

    socket.on('disconnect', () => {
      connectedClients = Math.max(0, connectedClients - 1);
      console.log(`[-] Client disconnected (Remaining: ${connectedClients})`);
    });
  }
});

httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('  KAVACH TITANIUM — SOCKET.IO RELAY SERVER');
  console.log('='.repeat(60));
  console.log(`  Listening on port ${PORT}`);
  console.log(`  Dashboard clients connect to: http://localhost:${PORT}`);
  console.log(`  Python feeder connects to:    http://localhost:${PORT}`);
  console.log('  (Use role=feeder query param from Python)');
  console.log('='.repeat(60) + '\n');
});
