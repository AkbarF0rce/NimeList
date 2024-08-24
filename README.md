<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NimeList is a web-based application for managing anime lists. This project was developed using NestJS and is designed to make it easier for users to search, manage, and review anime.

## Step 1 -- Instalation Dependecies

```bash
npm install
```

## Step 2 -- Configuration

```bash
# Copy the .env.example file to .env
cp .env.example .env
```

## Step 3 -- How to Use

```bash
# Run the App
npm run start:dev

# Access the app in the browser via
http://localhost:3000
```

## Api Endpoints

Here are some of the main temporary endpoints available in this application:

• Anime:
  • GET /anime/get/id: Get a list of anime details by ID.
  • POST /anime/post: Adding new anime.
  • PUT /anime/update/:id: Update anime data.

• Genre:
  • POST /genre/post: Adding new genre.
  • DELETE /genre/delete/:id: Delete genre data.

• Review:
  • POST /review/post: Adding new review.
  • GET /review/get: Get all the review lists.
  • GET /review/get/:id: Get a list of reviews by ID.
  • PUT /review/update/:id: Update review data.
  • DELETEE /review/delete/:id: Delete review data.

• Photo_anime:
  • PUT photo-anime/update/:id: Update data photo anime.
  • DELETE photo-anime/delete/:id: Delete data photo anime.

## Project Developer

- Backend - Akbar Ridho Arrafi
- Frontend - Fadlan Hamsyari P

## License
