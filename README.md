## Description

Dock Digital Account API é uma aplicação NestJS que gerencia contas digitais, permitindo operações como criação de contas, depósitos, saques e consulta de transações. A aplicação utiliza PostgreSQL como banco de dados e autenticação JWT via Amazon Cognito.

## Funcionalidades

Gerenciamento de titulares (cadastro, remoção)
Gerenciamento de contas (criação, consulta, alteração de status)
Transações financeiras (depósito, saque)
Consulta de histórico de transações com filtros
Autenticação JWT com Amazon Cognito

## Pré-requisitos

Node.js (v20.15.0)
PostgreSQL
Amazon Cognito (para autenticação)

## Configuração do Ambiente

1. Banco de Dados PostgreSQL
   É necessário ter um banco de dados PostgreSQL acessível.

   * As credenciais devem ser configuradas no arquivo .env.

2. Configuração do Amazon Cognito
   Esta aplicação utiliza Amazon Cognito para autenticação JWT. É necessário configurar:

3. Variáveis de Ambiente
   Crie um arquivo .env na raiz do projeto com as seguintes variáveis disponíveis em .env.test

# Clonar o repositório

git clone https://github.com/seu-usuario/dock-digital-account.git

# Instalar dependências

npm install

# Compilar a aplicação

npm run build

# Desenvolvimento

npm run start:dev
A API estará disponível em: http://localhost:3000

---

## Documentação da API (Swagger)

A documentação da API estará disponível em: http://localhost:3000/api

---

## Autenticação

Para autenticar requisições, obtenha um token JWT do Cognito:

curl -X POST https://cognito-idp.us-east-2.amazonaws.com/oauth2/token \
 -H "Content-Type: application/x-www-form-urlencoded" \
 -d "grant_type=client_credentials&client_id=4afrig7c2bkv630jrbuvve0mav&client_secret=seu-client-secret&scope=default-m2m-resource-server-dvzxx9/read"

Use o token obtido no header Authorization de todas as requisições:

curl -X GET http://localhost:3000/accounts/123456 \
 -H "Authorization: Bearer seu-token-jwt"

---

** Estrutura do Projeto **

src/
├── accounts/ # Módulo de contas
│ ├── controllers/ # Controladores de contas e transações
│ ├── dtos/ # Objetos de transferência de dados
│ ├── entities/ # Entidades do TypeORM
│ ├── enums/ # Enumerações (status, tipos)
│ ├── interfaces/ # Interfaces para injeção de dependência
│ ├── responses/ # Objetos de resposta
│ └── services/ # Serviços de negócio
├── holders/ # Módulo de titulares
├── auth/ # Configuração de autenticação
├── common/ # Componentes compartilhados
└── test/ # Factories para testes

# Executar todos os testes

npm test

# Executar testes com coverage

npm run test:cov

# Executar testes em modo watch

npm run test:watch

---

# Endpoints

## TITULARES

# POST /holders - Criar um novo titular

curl --location 'http://localhost:3000/holders' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w' \
--data '{
"fullName": "Mariquinha Marques",
"cpf": "22222222227"
}'

# DELETE /holders/:id - Remover um titular

curl --location --request DELETE 'http://localhost:3000/holders/8908a51e-8612-4e6e-ad17-1c8fc5dccb95' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w'

## CONTAS

# POST /accounts - Criar uma conta digital para um titular

curl --location 'http://localhost:3000/accounts' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w' \
--data '{
"cpf": "22222222227"
}'

# GET /accounts/:value - Consultar conta por CPF ou número

curl --location 'http://localhost:3000/accounts/22222222227' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w'

# PATCH /accounts/:accountNumber/status - Atualizar status da conta

curl --location --request PATCH 'http://localhost:3000/accounts/794933/status' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMyMzY4NywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzI3Mjg3LCJpYXQiOjE3NDQzMjM2ODcsInZlcnNpb24iOjIsImp0aSI6IjZiN2I1MGZkLWVlYWMtNGYxYy1hYTY3LWIzZTMwZDhmOGY2MCIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.P5bdbsH6Xpi5JWPgmIiJIwYDxOp9DqmwMMwSfOwtYbNL0cpezBWJUIaflaNMRVHN_bXfXqduuSjn-TYdaR7e05mCh3LWWW1LB6Hk-hM5RIV2WQhx8T8Cy1GAqSwMZM-7RDUliLavfr0nEmXZ1WdJDL5jozmJbroVT6CRj_rn475_gOpje7MFG6bYuhbRo4LVRDwURLv_BAM3HQOxjdov3yfDr1PrDEXn4JmTbngMx2QoAR7NZV9gSyVUuz8pHLhQCfoJziyRAGFBJ51fD5y1caAKj8KureCSsScTXi4Uc9-TefiujCS46UI8p35Px6VL0IqgxwBiZb_itq7qcTA4RQ' \
--data '{
"status": "blocked"
}'

