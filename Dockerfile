FROM docker.io/node:lts-jessie AS base
RUN apt-get update
RUN apt-get -y install sendmail
WORKDIR /usr/app

FROM base AS development
RUN npm install -g pm2
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . /usr/app
ENV NODE_ENV=development
RUN chmod -R 775 /usr/app
RUN chown -R node:root /usr/app
EXPOSE 3000
USER node
CMD pm2-runtime ecosystem.config.js