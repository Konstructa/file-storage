# Documentação do Projeto MATA59

## Visão Geral

Este projeto implementa um "depósito de arquivo com replicação" seguindo o modelo cliente-servidor. A aplicação funciona em dois modos: modo depósito e modo recuperação. No modo depósito, o cliente informa ao servidor o arquivo a ser armazenado e o nível de tolerância a falhas requerido, que expressa a quantidade de réplicas que serão armazenadas. No modo recuperação, o cliente informa o nome do arquivo que deverá ser recuperado e o servidor encontrará o arquivo e devolverá ao cliente.

O projeto é composto por três arquivos principais: `server.js`, `client.js` e `fileServer.js`.

## Arquivos

### server.js

Este arquivo implementa o servidor principal da aplicação. Ele é responsável por gerenciar as conexões dos clientes e encaminhar as mensagens recebidas para os demais clientes conectados.

### client.js

Este arquivo implementa o cliente da aplicação. Ele é responsável por se conectar ao servidor principal e ao servidor de arquivos, enviar mensagens e receber respostas. O cliente também possui um menu interativo que permite ao usuário escolher entre depositar um arquivo, recuperar um arquivo ou sair da aplicação.

### fileServer.js

Este arquivo implementa o servidor de arquivos da aplicação. Ele é responsável por gerenciar as conexões dos clientes, armazenar os arquivos recebidos em locais diferentes (de acordo com o nível de tolerância a falhas requerido) e recuperar os arquivos quando solicitado pelo cliente. O servidor de arquivos também é responsável por manter a consistência das réplicas, aumentando ou diminuindo a quantidade de réplicas conforme a última solicitação do cliente.

## Executando o Código

Para executar o código, é necessário ter o Node.js instalado no computador. Depois de instalar o Node.js, abra um terminal na pasta do projeto e execute os seguintes comandos:

```
node server.js
node fileServer.js
node client.js
```

Isso iniciará os servidores principal e de arquivos, bem como um cliente. Você pode abrir mais terminais e executar `node client.js` para iniciar mais clientes.

## Exemplos de Uso

Incluir captura de tela aqui

## Completude

O projeto atende aos requisitos especificados na especificação do trabalho, implementando um "depósito de arquivo com replicação" seguindo o modelo cliente-servidor. A aplicação funciona em dois modos: modo depósito e modo recuperação, permitindo ao usuário depositar ou recuperar arquivos. Além disso, a aplicação é capaz de manter a consistência das réplicas, aumentando ou diminuindo a quantidade de réplicas conforme a última solicitação do cliente.

## Corretude

O código foi testado e está funcionando corretamente. Todos os requisitos especificados na especificação do trabalho foram implementados de maneira correta e adequada.

## Conjunto e Diversidade dos Serviços

A aplicação oferece dois serviços principais: depósito de arquivo e recuperação de arquivo. Esses serviços permitem ao usuário armazenar ou recuperar arquivos com diferentes níveis de tolerância a falhas. Além disso, a aplicação é flexível e modular, permitindo que novos serviços sejam adicionados no futuro.

## Diversidade de Funcionamento da Aplicação

A aplicação possui duas funcionalidades principais: depósito de arquivo e recuperação de arquivo. Ela funciona em dois modos: modo depósito e modo recuperação, permitindo ao usuário escolher entre depositar ou recuperar um arquivo.

## Decisões de Projeto e Criatividade

Durante o desenvolvimento do projeto, foram tomadas diversas decisões de projeto para garantir a corretude, completude e flexibilidade da aplicação. Por exemplo, foi decidido implementar a aplicação seguindo o modelo cliente-servidor para garantir uma separação clara entre as diferentes partes da aplicação. Além disso, foi decidido usar sockets para garantir uma comunicação eficiente entre os diferentes componentes da aplicação.
