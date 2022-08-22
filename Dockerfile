FROM arm32v7/node:18-alpine
# FROM node:18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY out/ .
COPY package.json .
COPY package-lock.json .
RUN npm i
RUN chown -R node /usr/src/app
RUN mkdir /data
RUN chown -R node /data
USER node
CMD ["node", "index.js"]
