FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY index.html app.js styles.css server.js README.md ./
EXPOSE 3000
CMD ["npm", "start"]
