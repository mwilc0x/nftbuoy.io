FROM node:14-slim as fe-server
RUN apt-get update || : && apt-get install python -y
RUN apt-get install vim -y
WORKDIR /usr/src/fe-server
COPY . /usr/src/fe-server
RUN apt-get install git -y
RUN apt-get install libsecret-1-0 -y
RUN yarn install
# ENTRYPOINT ["sh", "entrypoint.sh"]
CMD ls /usr/src && NODE_ENV=production yarn start
