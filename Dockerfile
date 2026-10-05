# ==============================================================================
# Multi-stage Dockerfile for Farm2Street
# Combines React 19 Frontend + Jakarta EE 10 Tomcat 11 WAR
# Ready for 1-Click Production Deployment on Render / Cloud Platforms
# ==============================================================================

# STAGE 1: Build the React 19 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# STAGE 2: Build the Java EE Application with Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app

COPY pom.xml ./
COPY src ./src

# Sync compiled frontend assets into webapp
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/webapp/

RUN mvn clean package -DskipTests

# STAGE 3: Run Apache Tomcat 11
FROM tomcat:11.0-jdk17-temurin-jammy

# Remove default Tomcat sample webapps
RUN rm -rf /usr/local/tomcat/webapps/*

# Deploy Farm2Street as ROOT application (accessible directly at /)
COPY --from=backend-builder /app/target/farm2street.war /usr/local/tomcat/webapps/ROOT.war

# Render assigns dynamic PORT environment variable (default 8080 or $PORT)
ENV PORT=8080
EXPOSE 8080

# Dynamically bind Tomcat HTTP port to $PORT if provided by cloud host
CMD sed -i "s/port=\"8080\"/port=\"${PORT:-8080}\"/g" /usr/local/tomcat/conf/server.xml && catalina.sh run
