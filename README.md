# Produção Frontend

Interface web do sistema de controle de produção industrial, desenvolvida em **Angular 17** com **Angular Material** e **Tailwind CSS**. Comunica-se com o backend via REST e WebSocket (STOMP/SockJS) para monitoramento em tempo real.

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Angular | 17 |
| Angular Material | 17 |
| Tailwind CSS | 3 |
| TypeScript | 5.4 |
| RxJS | 7.8 |
| STOMP.js + SockJS | 7 / 1.6 |

---

## Pré-requisitos

- Node.js 20+
- Angular CLI 17+
- Backend rodando em `http://localhost:8080`

---

## Instalação e execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
# Acesse http://localhost:4200
```

### Build de produção

```bash
npm run build
# Arquivos gerados em dist/
```

### Testes

```bash
npm test
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── core/                        # Lógica central reutilizável
│   │   ├── autenticacao/
│   │   │   ├── guards/              # autenticacaoGuard, guardPerfilAcesso
│   │   │   ├── interceptors/        # JWT e tratamento de erros HTTP
│   │   │   └── servicos/            # Serviço de autenticação
│   │   └── modelos/                 # Modelos compartilhados (ex: perfil-usuario)
│   ├── features/                    # Módulos de funcionalidade (lazy loaded)
│   │   ├── autenticacao/            # Tela de login
│   │   ├── ordens-producao/         # CRUD de ordens, registro de lotes
│   │   ├── monitoramento/           # Dashboard de máquinas em tempo real
│   │   ├── inventario/              # Consulta de saldo e gestão de insumos
│   │   └── usuarios/                # Gestão de usuários
│   └── shared/                      # Componentes, diretivas e pipes reutilizáveis
│       ├── componentes/             # Modal de confirmação, indicador de status, etc.
│       ├── diretivas/               # tamanho-toque (acessibilidade mobile)
│       └── pipes/
├── environments/
│   ├── environment.ts               # Desenvolvimento (localhost)
│   └── environment.prod.ts          # Produção
└── styles.scss                      # Estilos globais
```

---

## Módulos / Rotas

| Rota | Descrição | Perfis com acesso |
|---|---|---|
| `/login` | Autenticação JWT | Público |
| `/ordens` | Lista, criação e detalhes de ordens de produção | OPERADOR, GESTOR, ADMINISTRADOR |
| `/monitoramento` | Dashboard de status das máquinas em tempo real | OPERADOR, GESTOR, ADMINISTRADOR |
| `/inventario` | Consulta de saldo e gerenciamento de insumos | GESTOR, ADMINISTRADOR |
| `/usuarios` | Gerenciamento de usuários do sistema | GESTOR, ADMINISTRADOR |
| `/acesso-negado` | Página de acesso negado | Público |

---

## Perfis de acesso

- **OPERADOR** — Acessa ordens e monitoramento
- **GESTOR** — Acesso completo exceto administração de sistema
- **ADMINISTRADOR** — Acesso total

O controle de acesso é feito via `autenticacaoGuard` (verifica token JWT) e `guardPerfilAcesso` (verifica o perfil do usuário).

---

## Variáveis de ambiente

Arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  producao: false,
  urlApi: 'http://localhost:8080/api',
  urlWebSocket: 'ws://localhost:8080/api/ws',
  intervaloPollingMs: 5000,
  maxTentativasRetry: 3,
};
```

Para produção, configure `src/environments/environment.prod.ts` com as URLs do servidor.

---

## Comunicação em tempo real

O módulo de **monitoramento** utiliza WebSocket via STOMP sobre SockJS para receber atualizações de status das máquinas sem necessidade de polling manual. A reconexão automática é gerenciada pelo serviço de monitoramento com base em `maxTentativasRetry`.

---

## Padrões adotados

- **Lazy loading** em todos os módulos de features
- **Standalone components** (Angular 17)
- **Interceptors** para injeção automática do token JWT e tratamento centralizado de erros HTTP
- **Estado local** por feature (sem biblioteca de state management externa)
- **Tailwind CSS** com paleta de cores customizada (`fabrica-verde`, `fabrica-azul`, etc.)
