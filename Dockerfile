FROM node:14-alpine
COPY . /app
RUN apk add --no-cache git
RUN cd /app && yarn
WORKDIR /app
RUN yarn nft-market:client-prod
RUN echo $(ls)
# ADD packages/nft-market/client/dist /var/www/foamies
CMD yarn nft-market:server-prod