FROM arm32v7/node:lts-alpine
# FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY out/ .
COPY node_modules/ node_modules/
RUN chown -R node /usr/src/app
USER node
CMD ["node", "src/index.js"]
