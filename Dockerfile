FROM docker.io/node:10-jessie
RUN apt-get update
RUN apt-get -y install sendmail
WORKDIR /usr/app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . /usr/app
RUN NODE_ENV=development npm run front-end:build
RUN npm run back-end:build
RUN chmod -R 775 /usr/app
RUN chown -R node:root /usr/app
EXPOSE 3000
CMD npm start
