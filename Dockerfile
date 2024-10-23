FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p logs data

# Set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Start the application
CMD ["npm", "start"]