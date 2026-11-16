# Caderno

Blog pessoal sobre programação, feito com [Eleventy](https://www.11ty.dev/),
Markdown e um pouco de CSS. O objetivo é ser um lugar próprio para textos
longos, com tipografia editorial e nenhuma dependência de servidor.

## Requisitos

- Node.js 20 ou superior.
- Nenhum banco de dados, CMS ou serviço externo.

## Rodando localmente

```bash
npm install
npm run dev
```

O site fica em `http://localhost:8080`. O build de produção é:

```bash
npm run build
```

O resultado vai para `_site/`. O comando também roda o
[Pagefind](https://pagefind.app/) para gerar o índice de busca. A busca só
funciona depois de um build; no `dev` ela pode aparecer vazia.

## Estrutura

```
src/
├─ _data/site.js          # nome, URL, links, navegação
├─ _includes/
│  ├─ layouts/            # base, post, page
│  └─ partials/           # head, header, footer, lista de posts
├─ posts/                 # os textos em Markdown
├─ assets/                # CSS, JS e fontes
├─ index.njk              # página inicial
├─ arquivo.njk            # arquivo por ano
├─ tags.njk / tag.njk     # índices de tags
├─ sobre.md / agora.md
├─ busca.njk
├─ feed.njk               # RSS
└─ sitemap.njk / robots.njk
public/                   # arquivos copiados como estão (favicon, og.png, _headers)
scripts/                  # criação de post e validação de conteúdo
```

## Escrevendo um texto

Crie o arquivo com o script:

```bash
npm run new -- "Título do texto"
```

Ele gera `src/posts/AAAA-MM-DD-titulo-do-texto.md`, com o frontmatter básico, e
tenta abrir o arquivo no VS Code. O frontmatter é:

```yaml
---
title: "Título do texto"
description: "Uma frase que resume o texto para busca e compartilhamento."
date: 2026-11-16
tags: ["eleventy", "infra"]
---
```

Campos opcionais:

- `updated: 2026-12-01` — mostra a data de atualização e entra no `lastmod` do
  sitemap.
- `draft: true` — o texto não é publicado.
- `noindex: true` — não entra no sitemap e recebe `noindex`.

Datas no futuro também não são publicadas. O post volta a aparecer no próximo
build depois da data. Se quiser publicação automática, configure um deploy
diário no GitHub Actions chamando o deploy hook do Cloudflare Pages.

Antes de publicar, rode:

```bash
npm run check
```

Ele valida frontmatter, data, descrição e tags, e avisa sobre textos muito
curtos ou nomes de arquivo fora do padrão.

### Convenções de escrita

- O primeiro parágrafo vira a abertura, com corpo maior. Use-o para situar o
  problema, não para aquecer.
- `##` cria seções e alimenta o sumário lateral automaticamente.
- Blocos de código usam cerquilha tripla com a linguagem (`bash`, `js`, `yaml`,
  `ini` etc.). O botão de copiar é injetado pelo JavaScript.
- Tabelas, citações e imagens funcionam como Markdown normal.

Os três textos em `src/posts/` são exemplos. Apague ou substitua quando
começar.

## Personalizando

Quase tudo que é identidade fica em `src/_data/site.js`:

```js
export default {
  title: "Caderno",
  author: "Seu Nome",
  role: "Desenvolvedor de software",
  description: "…",
  url: "https://seudominio.com",
  email: "voce@seudominio.com",
  social: [
    { label: "GitHub", url: "https://github.com/seu-usuario" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/seu-usuario/" },
    { label: "RSS", url: "/feed.xml" },
  ],
  nav: [ … ],
};
```

`site.url` precisa ser o domínio final. Ele é usado em canonical, Open Graph,
RSS e sitemap.

As cores e a tipografia estão em `src/assets/css/main.css`, nos blocos
`:root` (tema escuro) e `[data-theme="light"]` (tema claro). As fontes são
self-hosted: Newsreader para texto e IBM Plex Mono para rótulos e código.

Para regerar a imagem de Open Graph:

```bash
node scripts/make-og.mjs
```

O favicon é um SVG em `public/favicon.svg`.

## Publicando no Cloudflare Pages

1. Crie um repositório no GitHub e faça o push do projeto.
2. No painel da Cloudflare, vá em **Workers & Pages → Create → Pages →
   Connect to Git**.
3. Selecione o repositório.
4. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
   - **Environment variable:** `NODE_VERSION=22`
5. Depois do primeiro deploy, adicione o domínio em **Custom domains**.

O arquivo `public/_headers` já configura cache para fontes e cabeçalhos
básicos de segurança. O Cloudflare Pages lê esse arquivo automaticamente.

## Decisões de design

- **Uma coluna, tipografia primeiro.** O texto usa serifa (Newsreader), os
  metadados usam monoespaçada (IBM Plex Mono). Não há cards, gradientes ou
  ícones decorativos.
- **Escuro por padrão, com tema claro opcional.** A preferência fica no
  `localStorage`; sem JavaScript, o site abre no escuro.
- **Sem backend.** Comentários e newsletter ficaram de fora de propósito. O
  contato é e-mail e LinkedIn.
- **Busca estática.** O Pagefind gera o índice no build e roda no navegador.
- **Sem rastreadores.** Nenhum script de analytics ou cookie de terceiros.

## O que não tem

Não há CMS, comentários, newsletter, banco de dados, autenticação ou funções
de servidor. Se algum dia precisar, o caminho natural é uma função no
Cloudflare Pages, não um servidor no Raspberry Pi.
