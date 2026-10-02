# StudyFlow

Plataforma de organização e produtividade para estudantes — protótipo funcional **100 % estático** (HTML + CSS + JavaScript, sem build, sem dependências, sem backend).

## Estrutura

```text
StudyFlow/
├── index.html  pricing.html  about.html  contact.html  terms.html  privacy.html   (público)
├── login.html  register.html                                                      (autenticação)
├── dashboard.html  calendar.html  tasks.html  subjects.html  study-plans.html
├── timer.html  goals.html  progress.html  focus.html  reminders.html
├── profile.html  settings.html                                                    (área do estudante)
├── admin.html  admin-users.html  admin-ai.html  admin-finance.html  admin-expenses.html  (administração)
├── 404.html            página de erro (usada automaticamente pelo GitHub Pages e Netlify)
├── css/style.css       estilos partilhados
├── js/main.js          núcleo: armazenamento, autenticação, layout, modais, CRUD
├── js/pages.js         lógica de cada página
├── assets/images/      favicon.svg, hero.svg
├── netlify.toml        configuração do Netlify (cabeçalhos de segurança)
└── .nojekyll           impede o GitHub Pages de processar o site com Jekyll
```

Todos os caminhos são **relativos** (ex.: `css/style.css`, `dashboard.html`), por isso o site funciona na raiz de um domínio e também em subpastas, como `utilizador.github.io/studyflow/`.

## Executar localmente

Abre `index.html` no browser. Se preferires um servidor local:

```bash
python3 -m http.server 8000     # depois abre http://localhost:8000
```

## Publicar no GitHub Pages

1. Cria um repositório no GitHub (por exemplo `studyflow`) e envia **o conteúdo desta pasta** para a raiz do repositório (o `index.html` tem de ficar na raiz):
   ```bash
   git init && git add . && git commit -m "StudyFlow"
   git branch -M main
   git remote add origin https://github.com/O_TEU_UTILIZADOR/studyflow.git
   git push -u origin main
   ```
2. No repositório: **Settings → Pages**.
3. Em **Build and deployment**, escolhe **Source: Deploy from a branch**, branch **main**, pasta **/ (root)**, e guarda.
4. Aguarda cerca de um minuto. O site fica em `https://O_TEU_UTILIZADOR.github.io/studyflow/`.

## Publicar no Netlify

**Opção A — arrastar e largar (mais rápida):** em [app.netlify.com/drop](https://app.netlify.com/drop), arrasta a pasta `StudyFlow` (a que contém `index.html`).

**Opção B — ligada ao GitHub:** *Add new site → Import an existing project*, escolhe o repositório. Deixa **Build command** vazio e **Publish directory** como `.` (o `netlify.toml` já o define). Cada `git push` atualiza o site.

Para usar o teu próprio domínio, vai a **Domain management** (Netlify) ou **Settings → Pages → Custom domain** (GitHub).

## Checklist antes de divulgar

- [ ] **Imagem do hero:** o fundo atual é uma ilustração (`assets/images/hero.svg`). Para usar uma foto de estudante, guarda-a em `assets/images/` e altera `hero.svg` para o nome do teu ficheiro na regra `.hero` de `css/style.css`.
- [ ] **Conta de demonstração:** o administrador `admin@studyflow.pt` / `admin123` é criado automaticamente e a página de login mostra essas credenciais. Num site público, remove essa linha de `js/pages.js` (página `login`) e a criação do admin em `seed()` (`js/main.js`).
- [ ] **Termos e privacidade:** `terms.html` e `privacy.html` têm texto provisório — substitui por texto legal real.
- [ ] Testa o fluxo completo no endereço publicado: registo → dashboard → criar tarefa → temporizador → logout.

## Limitações (é um protótipo frontend)

- **Os dados ficam no `localStorage` do browser de cada pessoa.** Não são partilhados entre dispositivos nem visíveis para o administrador: o painel de admin mostra dados fictícios mais as contas criadas *no mesmo browser*.
- **A autenticação não é segura.** Qualquer pessoa com acesso às ferramentas do browser pode ler ou alterar os dados, incluindo tornar-se "admin". Não uses dados reais.
- Pagamentos, e-mails de recuperação de palavra-passe, formulário de contactos e métricas de IA são simulados. Os pontos onde ligar um backend/API estão marcados com `BACKEND:` em `js/main.js` e `js/pages.js` (autenticação, subscrições, contactos, IA).
- Para um produto real é preciso um backend (autenticação com palavras-passe com hash no servidor, base de dados e pagamentos, por exemplo com Stripe).
