ARG NODE_VERSION=24.22.1

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /build
ENV HUSKY=0
RUN npm install --global pnpm@7.33.7

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json packages/core/package.json
COPY packages/app/package.json packages/app/package.json
COPY packages/cli/package.json packages/cli/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build \
    && pnpm --filter hlink --prod deploy /runtime

FROM node:${NODE_VERSION}-alpine AS runtime

LABEL org.opencontainers.image.source="https://github.com/likun7981/hlink"

ENV NODE_ENV=production \
    DOCKER=true \
    PS1="\u@\h:\w \$ " \
    PUID=0 \
    PGID=0 \
    UMASK=022

RUN apk add --no-cache bash su-exec
COPY --from=build /runtime /usr/local/lib/node_modules/hlink
RUN chmod +x /usr/local/lib/node_modules/hlink/lib/cli.js \
    && ln -s /usr/local/lib/node_modules/hlink/lib/cli.js /usr/local/bin/hlink

COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]

EXPOSE 9090
