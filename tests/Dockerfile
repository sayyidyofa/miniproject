FROM node

RUN apt update && apt install vim nano -y

WORKDIR /testapp
COPY ./* ./

EXPOSE 80

CMD npm i && node testApp.js
