FROM node:24.14.1-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS test
COPY . .
CMD ["npm", "run", "check"]

FROM node:24.14.1-alpine3.22 AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
