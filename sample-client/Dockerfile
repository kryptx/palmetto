FROM node:10-alpine AS base
COPY package.json yarn.lock /
RUN yarn

FROM base AS copy
COPY . /

EXPOSE 3000
CMD node .
