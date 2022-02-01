const PORT = process.env.PORT || 80;
const util = require('./util.js');

const { spawn } = require("child_process");

const fs = require('fs');
const express = require("express");
const socket = require("socket.io");
const bodyParser = require('body-parser');

const app = express();

app.use(express.static("public"));
app.use('/explorer', express.static("C:/"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on PORT: ${PORT}`);
});

app.get('/terminal', (_, res) => {
    res.sendFile(__dirname + '/public/terminal.html');
});

app.get('/explorer', (_, res) => {
    res.sendFile(__dirname + '/public/explorer.html');
});

app.get('/drop', (_, res) => {
    res.sendFile(__dirname + '/public/drop.html');
});

app.post('/upload', util.handleFileUpload, (req, res) => {
    res.redirect('/');
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

    socket.on('explorer', async path => {
        if (await fs.lstatSync(path).isDirectory()) {
            const items = fs.readdirSync(path);
            socket.emit('explorer', items);
        } else {
            const file = path.replace('C:/', '/explorer');
            socket.emit('file', file);
        }
    });
});