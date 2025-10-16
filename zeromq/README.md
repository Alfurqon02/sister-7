# ZeroMQ Web Client

Simple ZeroMQ project with Python servers and web interface.

## Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements.txt
cd web && npm install && cd ..
```

2. **Start servers:**
```bash
# Terminal 1
python server/publisher.py

# Terminal 2  
python server/req_reply.py

# Terminal 3
cd web && npm start
```

3. **Open browser:** http://localhost:3000

## What it does

- **Pub/Sub Chat**: Real-time group chat using ZeroMQ
- **Request/Reply**: Send commands and get responses

## Files

```
server/publisher.py    # Chat server
server/req_reply.py    # Command server
client/subscriber1.py  # Chat client
client/req_reply.py    # Command client
web/                   # Web interface
.env                   # Configuration
```

## Configuration

Edit `.env` file to change ports:
```env
PORT=3000              # Web server port
PUBLISHER_PUB_PORT=4545    # Chat server port
REQ_REPLY_PORT=4646        # Command server port
```