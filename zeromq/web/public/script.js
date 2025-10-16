class ZeroMQWebClient {
    // ANCHOR Constructor and Initialization
    constructor() {
        this.socket = io();
        this.currentService = null;
        this.isConnectedToChat = false;
        this.clientName = '';
        
        this.initializeEventListeners();
        this.setupSocketListeners();
    }
    
    // ANCHOR Event Listeners and Socket Handlers
    initializeEventListeners() {
        // Service selector buttons
        document.getElementById('pubsubBtn').addEventListener('click', () => {
            this.switchService('pubsub');
        });
        
        document.getElementById('reqreplyBtn').addEventListener('click', () => {
            this.switchService('reqreply');
        });
        
        // Pub/Sub service events
        document.getElementById('joinChatBtn').addEventListener('click', () => {
            this.joinChat();
        });
        
        document.getElementById('leaveChatBtn').addEventListener('click', () => {
            this.leaveChat();
        });
        
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Request/Reply service events
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = btn.getAttribute('data-service');
                const message = btn.getAttribute('data-message');
                this.sendRequest(service, message);
            });
        });
        
        document.getElementById('sendRequestBtn').addEventListener('click', () => {
            this.sendCustomRequest();
        });
        
        document.getElementById('customMessage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCustomRequest();
            }
        });
    }
    
    // ANCHOR Socket.IO event handlers
    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
            this.isConnectedToChat = false;
            this.updateChatUI();
        });
        
        this.socket.on('pubsub_message', (data) => {
            this.displayChatMessage(data.message);
        });
        
        this.socket.on('chat_joined', (data) => {
            this.clientName = data.clientName;
            this.isConnectedToChat = true;
            this.updateChatUI();
            this.displayChatMessage(`You joined the chat as ${this.clientName}`);
        });
        
        this.socket.on('request_reply', (data) => {
            this.displayResponse(data.request, data.response);
        });
        
        this.socket.on('error', (data) => {
            console.error('Server error:', data.message);
            this.showError(data.message);
        });
    }
    
    // ANCHOR Service Switching and UI Updates
    switchService(service) {
        this.currentService = service;
        
        // Update button states
        document.querySelectorAll('.service-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (service === 'pubsub') {
            document.getElementById('pubsubBtn').classList.add('active');
            document.getElementById('pubsubService').classList.add('active');
            document.getElementById('reqreplyService').classList.remove('active');
        } else if (service === 'reqreply') {
            document.getElementById('reqreplyBtn').classList.add('active');
            document.getElementById('reqreplyService').classList.add('active');
            document.getElementById('pubsubService').classList.remove('active');
        }
    }
    
    // SECTION Pub/Sub methods
    joinChat() {
        const nameInput = document.getElementById('clientName');
        const clientName = nameInput.value.trim() || 'WebUser';
        
        this.socket.emit('join_chat', { clientName });
    }
    
    leaveChat() {
        if (this.isConnectedToChat) {
            this.socket.emit('leave_chat', { clientName: this.clientName });
            this.isConnectedToChat = false;
            this.updateChatUI();
            this.displayChatMessage(`❌ You left the chat`);
        }
    }
    
    sendChatMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (message && this.isConnectedToChat) {
            this.socket.emit('send_chat_message', {
                clientName: this.clientName,
                message: message
            });
            messageInput.value = '';
        }
    }
    
    displayChatMessage(message) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Add styling based on message type
        if (message.includes('SERVER:')) {
            messageElement.classList.add('server-message');
        } else if (message.includes(this.clientName + ':')) {
            messageElement.classList.add('user-message');
        }
        
        messageElement.textContent = message;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    updateChatUI() {
        const joinBtn = document.getElementById('joinChatBtn');
        const leaveBtn = document.getElementById('leaveChatBtn');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendMessageBtn');
        const nameInput = document.getElementById('clientName');
        
        if (this.isConnectedToChat) {
            joinBtn.disabled = true;
            leaveBtn.disabled = false;
            messageInput.disabled = false;
            sendBtn.disabled = false;
            nameInput.disabled = true;
        } else {
            joinBtn.disabled = false;
            leaveBtn.disabled = true;
            messageInput.disabled = true;
            sendBtn.disabled = true;
            nameInput.disabled = false;
        }
    }
    // !SECTION
    
    // SECTION Request/Reply methods
    sendRequest(service, message) {
        this.socket.emit('send_request', {
            service: service,
            message: message
        });
    }
    
    sendCustomRequest() {
        const serviceSelect = document.getElementById('serviceSelect');
        const messageInput = document.getElementById('customMessage');
        
        const service = serviceSelect.value;
        const message = messageInput.value.trim();
        
        if (message || service === 'time') {
            this.sendRequest(service, message);
            messageInput.value = '';
        }
    }
    
    displayResponse(request, response) {
        const responseList = document.getElementById('responseList');
        const responseItem = document.createElement('div');
        responseItem.className = 'response-item';
        
        const timestamp = new Date().toLocaleTimeString();
        
        let requestText = '';
        if (request.service && request.message !== undefined) {
            requestText = `Service: ${request.service}, Message: "${request.message}"`;
        } else {
            requestText = JSON.stringify(request);
        }
        
        responseItem.innerHTML = `
            <div class="request">Request: ${requestText}</div>
            <div class="response">Response: ${response.result || JSON.stringify(response)}</div>
            <div class="timestamp">${timestamp}</div>
        `;
        
        responseList.insertBefore(responseItem, responseList.firstChild);
        
        // Keep only last 10 responses
        while (responseList.children.length > 10) {
            responseList.removeChild(responseList.lastChild);
        }
    }
    
    updateConnectionStatus(isConnected) {
        // You can add connection status indicators here if needed
        console.log('Connection status:', isConnected ? 'Connected' : 'Disconnected');
    }
    
    showError(message) {
        alert(`Error: ${message}`);
    }
    // !SECTION
}

// ANCHOR Initialize the web client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const client = new ZeroMQWebClient();
    
    // Default to pub/sub service
    client.switchService('pubsub');
});