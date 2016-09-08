FROM node
EXPOSE 8773
RUN mkdir /govieserver
COPY model/ /govieserver/model
COPY config.js /govieserver/config.js
COPY package.json /govieserver/package.json
COPY server.js /govieserver/server.js
WORKDIR /govieserver
RUN npm install
CMD node server.js
