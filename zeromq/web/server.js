require('dotenv').config({ path: '../.env' });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const zmq = require('zeromq');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ANCHOR Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ANCHOR ZeroMQ sockets
let pubSocket, subSocket, pushSocket, reqSocket;

// ANCHOR Initialize ZeroMQ sockets
async function initZeroMQ() {
    try {
        // Publisher/Subscriber setup for chat
        subSocket = new zmq.Subscriber;
        const pubHost = process.env.ZEROMQ_PUB_HOST || 'localhost';
        const pubPort = process.env.ZEROMQ_PUB_PORT || '4545';
        await subSocket.connect(`tcp://${pubHost}:${pubPort}`);
        subSocket.subscribe("");
        
        pushSocket = new zmq.Push;
        const pullHost = process.env.ZEROMQ_PULL_HOST || 'localhost';
        const pullPort = process.env.ZEROMQ_PULL_PORT || '4546';
        await pushSocket.connect(`tcp://${pullHost}:${pullPort}`);
        
        console.log("Connected to ZeroMQ servers");
        
        // Listen for pub/sub messages
        for await (const [msg] of subSocket) {
            const message = msg.toString();
            io.emit('pubsub_message', { message });
        }
    } catch (error) {
        console.error("ZeroMQ connection error:", error);
    }
}

// ANCHOR Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Web client connected:', socket.id);
    
    // Handle pub/sub service
    socket.on('join_chat', async (data) => {
        try {
            const clientName = data.clientName || `WebClient_${socket.id.substring(0, 6)}`;
            await pushSocket.send(`${clientName} joined the chat`);
            socket.emit('chat_joined', { clientName });
        } catch (error) {
            socket.emit('error', { message: 'Failed to join chat' });
        }
    });
    
    socket.on('send_chat_message', async (data) => {
        try {
            const message = `${data.clientName}: ${data.message}`;
            await pushSocket.send(message);
        } catch (error) {
            socket.emit('error', { message: 'Failed to send message' });
        }
    });
    
    socket.on('leave_chat', async (data) => {
        try {
            await pushSocket.send(`${data.clientName} left the chat`);
        } catch (error) {
            console.error('Error leaving chat:', error);
        }
    });
    
    // Handle request/reply service
    socket.on('send_request', async (data) => {
        try {
            console.log('Received request:', data);
            
            // Create a new request socket for each request to avoid conflicts
            const tempReqSocket = new zmq.Request;
            const reqReplyHost = process.env.ZEROMQ_REQ_REPLY_HOST || 'localhost';
            const reqReplyPort = process.env.ZEROMQ_REQ_REPLY_PORT || '4646';
            await tempReqSocket.connect(`tcp://${reqReplyHost}:${reqReplyPort}`);
            
            let requestData;
            if (data.service && data.message !== undefined) {
                requestData = JSON.stringify({
                    service: data.service,
                    message: data.message
                });
            } else {
                requestData = JSON.stringify(data);
            }
            
            console.log('Sending to ZMQ:', requestData);
            await tempReqSocket.send(requestData);
            
            const [reply] = await tempReqSocket.receive();
            await tempReqSocket.close();
            
            let response;
            try {
                response = JSON.parse(reply.toString());
                console.log('Received response:', response);
            } catch (e) {
                response = { result: reply.toString() };
                console.log('Raw response:', reply.toString());
            }
            
            socket.emit('request_reply', {
                request: data,
                response: response
            });
        } catch (error) {
            console.error('Request error:', error);
            socket.emit('error', { message: 'Failed to send request: ' + error.message });
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Web client disconnected:', socket.id);
    });
});

// ANCHOR Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    console.log(`ZeroMQ Pub/Sub: ${process.env.ZEROMQ_PUB_HOST || 'localhost'}:${process.env.ZEROMQ_PUB_PORT || '4545'}`);
    console.log(`ZeroMQ Req/Reply: ${process.env.ZEROMQ_REQ_REPLY_HOST || 'localhost'}:${process.env.ZEROMQ_REQ_REPLY_PORT || '4646'}`);
    initZeroMQ();
});