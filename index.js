const PORT = process.env.PORT || 80;
const { spawn } = require("child_process");
const express = require("express");
const socket = require("socket.io");
const app = express();

app.use(express.static("public"));

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on PORT: ${PORT}`);
});

const io = socket(server);

io.sockets.on('connection', socket => {
    socket.on('command', command => {
        socket.emit('log', `executing command: ${command}`);
        const res = spawn("powershell.exe", [command]);
        res.stdout.on('data', data => {
            console.log(data.toString());
            socket.emit('log', data.toString());
        });
        res.stderr.on('data', error => {
            console.log('error: ', error.toString());
            socket.emit('log', error.toString());
        });
    });
});