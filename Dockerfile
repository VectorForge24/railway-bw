FROM node:18-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --production

# Create files directory and set ownership for the 'node' user
RUN mkdir files && chown node:node files

# Copy the rest of the app
COPY . .

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["node", "server.js"]
