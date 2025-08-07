# Geo Finder

Um clone do GeoGuessr desenvolvido com JavaScript/Node.js.

## Funcionalidades

- Visualização de locais aleatórios usando Google Street View
- Sistema de pontuação baseado na distância entre o palpite e a localização real
- Interface amigável e responsiva
- Múltiplos rounds de jogo

## Requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Chave de API do Google Maps/Street View

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo `.env` na raiz do projeto e adicione sua chave de API do Google:
```
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```
4. Inicie o servidor:
```bash
npm run dev
```

## Como Jogar

1. O jogo mostrará uma localização aleatória do Google Street View
2. Use o mapa para marcar onde você acha que está
3. Após fazer seu palpite, você verá a distância real e ganhará pontos baseado na precisão
4. Jogue quantos rounds quiser e tente conseguir a maior pontuação possível!

## Tecnologias Utilizadas

- Node.js
- Express
- Google Maps API
- HTML5/CSS3
- JavaScript 