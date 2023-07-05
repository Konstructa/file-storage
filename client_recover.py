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
