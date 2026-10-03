FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application (but exclude firebase-key.json via .dockerignore)
COPY . .

# Cloud Run sets PORT env var automatically; expose it for documentation
EXPOSE 8080

# Start the server
CMD ["node", "src/server.js"]
