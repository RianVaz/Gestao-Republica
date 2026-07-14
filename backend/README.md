# 🏠 Gestão República - Backend

Este é o backend do sistema de Gestão de República, desenvolvido para a disciplina de **Sistemas Web I**. O sistema gerencia moradores, tarefas domésticas, punições, inventário da casa e controle de empréstimos, contando com rotinas automatizadas e regras de negócio inteligentes.

## 🛠️ Tecnologias Utilizadas

* **Node.js** com **Express** (API REST)
* **PostgreSQL** (Banco de Dados Relacional)
* **Prisma ORM** (Modelagem e comunicação com o banco)
* **Node-Cron** (Rotinas automatizadas/Jobs em segundo plano)

## ⚙️ Funcionalidades e Automações

* **CRUD Completo:** Gestão de Membros, Tarefas, Punições, Inventário e Empréstimos.
* **Tarefas Compartilhadas:** Relação N:M permitindo múltiplos responsáveis por uma única tarefa.
* **Automação de Atrasos (Cron Job):** Monitoramento assíncrono que verifica prazos vencidos minuto a minuto, alterando o status da tarefa e gerando punições em lote para os responsáveis automaticamente.
* **Gestão Inteligente de Inventário:** Ao registrar ou devolver um empréstimo, o status do item no inventário (Disponível/Emprestado) é atualizado automaticamente.
* **Segurança e Validação:** Bloqueio de requisições contendo prazos ou previsões de devolução no passado.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js instalado.
* PostgreSQL rodando localmente (recomendado uso do DBeaver para gerenciar os scripts).

### 2. Instalação
Clone o repositório e acesse a pasta do backend. Em seguida, instale as dependências:
```bash
npm install
``` 
### 3. Configuração do Banco de Dados
Crie um arquivo `.env` na raiz da pasta `backend` e configure a sua string de conexão com o PostgreSQL:
```bash
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gestao_republica?schema=public"``` 
```
(Lembre-se de substituir usuario e senha pelas suas credenciais reais).

### 4. Sincronização do Prisma
Como a estrutura das tabelas (incluindo relacionamentos N:M e Enums) foi consolidada no banco, rode os comandos abaixo para o Prisma ler o banco e gerar o Client atualizado:
```bash
npx prisma db pull
npx prisma generate
```

### 5. Iniciando o Servidor
Com tudo configurado, basta iniciar a aplicação. O robô de monitoramento de tarefas (Cron Job) será iniciado automaticamente junto com o servidor.
```bash
node src/app.js
# ou o comando correspondente ao seu script de start, como npm start / npm run dev
```
A API estará rodando e escutando as requisições (por padrão em http://localhost:3001).
