const app = require('express')();
let server = {};

server = require('http').createServer(app);

const io = require('socket.io')(server, { cors: true, origins: false });
const signalServer = require('simple-signal-server')(io);
const port = process.env.PORT || 3000;
const rooms = new Map();

server.listen(port, () => {
    log(`Servido en el puerto ${port}`);
});

app.get('/', function (req, res) {
    var sum = 0;
    rooms.forEach((v, k) => sum = sum + v.size);
    res.send(`Lobby<br/>Salas: ${rooms.size} <br/>Usuarios: ${sum}`);
});

signalServer.on('discover', (request) => {
    log('discover');
    let memberId = request.socket.id;
    let roomId = request.discoveryData;
    let members = rooms.get(roomId);
    if (!members) {
        members = new Set();
        rooms.set(roomId, members);
    }
    members.add(memberId);
    request.socket.roomId = roomId;
    request.discover({
        peers: Array.from(members)
    });
    log(`Ingresó ${roomId} ${memberId}`);
})

signalServer.on('disconnect', (socket) => {
    let memberId = socket.id;
    let roomId = socket.roomId;
    let members = rooms.get(roomId);
    if (members) {
        members.delete(memberId);
    }
    log(`Salió ${roomId} ${memberId}`);
})

signalServer.on('request', (request) => {
    request.forward();
    log('requested');
})

function log(message, data) {
    if (true) {
        console.log(message);
        if (data != null) {
            console.log(data);
        }
    }
}