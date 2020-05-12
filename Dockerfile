FROM node:14-slim AS frontend
WORKDIR /tmp/frontend
COPY ./frontend .
RUN npm install && npm run build

FROM alpine:latest AS jvm
RUN apk --no-cache add openjdk11-jre-headless

FROM jvm AS backend
ENV GRADLE_HOME /gradle-6.4
ENV PATH $PATH:$GRADLE_HOME/bin
RUN apk --no-cache add curl unzip
RUN curl -L https://services.gradle.org/distributions/gradle-6.4-bin.zip -o gradle-6.4-bin.zip && unzip gradle-6.4-bin.zip && rm gradle-6.4-bin.zip
WORKDIR /tmp/backend
COPY ./backend .
RUN gradle build

FROM jvm
WORKDIR /app
COPY --from=backend /tmp/backend/build/libs/discordstats.jar .
COPY --from=frontend /tmp/frontend/build ./static
COPY nginx.conf .
COPY docker_entrypoint.sh .
RUN apk --no-cache add nginx
EXPOSE 80
CMD "./docker_entrypoint.sh"