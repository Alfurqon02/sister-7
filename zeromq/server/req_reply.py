import time
import zmq
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

context = zmq.Context()
socket = context.socket(zmq.REP)

# ANCHOR Bind to port from environment
port = int(os.getenv('REQ_REPLY_PORT', '4646'))
host = os.getenv('REQ_REPLY_HOST', 'localhost')
socket.bind(f"tcp://*:{port}")
print(f"Request-Reply Server bound to {host}:{port}")

# ANCHOR Function to process incoming requests
def process_request(request):
    request_str = request.decode('utf-8')
    
    # Simple JSON check and parsing
    if request_str.startswith('{'):
        data = json.loads(request_str)
        service = data.get('service')
        message = data.get('message', '')
        
        if service == 'echo':
            result = message
        elif service == 'time':
            result = time.strftime('%Y-%m-%d %H:%M:%S')
        elif service == 'ping':
            result = 'pong'
        else:
            result = 'server response with unknown command'
    else:
        # Simple string message
        result = f"Echo: {request_str}"
    
    return json.dumps({'result': result}).encode('utf-8')

# ANCHOR Main server loop
while True:
    # Wait for request from client
    message = socket.recv()
    print(f"Received: {message.decode('utf-8')}")
    
    # Process and send reply
    reply = process_request(message)
    socket.send(reply)
    print(f"Sent: {json.loads(reply.decode('utf-8'))['result']}")