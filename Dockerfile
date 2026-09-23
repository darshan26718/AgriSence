FROM node:20-slim

# Install Python 3 for agricultural micro-services and ML engine
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-minimal \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build production client and bundled server
ENV NODE_ENV=production
RUN npm run build

# Render supplies $PORT dynamically
ENV PORT=3000
EXPOSE 3000

# Start AgriSense server (Express supervises Python ML backend)
CMD ["npm", "start"]