## TRANSAÇÕES/EXTRATO

# POST /accounts/transactions/deposit - Realizar depósito

curl --location 'http://localhost:3000/accounts/transactions/deposit' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w' \
--data '{
"accountNumber": "794933",
"amount": 620.00
}'

# POST /accounts/transactions/withdraw - Realizar saque

curl --location 'http://localhost:3000/accounts/transactions/withdraw' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMwMDg0MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzA0NDQzLCJpYXQiOjE3NDQzMDA4NDMsInZlcnNpb24iOjIsImp0aSI6IjE1MzMzMThhLWNjODAtNDhjNC05NTBmLTMwNWRjMDNmNzUwNiIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.Fxb_kJcRxjmKh3-37cUrewRDX0VDVg3ydnvuCJcnRlPmMwoQqfNUtqX8nDd6YPOjsNkaeyhA7oVX5SagcDUIEfk8pT-UUss8rRDbY-tKlYpLr1ngIoiVtqytksLSOgfU_7DHgQPZGBgqLyn-nq4n4ueV_kLHrSg56cCq2Rd7ZewuWR06jdObH0i9L0ssKCTS6n-PvFkPCa6OuPUDG3iREsdyFnXTOtslht3POwHSZSmVvAIkN0n5egYHXzBnpuE7JSjv2RyZO0CqlUwBAZbsPs50BdShhDGgq-1igwdxYWlrpWR6sPpF1mi88OGAwVAFOWixYebTd_3byoqBB_jL5w' \
--data '{
"accountNumber": "794933",
"amount": 1.00
}'

# GET /accounts/transactions/:accountNumber - Consultar histórico de transações

curl --location 'http://localhost:3000/accounts/transactions/794933?startDate=2024-04-12&endDate=2025-04-31&type=withdrawal' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJraWQiOiIrejVqcUtwYjBUaFJsNzJIMnF6YmQyUWhhS3Q2bm9ua1FOTjBHVlFYamRjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0YWZyaWc3YzJia3Y2MzBqcmJ1dnZlMG1hdiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGVmYXVsdC1tMm0tcmVzb3VyY2Utc2VydmVyLWR2enh4OVwvcmVhZCIsImF1dGhfdGltZSI6MTc0NDMyMzY4NywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfZ0djVUV4clR1IiwiZXhwIjoxNzQ0MzI3Mjg3LCJpYXQiOjE3NDQzMjM2ODcsInZlcnNpb24iOjIsImp0aSI6IjZiN2I1MGZkLWVlYWMtNGYxYy1hYTY3LWIzZTMwZDhmOGY2MCIsImNsaWVudF9pZCI6IjRhZnJpZzdjMmJrdjYzMGpyYnV2dmUwbWF2In0.P5bdbsH6Xpi5JWPgmIiJIwYDxOp9DqmwMMwSfOwtYbNL0cpezBWJUIaflaNMRVHN_bXfXqduuSjn-TYdaR7e05mCh3LWWW1LB6Hk-hM5RIV2WQhx8T8Cy1GAqSwMZM-7RDUliLavfr0nEmXZ1WdJDL5jozmJbroVT6CRj_rn475_gOpje7MFG6bYuhbRo4LVRDwURLv_BAM3HQOxjdov3yfDr1PrDEXn4JmTbngMx2QoAR7NZV9gSyVUuz8pHLhQCfoJziyRAGFBJ51fD5y1caAKj8KureCSsScTXi4Uc9-TefiujCS46UI8p35Px6VL0IqgxwBiZb_itq7qcTA4RQ'

---

## Limites e Restrições

Saque diário máximo: R$ 2.000,00
Uma conta por CPF
Contas fechadas não podem ser bloqueadas
Histórico de transações limitado a 6 meses

## Logging

A aplicação utiliza o sistema de logging do NestJS para registrar eventos importantes:

Informações sobre criação de contas e titulares
Detalhes de transações financeiras
Erros e exceções com stack traces para depuração

## Contato

Para dúvidas ou sugestões, entre em contato pelo e-mail: naomi.moura@icloud.com

# Valores .env

Os valores reais a serem preenchidos no .env foram compartilhados com a Gabriele, para não serem exportos no Github. Por favor, em caso de dúvida entre em contato. 
