# Dockerfile for React frontend
# Stage 1: Build the React app
FROM node:22.12.0 AS build
WORKDIR /app

# Accept build-time argument
ARG REACT_APP_MODE
ENV REACT_APP_MODE=$REACT_APP_MODE

COPY package.json package-lock.json ./
RUN npm install
COPY public/ ./public
COPY src/ ./src
COPY tailwind.config.js ./

# Copy WebViewer asset
COPY copy-webviewer.js ./

# Inject REACT_APP_MODE into a .env file CRA will read
RUN echo "REACT_APP_MODE=$REACT_APP_MODE" > .env

RUN npm run build

# Stage 2: Serve the React app with Nginx
FROM nginx:alpine
# Copy the React build files
COPY --from=build /app/build /usr/share/nginx/html
# Copy your custom Nginx config file. (Make sure nginx-app.conf is in your build context.)
COPY nginx-app.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]