import zmq
import threading
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

context = zmq.Context()

# ANCHOR Socket to receive messages (subscriber)
sub_socket = context.socket(zmq.SUB)
pub_host = os.getenv('PUBLISHER_HOST', 'localhost')
pub_port = os.getenv('PUBLISHER_PUB_PORT', '4545')
sub_socket.connect(f"tcp://{pub_host}:{pub_port}")
sub_socket.setsockopt_string(zmq.SUBSCRIBE, "")  # ANCHOR Subscribe to all messages

# ANCHOR Socket to send messages (push)
push_socket = context.socket(zmq.PUSH)
pull_host = os.getenv('PUBLISHER_HOST', 'localhost')
pull_port = os.getenv('PUBLISHER_PULL_PORT', '4546')
push_socket.connect(f"tcp://{pull_host}:{pull_port}")

client_name = "Client1"
print(f"=== {client_name} joining the group chat ===")

# ANCHOR Send join message to server
push_socket.send_string(f"{client_name} joined the chat")

print("Type messages to send (or 'quit' to exit)")

def receive_messages():
    while True:
        try:
            message = sub_socket.recv_string(zmq.NOBLOCK)
            print(f"\r{message}")
            print(f"{client_name}> ", end="", flush=True)
        except zmq.Again:
            time.sleep(0.1)
        except:
            break

# ANCHOR Start receiving thread
receive_thread = threading.Thread(target=receive_messages)
receive_thread.daemon = True
receive_thread.start()

# ANCHOR Send messages
try:
    while True:
        user_input = input(f"{client_name}> ")
        
        if user_input.lower() == 'quit':
            push_socket.send_string(f"{client_name} left the chat")
            break
        
        if user_input.strip():
            message = f"{client_name}: {user_input}"
            push_socket.send_string(message)

except KeyboardInterrupt:
    push_socket.send_string(f"{client_name} left the chat")

print(f"\n{client_name} disconnected from group chat")