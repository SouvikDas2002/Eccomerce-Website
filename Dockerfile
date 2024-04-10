FROM node:21-alpine3.18
RUN mkdir -p /home/app
WORKDIR /home/app
COPY ./server.js /home/app/
COPY package.json /home/app/
RUN npm install
CMD [ "node","server.js" ]