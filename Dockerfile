# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install a simple HTTP server
RUN npm install -g serve

# Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# Start the server
CMD ["serve", "-s", "dist", "-l", "8080"]
