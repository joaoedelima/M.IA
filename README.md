# M.IA Studio

Plataforma web completa para edição visual e por código de conteúdo HTML5/CSS/JS com geração para múltiplos formatos.

## Entregas atuais

- Editor visual (WYSIWYG) + editor de código (HTML/CSS/JS).
- Biblioteca de blocos reutilizáveis (Hero, Card, FAQ, Footer, etc.).
- Templates iniciais (Landing e Newsletter).
- Preview responsivo com dispositivos (desktop/tablet/mobile).
- Auto-save em localStorage e restauração automática de sessão.
- Metadados de projeto (nome e tags).
- Importação HTML, importação/exportação de projeto JSON.
- Exportação para HTML, Email HTML (com inline CSS básico), PDF (print) e PPT outline (.txt).
- Módulos de otimização: análise SEO, acessibilidade e compatibilidade de email.
- Histórico com undo/redo para edição mais segura.

---

## Como executar (completo)

### 1) Pré-requisitos

- Node.js 18+ (recomendado 20)
- Git

### 2) Clonar o projeto

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
```

### 3) Executar localmente (produção simulada)

```bash
npm start
```

Abra: `http://localhost:3000`

### 4) Executar localmente (modo rápido dev)

```bash
npm run dev
```

Abra: `http://localhost:5173`

### 5) Checks de qualidade

```bash
make check
# ou
node --check app.js
node --check server.js
```

---

## Executar com Docker

### Build da imagem

```bash
make docker-build
# equivalente: docker build -t mia-studio:latest .
```

### Rodar container

```bash
make docker-run
# equivalente: docker run --rm -p 3000:3000 mia-studio:latest
```

Abra: `http://localhost:3000`

---

## Publicar online no GitHub Pages (automático)

1. Suba o projeto para o branch `main`.
2. O workflow `.github/workflows/deploy-pages.yml` fará o deploy automático.
3. No GitHub, habilite **Settings → Pages → Build and deployment → GitHub Actions**.
4. A URL pública ficará disponível no painel do workflow após o deploy.

## Publicar no GitHub (primeiro push)

```bash
git init
git add .
git commit -m "Initial complete M.IA Studio"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

---

## CI incluído

- Workflow `.github/workflows/ci.yml` valida sintaxe JavaScript em push/PR.

## Próximos upgrades para nível enterprise

- Exportação real `.pptx` e `.pdf` com pixel-perfect.
- Compatibilidade avançada entre clientes de email (Outlook/Gmail/Apple Mail).
- Colaboração em tempo real com comentários e aprovação.
- Versionamento visual por snapshot e rollback.
- IA para geração de layout, texto, SEO e acessibilidade.
