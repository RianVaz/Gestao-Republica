# **CSI606-2026-01 - Remoto - Trabalho Final - Resultados**

## *Discente: Rian Vaz Maurício*

### Resumo

O projeto Gestão República é uma aplicação web desenvolvida para facilitar, centralizar e organizar a administração de repúblicas estudantis. O sistema resolve o problema clássico da convivência em moradias compartilhadas, oferecendo ferramentas para o controle de moradores, distribuição e monitoramento de tarefas domésticas, aplicação de punições, gestão do inventário da casa e controle de itens emprestados. A plataforma conta com um painel de visão geral (Dashboard) dinâmico e um sistema de autenticação seguro, garantindo que cada morador acesse e gerencie apenas as suas próprias pendências.

### 1. Tecnologias utilizadas - Backend e Frontend

**Backend:**

* **Node.js com Express:** Criação da API RESTful para comunicação com o frontend.
* **Prisma (ORM):** Modelagem do banco de dados, tipagem e execução de queries de forma segura e estruturada.
* **PostgreSQL:** Banco de dados relacional escolhido para armazenar as informações da república.
* **Bcrypt:** Biblioteca utilizada para o hash e criptografia das senhas dos moradores.
* **JSON Web Token (JWT):** Implementação de tokens de autenticação para controle de sessões e segurança das rotas.

**Frontend:**

* **React.js (com Vite):** Construção da interface de usuário reativa, utilizando a inicialização rápida do Vite.
* **Tailwind CSS:** Framework utilitário de CSS para estilização ágil, padronizada e responsiva de toda a interface.
* **Lucide React:** Biblioteca de ícones modernos para a iconografia do sistema.
* **Context API:** Gerenciamento de estado global da aplicação (como o AuthContext para manter os dados do usuário logado).

### 2. Funcionalidades implementadas

* **Autenticação e Segurança:** Sistema de Login protegido com criptografia. Geração de token JWT e tela de perfil para que o próprio morador possa alterar sua senha de forma autônoma e segura.

* **Dashboard Dinâmico (Visão Geral):** Painel que carrega informações em tempo real baseadas no usuário logado, exibindo um resumo da casa (moradores ativos) e estatísticas pessoais (tarefas pendentes, punições e itens emprestados).

* **Gestão de Moradores:** CRUD completo de membros, incluindo definição de hierarquia (Bixo, Morador, etc.), status e controle de entrada/saída.

* **Gestão de Tarefas:** Criação de tarefas com atribuição de responsáveis, definição de prazos e controle de status (Pendente, Em Andamento, Concluída, Atrasada).

* **Gestão de Punições:** Sistema para registro de advertências e multas aplicadas aos moradores.

* **Inventário e Empréstimos:** Controle de patrimônio da casa e rastreamento de itens que estão emprestados, com registro de datas de saída e devolução.
  
### 3. Funcionalidades previstas e não implementadas
**Módulo Financeiro (Contas a Pagar):** A ideia inicial previa um rateio automático de contas de água, luz e internet entre os moradores ativos, mas a funcionalidade foi postergada para focar na estabilidade do módulo de tarefas e convivência.

****Notificações por Email/WhatsApp:** O envio de alertas automáticos para tarefas atrasadas não foi implementado nesta versão devido à complexidade de integração com APIs externas de mensagem.

### 4. Outras funcionalidades implementadas
**Autenticação Segura e Sessões:** Implementação de um sistema robusto de login de usuários, utilizando criptografia (bcrypt) para proteção das senhas no banco de dados e controle de sessões seguro com validação via JSON Web Token (JWT).

**Cronjob de Verificação de Prazos:** Criação de uma rotina automatizada (cronjob) no backend que roda em intervalos definidos para monitorar os prazos das tarefas. Caso a data limite seja excedida sem que a tarefa tenha sido finalizada, o sistema atualiza automaticamente o status dela para "Atrasada".

### 5. Principais desafios e dificuldades
**Curva de Aprendizado no Frontend:** Como o meu foco principal de atuação sempre foi o backend, construir a interface com React e, principalmente, realizar a estilização e customização visual utilizando o Tailwind CSS representaram um desafio. Foi necessário um esforço ativo para me adaptar à sintaxe das classes utilitárias e criar um design responsivo e agradável do zero.

**Gestão de Tempo e Concorrência de Demandas:** O período de desenvolvimento do trabalho final coincidiu com uma fase de alta demanda profissional no meu estágio, somado a carga pesada de outras disciplinas. Isso restringiu severamente a minha janela de disponibilidade para o projeto.

### 6. Instruções para instalação e execução

**Pré-requisitos:**
* **Node.js** instalado na máquina.
* **Docker** e **Docker Compose** instalados (para execução do banco de dados).

**Passo 1: Subindo o Banco de Dados com Docker**
1. Na raiz do projeto (onde se encontra o arquivo `docker-compose.yml`), abra o terminal.
2. Execute o comando para baixar e iniciar a imagem do PostgreSQL em segundo plano:
   ```bash
   sudo docker compose start
   ```

**Passo 2: Configuração e Execução do Backend**
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz da pasta `backend` contendo as variáveis de ambiente necessárias (como a `DATABASE_URL` apontando para o Postgres do Docker).
4. Atualize o esquema do banco de dados utilizando o Prisma:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Inicie o servidor da API:
   ```bash
   npm start
   ```
   *O servidor rodará por padrão na porta 3001.*

**Passo 3: Configuração e Execução do Frontend**
1. Abra um novo terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação no navegador (geralmente em `http://localhost:5173`).



### 7. Referências
**VITE. Vite Documentation.** Disponível em: https://vitejs.dev/. Acesso em: jul. 2026.

**PRISMA. Prisma Documentation.** Disponível em: https://www.prisma.io/docs. Acesso em: jul. 2026.

**REACT. React Documentation.** Disponível em: https://react.dev/. Acesso em: jul. 2026.

**TAILWIND LABS. Tailwind CSS Documentation.** Disponível em: https://tailwindcss.com/docs. Acesso em: jul. 2026.