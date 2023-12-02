# Main container
FROM ubuntu:22.04 AS base

ONBUILD COPY .nvmrc ./
# Installs the node version of the project.
ONBUILD RUN apt-get update && \
    # Curl is also required by NVM to install nodejs. \
    apt-get install -y curl && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | PROFILE=/root/.profile bash && \
    # Remove line that turns off messages, since it prints an error message because we are \
    # in a container. \
    sed -i '/mesg/d' /root/.profile && \
    /bin/bash -l -c 'nvm install' && \
    # Install the node version's binary globally
    /bin/bash -l -c 'ln -sr $NVM_BIN/* /usr/local/bin' && \
    apt-get purge -y curl && \
    apt-get autoremove -y && \
    # Cleanup
    rm -rf /var/lib/apt/lists/*

FROM base AS builder

COPY tsconfig.json tsconfig.build.json package.json package-lock.json /action/
COPY src /action/src

RUN cd /action/ && \
    npm install && \
    npm run build && \
    npm prune --production && \
    rm -rf src tsconfig.json tsconfig.build.json

COPY entrypoint.sh ./
ENTRYPOINT ["./entrypoint.sh"]
