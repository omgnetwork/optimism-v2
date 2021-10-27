FROM omgx/builder AS omgx_builder
FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

COPY --from=omgx_builder /optimism/packages/omgx/contracts/artifacts ./artifacts
COPY --from=omgx_builder /optimism/packages/omgx/contracts/artifacts-ovm ./artifacts-ovm

# Install app dependencies
# Wildcard is used to ensure both package and package lock JSON are copied
COPY package*.json ./

RUN npm ci

COPY . .
COPY entrypoint.sh /usr/local/bin/

RUN chmod 755 /usr/src/app
RUN chmod 755 /usr/local/bin/entrypoint.sh

CMD [ "entrypoint.sh" ]
