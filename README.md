Aqui está um exemplo de código Python que implementa um "depósito de arquivo com replicação" usando sockets:

Servidor (modo depósito):

```python
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
```

Cliente (modo depósito):

```python
import socket

def upload_file(filename, tolerance):
    host = "127.0.0.1"
    port = 8888

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((host, port))

        # Envia comando de upload para o servidor
        client_socket.send(f"UPLOAD {filename} {tolerance}".encode())

        # Envia o arquivo para o servidor
        with open(filename, "rb") as file:
            while True:
                data = file.read(102

4)
                if not data:
                    break
                client_socket.send(data)

        print(f"Arquivo '{filename}' enviado para o servidor com tolerância de {tolerance}.")

def main():
    filename = input("Digite o nome do arquivo a ser enviado: ")
    tolerance = int(input("Digite a tolerância a falhas requerida: "))
    upload_file(filename, tolerance)

if __name__ == "__main__":
    main()
```

Cliente (modo recuperação):

```python
import socket

def download_file(filename):
    host = "127.0.0.1"
    port = 8888

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client_socket:
        client_socket.connect((host, port))

        # Envia comando de recuperação para o servidor
        client_socket.send(f"DOWNLOAD {filename}".encode())

        # Recebe o arquivo do servidor
        filepath = f"downloaded_{filename}"
        with open(filepath, "wb") as file:
            while True:
                data = client_socket.recv(1024)
                if not data:
                    break
                file.write(data)

        print(f"Arquivo '{filename}' recuperado e salvo como '{filepath}'.")

def main():
    filename = input("Digite o nome do arquivo a ser recuperado: ")
    download_file(filename)

if __name__ == "__main__":
    main()
```

Certifique-se de criar uma pasta chamada "replicas" no mesmo diretório dos arquivos de código para armazenar as réplicas dos arquivos no servidor.

Essa implementação usa o protocolo TCP para a comunicação entre o cliente e o servidor. O servidor mantém um dicionário para rastrear as réplicas dos arquivos e faz ajustes conforme solicitado pelo cliente. O cliente pode fazer o upload de um arquivo para o servidor especificando o nome do arquivo e a tolerância a falhas requerida. O cliente também pode recuperar um arquivo do servidor especificando apenas o nome do arquivo.
