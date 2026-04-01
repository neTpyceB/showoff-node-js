FROM node:24.14.1-alpine3.22 AS deps
WORKDIR /opt/file-manager
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM deps AS test
COPY . .
CMD ["npm", "run", "check"]

FROM node:24.14.1-alpine3.22 AS runtime
WORKDIR /workspace
COPY src /opt/file-manager/src
CMD ["node", "/opt/file-manager/src/cli.js"]
