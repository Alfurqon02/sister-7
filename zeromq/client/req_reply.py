import zmq
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

context = zmq.Context()

# ANCHOR Socket to talk to server
print("Connecting to Request-Reply server…")
socket = context.socket(zmq.REQ)
req_host = os.getenv('REQ_REPLY_HOST', 'localhost')
req_port = os.getenv('REQ_REPLY_PORT', '4646')
socket.connect(f"tcp://{req_host}:{req_port}")
print(f"Connected to {req_host}:{req_port}")

# ANCHOR Function to send request and receive reply
def send_request(request_data):
    if isinstance(request_data, dict):
        message = json.dumps(request_data).encode('utf-8')
    else:
        message = str(request_data).encode('utf-8')
    
    socket.send(message)
    response = socket.recv()
    
    # Assume response is always valid JSON from our server
    return json.loads(response.decode('utf-8'))

# ANCHOR Main loop for user input
while True:
    user_input = input("\nEnter command: ").strip().lower()
    
    if user_input in ['ping', 'pong']:
        response = send_request({
            'service': 'echo',
            'message': 'pong' if user_input == 'ping' else 'ping'
        })
        print(f"You: {user_input}")
        print(f"Server: {response.get('result')}")
    
    elif user_input == 'time':
        response = send_request({'service': 'time'})
        print(f"You: {user_input}")
        print(f"Server: {response.get('result')}")
    
    elif user_input in ['hello', 'hello world']:
        response = send_request({
            'service': 'echo',
            'message': 'Hello World!'
        })
        print(f"You: {user_input}")
        print(f"Server: {response.get('result')}")
    
    else:
        # Send unknown command to server
        response = send_request({
            'service': 'unknown',
            'message': user_input
        })
        print(f"You: {user_input}")
        print(f"Server: {response.get('result')}")