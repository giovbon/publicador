---
title: "Um blog estático é uma decisão de engenharia"
description: "Não é falta de backend. É uma escolha sobre o que eu quero manter."
date: 2026-11-12
tags: ["eleventy", "infra"]
---

A primeira versão deste blog tinha um banco de dados. Não porque eu precisava,
mas porque parecia o jeito "certo" de fazer. Eu queria aprender a montar uma
aplicação completa: servidor, ORM, migrations, painel administrativo. O blog
era o pretexto.

Durou três meses. O que matou o projeto não foi a escrita. Foi a manutenção.

## O problema com o blog dinâmico

Toda aplicação tem um custo fixo que não aparece no começo: atualizar
dependências, acompanhar falhas de segurança, fazer backup do banco, lidar com
migrações que quebram em produção. Para um sistema que serve algumas dezenas
de leitores por dia, esse custo é desproporcional.

O pior sintoma foi o mais banal: eu deixava de escrever porque abrir o editor
implicava decidir se o servidor estava saudável. Um blog que depende de um
processo vivo para existir compete com a energia que deveria ir para o texto.

## O que o estático resolve

Um gerador estático transforma Markdown em HTML no momento do build. O
resultado é um punhado de arquivos que qualquer CDN serve. Não há processo
rodando, não há banco para consultar, não há sessão para expirar.

Isso muda a natureza do problema:

- O conteúdo é versionado junto com o código. Um `git log` conta a história do
  blog.
- O deploy é atômico. Ou a versão nova está no ar, ou a antiga continua.
- O custo de leitura é próximo de zero. O Cloudflare Pages serve o site inteiro
  de borda, e o Raspberry Pi não participa do caminho crítico.
- Não existe superfície de ataque. Não há login, formulário ou endpoint para
  alguém escanear.

O [Eleventy](https://www.11ty.dev/) foi a escolha por um motivo específico: ele
não tenta ser um framework de aplicação. Eu escrevo HTML e Nunjucks, o Markdown
vira HTML, e o build termina. A previsibilidade vale mais do que a abstração.

## O que eu perco

Não vou fingir que é tudo ganho. Perco comentários nativos, busca em tempo real
e a possibilidade de publicar pelo navegador sem um intermediário. Para o meu
caso, nenhum desses itens justifica um servidor.

Comentários viraram conversa no LinkedIn e no e-mail. Busca é resolvida no
build, com o [Pagefind](https://pagefind.app/), que gera um índice estático e
roda inteiramente no navegador. Publicar pelo navegador é o único ponto que
sinto falta de vez em quando; o GitHub resolve em emergências.

## O que fica no Raspberry Pi

O Pi não serve o blog. Ele fica com o que é chato e útil: analytics
auto-hospedado, monitoramento e um ambiente de staging. Se ele cair, o blog
continua no ar. Essa separação é intencional — o leitor não deveria depender da
minha rede doméstica.

Também uso o Pi para testar o próprio build. É uma máquina modesta, e isso
funciona como um teste de frugalidade: se o site não builda rápido ali, alguma
coisa está pesada demais.

## O detalhe do agendamento

Uma coisa que o estático não resolve sozinho é publicar no futuro. O arquivo
pode ter uma data futura, mas o build só acontece quando alguém faz push. Eu
resolvi com uma checagem no diretório de posts:

```js
export default {
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => {
      if (data.draft) return false;
      if (data.page.date > new Date()) return false;
      return `/blog/${data.page.fileSlug}/`;
    },
  },
};
```

O post simplesmente não é gerado até a data chegar. Para ele aparecer sozinho,
basta um deploy diário agendado no GitHub Actions. É uma linha de cron, não um
serviço.

No fim, a decisão não foi "estático é melhor". Foi "eu quero gastar minha
energia escrevendo, não operando". Para um blog pessoal, essa é a troca que
faz sentido.
