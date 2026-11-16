---
title: "Cloudflare Tunnel: expondo o Raspberry Pi sem abrir portas"
description: "Como colocar serviços caseiros na internet sem IP fixo, DDNS ou redirecionamento de porta."
date: 2026-11-05
tags: ["infra", "raspberry-pi"]
---

O jeito tradicional de expor um serviço caseiro é redirecionar uma porta no
roteador e torcer para o IP não mudar. Funciona até o dia em que o provedor
troca o endereço, o CGNAT entra no caminho ou você percebe que acabou de
publicar um painel administrativo sem senha na internet.

O Cloudflare Tunnel resolve isso de outro jeito: em vez de esperar conexões
entrando, a máquina abre uma conexão de saída para a Cloudflare. O tráfego
público chega na borda e desce por esse túnel. Não há porta aberta, não há IP
fixo, não há DDNS.

## O que você precisa

- Um domínio com DNS gerenciado pela Cloudflare.
- `cloudflared` instalado na máquina que vai expor o serviço.
- Um serviço local rodando em `localhost`.

No Raspberry Pi, a instalação é direta:

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
```

Se o seu Pi for 32 bits, troque `arm64` por `armhf`. Vale conferir a
arquitetura com `uname -m` antes.

## Criando o túnel

O login abre o navegador e grava um certificado local. Em uma máquina sem
interface gráfica, ele imprime uma URL para você abrir em outro computador.

```bash
cloudflared tunnel login
cloudflared tunnel create blog
```

O comando `create` gera um UUID e um arquivo de credenciais em
`~/.cloudflared/`. Guarde esse arquivo: ele é a identidade do túnel. Não
commite, não cole em issue, não deixe em pasta sincronizada.

Depois, associe um hostname ao túnel:

```bash
cloudflared tunnel route dns blog blog.seudominio.com
```

Isso cria o registro CNAME no DNS da Cloudflare. A partir daqui, o túnel já
sabe para onde mandar o tráfego, mas ainda falta dizer qual serviço local
responde.

## Configuração

O arquivo `~/.cloudflared/config.yml` concentra as regras:

```yaml
tunnel: SEU-UUID-AQUI
credentials-file: /home/pi/.cloudflared/SEU-UUID-AQUI.json

ingress:
  - hostname: blog.seudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

A última regra é obrigatória: o Cloudflare Tunnel exige um fallback. Sem ela,
o processo recusa iniciar. Um `http_status:404` é o suficiente para não vazar
rotas não configuradas.

Teste em primeiro plano antes de virar serviço:

```bash
cloudflared tunnel run blog
```

Se o site abrir no domínio, o difícil já passou.

## Rodando como serviço

Para sobreviver a reinicializações, use o systemd. O instalador do
`cloudflared` já traz um serviço pronto, mas eu prefiro um unit explícito para
saber exatamente o que está rodando:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

[Service]
User=pi
ExecStart=/usr/local/bin/cloudflared tunnel run blog
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Salve em `/etc/systemd/system/cloudflared-blog.service`, recarregue e ative:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-blog
sudo systemctl status cloudflared-blog
```

Se algo falhar, `journalctl -u cloudflared-blog -f` mostra o motivo em tempo
real. Na maioria das vezes é caminho errado no `config.yml` ou credencial
ausente.

## O que não fazer

O túnel remove a necessidade de abrir portas, mas não remove a necessidade de
autenticação. Um painel de administração exposto continua sendo um painel de
administração exposto.

Para rotas sensíveis, coloque o [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
na frente. Ele exige login antes de o tráfego chegar ao Pi, e a política pode
ser tão simples quanto "só o meu e-mail". Para o blog em si, acesso público
está ótimo. Para o Umami, o Portainer ou qualquer coisa com botão de deletar,
não.

Também vale lembrar que o túnel não é um backup. Se o Pi desligar, o serviço
sai do ar. A vantagem é que o blog estático não depende dele: só os serviços
auxiliares. Essa separação é o que torna a brincadeira sustentável.
