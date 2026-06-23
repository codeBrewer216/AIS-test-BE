# # Base image
# FROM node:24-alpine

# # Create app directory
# WORKDIR /usr/src/app

# # A wildcard is used to ensure both package.json AND package-lock.json are copied
# COPY package*.json ./

# # Install app dependencies
# RUN npm install

# # Bundle app source
# COPY . .

# # Creates a "dist" folder with the production build
# RUN npm run build

# EXPOSE 8000
# # Start the server using the production build
# CMD [ "node", "dist/main.js" ]
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY dist ./dist

EXPOSE 8000

CMD ["node", "dist/main.js"]