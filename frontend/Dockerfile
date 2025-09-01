# Frontend Dockerfile - no Nginx
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all frontend source code
COPY . .

# Build the React app
RUN npm run build

# Install lightweight static server globally
RUN npm install -g serve

# Expose port for Render
ENV PORT 3000
EXPOSE 3000

# Start the frontend using serve
CMD ["serve", "-s", "build", "-l", "3000"]
