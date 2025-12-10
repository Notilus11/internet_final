const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// --- CONFIGURATION ---
const DATA_FILE = path.join(__dirname, 'chat-data.json');
const PORT = 8081;

// --- HTTP SERVER ---
const server = http.createServer((req, res) => {
    // 1. Determine the requested path
    let requestPath = req.url;
    
    // If root is requested, serve main_index.html
    if (requestPath === '/') {
        requestPath = '/main_index.html';
    }
    
    // Construct the full file path
    // We remove any query parameters (like ?foo=bar) just in case
    let safePath = requestPath.split('?')[0];
    let filePath = path.join(__dirname, safePath);

    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    };

    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`404: File Not Found (${safePath})`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data, 'utf-8');
        }
    });
});

// --- DATA MANAGEMENT (Local JSON Storage) ---

let clients = [];
let chatHistory = {};
let rooms = [];

// 1. Function to Load Data from JSON file
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const rawData = fs.readFileSync(DATA_FILE);
            const data = JSON.parse(rawData);
            rooms = data.rooms || [];
            chatHistory = data.chatHistory || {};
            console.log('Data loaded successfully from local file.');
        } catch (err) {
            console.error('Error reading data file, starting fresh:', err);
            rooms = [];
            chatHistory = {};
        }
    } else {
        console.log('No data file found. Creating new session.');
        rooms = [];
        chatHistory = {};
        saveData(); // Create the file
    }
}

// 2. Function to Save Data to JSON file
function saveData() {
    const data = {
        rooms: rooms,
        chatHistory: chatHistory
    };
    // Writes to file asynchronously so it doesn't block the server
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
        if (err) console.error('Error saving data:', err);
    });
}

// --- WEBSOCKET SERVER ---
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Log connection with timestamp
    console.log(`[${new Date().toISOString()}] Client connected`);

    ws.id = Date.now();
    ws.room = null;
    clients.push(ws);

    ws.on('message', (message) => {
        try {
            const msgData = JSON.parse(message);

            if (msgData.type === 'new-user') {
                console.log('New User:', msgData.username);
                ws.username = msgData.username;
                // Send existing rooms to the new user
                rooms.forEach(room => {
                    ws.send(JSON.stringify({ type: 'new-room', room }));
                });
            } 
            else if (msgData.type === 'create-room') {
                console.log('Server: Room created');
                createRoom(msgData.room);
            } 
            else if (msgData.type === 'join-room') {
                console.log('Server: Joined room');
                ws.room = msgData.room;
                
                if (!chatHistory[ws.room]) chatHistory[ws.room] = [];
                
                // Send history only for this room
                ws.send(JSON.stringify({ type: 'history', data: chatHistory[ws.room], room: ws.room }));
                broadcastUserList();
            } 
            else if (msgData.type === 'leave-room') {
                console.log('Server: User left room');
                ws.room = null;
                broadcastUserList();
            } 
            else if (msgData.type === 'message') {
                console.log('Server: Message sent');
                storeAndBroadcastMessage(msgData);
            }
        } catch (e) {
            console.error("Error processing message:", e);
        }
    });

    ws.on('close', () => {
        // Log disconnection with timestamp
        console.log(`[${new Date().toISOString()}] Client disconnected`);

        clients = clients.filter(client => client !== ws);
        if (ws.room) {
            broadcastUserList();
        }
    });
});

function createRoom(room) {
    if (!rooms.includes(room)) {
        rooms.push(room);
        
        // SAVE TO LOCAL FILE
        saveData();

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'new-room', room }));
            }
        });
    }
}

function storeAndBroadcastMessage(msgData) {
    const room = msgData.room;

    // Ensure array exists
    if (!chatHistory[room]) chatHistory[room] = [];
    
    // Add to memory
    chatHistory[room].push(msgData);

    // SAVE TO LOCAL FILE
    saveData();

    // Broadcast to clients in that room
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.room === room) {
            client.send(JSON.stringify({ type: 'message', data: msgData, room }));
        }
    });
}

function broadcastUserList() {
    rooms.forEach(room => {
        const usersInRoom = clients
            .filter(client => client.room === room && client.room !== null)
            .map(client => client.username);

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.room === room && client.room !== null) {
                client.send(JSON.stringify({ type: 'user-list', users: usersInRoom }));
            }
        });
    });
}

// --- START SERVER ---
loadData();
server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT}`);
});