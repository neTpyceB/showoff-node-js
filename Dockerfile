FROM mirror.gcr.io/library/node:24.14.1-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

FROM deps AS test
COPY . .
CMD ["npm", "run", "check:container"]

FROM mirror.gcr.io/library/node:24.14.1-alpine3.22 AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src
COPY scripts ./scripts
EXPOSE 3000
CMD ["npm", "start"]
