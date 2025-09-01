# Frontend Dockerfile - no Nginx
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install a lightweight static server
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the frontend
CMD ["serve", "-s", "build", "-l", "3000"]
