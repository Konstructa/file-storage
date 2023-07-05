import socket
import threading
import os

# Dicionário para armazenar os arquivos e suas réplicas
arquivos_replicas = {}

def handle_client(connection):
    while True:
        data = connection.recv(1024).decode()
        if not data:
            break
        elif data.startswith("UPLOAD"):
            filename, tolerance = data.split()[1:]
            upload_file(connection, filename, int(tolerance))
        elif data.startswith("EXIT"):
            connection.close()
            return

def upload_file(connection, filename, tolerance):
    # Verifica se o arquivo já existe no servidor
    if filename in arquivos_replicas:
        # Verifica se o número de réplicas precisa ser ajustado
        if tolerance != len(arquivos_replicas[filename]):
            adjust_replicas(filename, tolerance)
    else:
        arquivos_replicas[filename] = []

    # Salva a cópia do arquivo em um local (aqui é usado apenas o nome do arquivo como identificador)
    filepath = os.path.join("replicas", filename)
    with open(filepath, "wb") as file:
        while True:
            data = connection.recv(1024)
            if not data:
                break
            file.write(data)

    # Adiciona o local da réplica ao dicionário
    arquivos_replicas[filename].append(filepath)
    print(f"Arquivo '{filename}' armazenado com {len(arquivos_replicas[filename])} réplicas.")

def adjust_replicas(filename, tolerance):
    replicas = arquivos_replicas[filename]

    if tolerance > len(replicas):
        # Adiciona réplicas
        while len(replicas) < tolerance:
            filepath = os.path.join("replicas", filename)
            with open(filepath, "wb") as file:
                file.write(open(replicas[0], "rb").read())
            replicas.append(filepath)
            print(f"Réplica adicionada para o arquivo '{filename}'. Total: {len(replicas)}")
    elif tolerance < len(replicas):
        # Remove réplicas
        while len(replicas) > tolerance:
            filepath = replicas.pop()
            os.remove(filepath)
            print(f"Réplica removida para o arquivo '{filename}'. Total: {len(replicas)}")

def start_server():
    host = "127.0.0.1"
    port = 8888

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)

    print(f"Servidor iniciado. Aguardando conexões em {host}:{port}...")

    while True:
        connection, address = server_socket.accept()
        print(f"Conexão estabelecida com {address[0]}:{address[1]}")
        threading.Thread(target=handle_client, args=(connection,)).start()

start_server()
