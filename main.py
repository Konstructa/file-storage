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
                data = file.read(1024)
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
