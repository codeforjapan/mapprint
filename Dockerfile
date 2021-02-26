FROM node:14
RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY ./ ./
RUN npm run build && npm run generate
ENV PORT=5000
EXPOSE 5000
CMD npm run start
