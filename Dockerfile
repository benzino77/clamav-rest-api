FROM node:12.16.3-buster-slim

LABEL maintainer="Piotr Antczak <antczak.piotr@gmail.com>"
WORKDIR /clamav-rest-api

COPY src ./src/
COPY package.json package-lock.json ./

RUN  apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y apt-utils wait-for-it && \
    npm install --production && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    chown -R node:node ./

USER node:node
CMD ["npm", "start"]