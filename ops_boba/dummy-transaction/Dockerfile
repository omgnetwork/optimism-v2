FROM bobanetwork/builder:latest AS builder
FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

COPY --from=builder /optimism/packages/boba/contracts/artifacts ./artifacts

# Install app dependencies
# Wildcard is used to ensure both package and package lock JSON are copied
COPY package*.json ./

RUN npm ci

COPY . .
COPY entrypoint.sh /usr/local/bin/

RUN chmod 755 /usr/src/app
RUN chmod 755 /usr/local/bin/entrypoint.sh

CMD [ "entrypoint.sh" ]
