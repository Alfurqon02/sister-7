# Sister 7 - Distributed Systems Projects

This repository contains two distributed systems projects implemented as part of the Sister (Distributed Systems) course:

1. **GraphQL User Management API** - A GraphQL-based user management system with web interface
2. **ZeroMQ Chat System** - A distributed chat system using ZeroMQ messaging patterns

## 📁 Project Structure

```
├── graphql/                    # GraphQL User Management API
│   ├── data.json              # User data storage
│   ├── index.js               # GraphQL server
│   ├── package.json           # Node.js dependencies
│   └── public/                # Web client files
│       ├── index.html         # GraphQL client interface
│       └── style.css          # Client styling
│
└── zeromq/                    # ZeroMQ Chat System
    ├── requirements.txt       # Python dependencies
    ├── client/                # Client applications
    │   ├── req_reply.py       # Request-Reply client
    │   ├── subscriber1.py     # Chat client 1
    │   └── subscriber2.py     # Chat client 2
    ├── server/                # Server applications
    │   ├── publisher.py       # Chat server (Pub/Sub)
    │   └── req_reply.py       # Request-Reply server
    └── web/                   # Web client for ZeroMQ
        ├── package.json       # Node.js dependencies
        ├── server.js          # Web server with Socket.IO
        └── public/            # Web client files
            ├── index.html     # Web chat interface
            ├── script.js      # Client-side JavaScript
            └── style.css      # Client styling
```

---

## 🚀 Project 1: GraphQL User Management API

A GraphQL-based API for managing users with full CRUD operations and an interactive web client.

### Features

- **GraphQL Schema**: Complete user management with queries and mutations
- **CRUD Operations**: Create, Read, Update, Delete users
- **JSON File Storage**: Persistent data storage in JSON format
- **Web Interface**: Interactive GraphQL client with GraphiQL
- **Real-time Updates**: Immediate data persistence

### Tech Stack

- **Backend**: Node.js, Express.js, GraphQL
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON file-based storage
- **API**: GraphQL with GraphiQL interface

### Setup and Installation

1. Navigate to the GraphQL project directory:
```bash
cd graphql
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
   - **Web Client**: http://localhost:4000
   - **GraphiQL Interface**: http://localhost:4000/graphql

### GraphQL Schema

#### Types
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int!
}
```

#### Queries
- `users`: Get all users
- `user(id: ID!)`: Get user by ID
- `hello`: Test query

#### Mutations
- `createUser(input: UserInput!)`: Create new user
- `updateUser(id: ID!, input: UpdateUserInput!)`: Update existing user
- `deleteUser(id: ID!)`: Delete user

### Example Usage

**Create a user:**
```graphql
mutation {
  createUser(input: {
    name: "Alice Johnson"
    email: "alice@example.com"
    age: 28
  }) {
    id
    name
    email
    age
  }
}
```

**Query all users:**
```graphql
query {
  users {
    id
    name
    email
    age
  }
}
```

---

## 🚀 Project 2: ZeroMQ Chat System

A distributed chat system demonstrating various ZeroMQ messaging patterns including Pub/Sub and Request-Reply.

### Features

- **Publisher-Subscriber Pattern**: Group chat functionality
- **Request-Reply Pattern**: Service-oriented communication
- **Multiple Clients**: Support for multiple simultaneous chat clients
- **Web Interface**: Browser-based chat client using Socket.IO
- **Real-time Messaging**: Instant message delivery
- **Server Commands**: Administrative commands for server management

### Tech Stack

#### Python Components
- **Backend**: Python with ZeroMQ (pyzmq)
- **Environment**: python-dotenv for configuration

#### Web Components
- **Backend**: Node.js, Express.js, Socket.IO, ZeroMQ
- **Frontend**: HTML, CSS, JavaScript
- **Real-time**: Socket.IO for web client communication

### Setup and Installation

#### Python Environment Setup

1. Navigate to the ZeroMQ project directory:
```bash
cd zeromq
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file for configuration (optional):
```env
REQ_REPLY_PORT=4646
REQ_REPLY_HOST=localhost
PUBLISHER_PUB_PORT=4545
PUBLISHER_PULL_PORT=4546
PUBLISHER_HOST=localhost
```

#### Web Client Setup

1. Navigate to the web directory:
```bash
cd zeromq/web
```

2. Install Node.js dependencies:
```bash
npm install
```

### Running the System

#### Method 1: Python Clients

1. **Start the Chat Server (Publisher/Subscriber)**:
```bash
cd zeromq/server
python publisher.py
```

2. **Start the Request-Reply Server**:
```bash
cd zeromq/server
python req_reply.py
```

3. **Start Chat Clients**:
```bash
# Terminal 1
cd zeromq/client
python subscriber1.py

