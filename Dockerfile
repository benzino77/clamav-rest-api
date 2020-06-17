FROM node:12.16.3-stretch-slim

LABEL maintainer="Piotr Antczak <antczak.piotr@gmail.com>"

COPY src /clamav-rest-api/src/
COPY package.json package-lock.json /clamav-rest-api/

RUN cd /clamav-rest-api && \
    npm install --production && \
    chown -R node:node /clamav-rest-api

USER node:node
WORKDIR /clamav-rest-api
ENTRYPOINT ["npm", "start"]