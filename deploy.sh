#!/bin/bash

# Build and run with Docker Compose
echo "Building and starting Notes App..."

# Stop any running containers
docker-compose down

# Build fresh images
docker-compose build --no-cache

# Start the services
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check if services are running
docker-compose ps

echo "Notes App is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"