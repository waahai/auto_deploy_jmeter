FROM node:latest
RUN npm set registry http://mirrors.jd.com/npm
RUN mkdir /script
WORKDIR /script
EXPOSE 6789
ADD ./script /script
RUN npm install
CMD ["npm", "start"]
