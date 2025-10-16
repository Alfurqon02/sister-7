import zmq
import time
import threading
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

context = zmq.Context()
pub_socket = context.socket(zmq.PUB)
pull_socket = context.socket(zmq.PULL)

# ANCHOR Bind publisher to broadcast messages
pub_port = int(os.getenv('PUBLISHER_PUB_PORT', '4545'))
pub_socket.bind(f"tcp://*:{pub_port}")
print(f"Chat server publisher bound to port {pub_port}")

# ANCHOR Bind pull socket to receive messages from clients
pull_port = int(os.getenv('PUBLISHER_PULL_PORT', '4546'))
pull_socket.bind(f"tcp://*:{pull_port}")
print(f"Chat server receiver bound to port {pull_port}")

print("Group chat server is running...")
print("Type 'help' for commands or messages to send to clients")
print("Commands: 'help', 'status', 'announce <message>'")

connected_clients = set()

# ANCHOR Function to send server messages
def send_server_message(message):
    timestamp = time.strftime('%H:%M:%S')
    server_msg = f"[{timestamp}] SERVER: {message}"
    pub_socket.send_string(server_msg)
    print(f"Server sent: {server_msg}")

# ANCHOR Function to broadcast messages from clients
def broadcast_message():
    while True:
        # Receive message from any client
        message = pull_socket.recv_string()
        timestamp = time.strftime('%H:%M:%S')

        # Check for client join/leave messages
        if "joined the chat" in message:
            client_name = message.split()[0]
            connected_clients.add(client_name)
            print(f">>> {client_name} connected to server")
            send_server_message(f"Welcome {client_name}! Chat is now active.")
        elif "left the chat" in message:
            client_name = message.split()[0]
            connected_clients.discard(client_name)
            print(f">>> {client_name} disconnected from server")
        
        # Broadcast to all subscribers
        broadcast_msg = f"[{timestamp}] {message}"
        pub_socket.send_string(broadcast_msg)
        print(f"Relayed: {broadcast_msg}")

# ANCHOR Function to handle server input commands
def server_input():
    while True:
        try:
            server_input_msg = input("SERVER> ").strip()
            
            if server_input_msg.lower() == 'help':
                print("Available commands:")
                print("  help - Show this help")
                print("  status - Show connected clients") 
                print("  announce <message> - Send announcement to all clients")
                print("  Or just type a message to send to clients")
            
            elif server_input_msg.lower() == 'status':
                print(f"Connected clients: {list(connected_clients) if connected_clients else 'None'}")
            
            elif server_input_msg.lower().startswith('announce '):
                announcement = server_input_msg[9:]  # ANCHOR Remove 'announce '
                send_server_message(f"ANNOUNCEMENT: {announcement}")
            
            elif server_input_msg:
                send_server_message(server_input_msg)
                
        except EOFError:
            break
        except KeyboardInterrupt:
            break

# ANCHOR Start message broadcasting in a thread
broadcast_thread = threading.Thread(target=broadcast_message)
broadcast_thread.daemon = True
broadcast_thread.start()

# ANCHOR Start server input handling in a thread
input_thread = threading.Thread(target=server_input)
input_thread.daemon = True
input_thread.start()

# ANCHOR Send initial server message
send_server_message("Chat server is now online! Welcome to the group chat.")

# ANCHOR Keep server running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    send_server_message("Server is shutting down. Goodbye!")
    print("\nShutting down chat server...")