# Terminal 2
cd zeromq/client
python subscriber2.py
```

4. **Start Request-Reply Client**:
```bash
cd zeromq/client
python req_reply.py
```

#### Method 2: Web Client

1. **Start Python servers** (steps 1-2 from Method 1)

2. **Start Web Server**:
```bash
cd zeromq/web
npm start
```

3. **Open Browser**: Navigate to http://localhost:3000

### ZeroMQ Patterns Implemented

#### 1. Publisher-Subscriber (Pub/Sub)
- **Purpose**: Group chat functionality
- **Components**: 
  - Publisher server broadcasts messages
  - Multiple subscribers receive messages
- **Ports**: 4545 (publishing), 4546 (receiving from clients)

#### 2. Request-Reply (Req/Rep)
- **Purpose**: Service-oriented communication
- **Services Available**:
  - `echo`: Returns the sent message
  - `time`: Returns current server time
  - `ping`: Returns "pong"
- **Port**: 4646

### Server Commands

The chat server supports various administrative commands:

- `help`: Show available commands
- `status`: Display connected clients
- `announce <message>`: Send announcement to all clients
- Direct messages: Type any message to broadcast to clients

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REQ_REPLY_PORT` | 4646 | Request-Reply server port |
| `REQ_REPLY_HOST` | localhost | Request-Reply server host |
| `PUBLISHER_PUB_PORT` | 4545 | Publisher broadcast port |
| `PUBLISHER_PULL_PORT` | 4546 | Publisher receive port |
| `PUBLISHER_HOST` | localhost | Publisher server host |
| `PORT` | 3000 | Web server port |

---

## 🔧 Development

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.7 or higher)
- **npm** (Node Package Manager)
- **pip** (Python Package Manager)

### Project Dependencies

#### GraphQL Project
```json
{
  "express": "^5.1.0",
  "express-graphql": "^0.12.0",
  "graphql": "^15.10.1"
}
```

#### ZeroMQ Python
```
python-dotenv==1.0.0
pyzmq==25.1.1
```

#### ZeroMQ Web Client
```json
{
  "express": "^4.18.2",
  "socket.io": "^4.7.2",
  "zeromq": "^6.0.0-beta.17",
  "dotenv": "^16.6.1"
}
```

### Architecture Diagrams

#### GraphQL Architecture
```
Client (Browser) ↔ GraphQL API (Express) ↔ JSON File Storage
                     ↑
                GraphiQL Interface
```

#### ZeroMQ Architecture
```
Chat Clients ↔ Publisher/Subscriber Server ↔ Chat Clients
Request Client ↔ Request/Reply Server
Web Client ↔ Node.js + Socket.IO ↔ ZeroMQ Servers
```

---

## 📚 Learning Objectives

These projects demonstrate key concepts in distributed systems:

1. **API Design**: GraphQL vs REST paradigms
2. **Message Patterns**: Pub/Sub and Request-Reply patterns
3. **Real-time Communication**: WebSockets and ZeroMQ
4. **Client-Server Architecture**: Multiple client types and server patterns
5. **Data Persistence**: File-based and in-memory storage
6. **Cross-platform Integration**: Python servers with Node.js web clients

---

## 🤝 Usage Examples

### GraphQL Examples

**Query with Variables:**
```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    age
  }
}
```

**Update User:**
```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
    age
  }
}
```

### ZeroMQ Chat Examples

**Python Client Commands:**
- Type any message to send to the group
- Type `quit` to leave the chat

**Server Commands:**
- `announce Welcome everyone!` - Send announcement
- `status` - Check connected clients
- `help` - Show all commands

---

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   - Change ports in `.env` file or source code
   - Kill existing processes using the ports

2. **ZeroMQ Connection Issues**:
   - Ensure servers are started before clients
   - Check firewall settings for the configured ports

3. **GraphQL Schema Errors**:
   - Verify JSON data file format
   - Check for syntax errors in GraphQL queries

4. **Web Client Not Connecting**:
   - Ensure both Python servers and Node.js server are running
   - Check browser console for WebSocket connection errors

---

## 📄 License

This project is part of academic coursework for the Sister (Distributed Systems) course.

## 👥 Contributors

- Course: Sister (Distributed Systems) - Semester 9
- Institution: [Your University/Institution]

---

## 📖 Additional Resources

- [GraphQL Documentation](https://graphql.org/learn/)
- [ZeroMQ Guide](https://zguide.zeromq.org/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)