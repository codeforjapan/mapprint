FROM node:14
RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN yarn install
COPY ./ ./
RUN yarn run build && yarn run generate
ENV PORT=5000
EXPOSE 5000
CMD yarn run start
