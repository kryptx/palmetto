FROM node:10-alpine AS base
MAINTAINER kryptx@gmail.com

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

COPY package.json yarn.lock /
RUN yarn

FROM base AS copy
COPY . /

EXPOSE 3000
CMD node .
