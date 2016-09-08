FROM node
EXPOSE 1883
RUN mkdir /govieevents
COPY package.json /govieevents/package.json
COPY push-server.js /govieevents/push-server.js
WORKDIR /govieevents
RUN npm install
CMD node push-server.js
