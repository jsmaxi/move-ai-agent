# Use this image as the base
FROM ubuntu:latest

# Install Aptos CLI
RUN apt-get update && apt-get install -y curl python3 nodejs npm
RUN node --version
RUN npm --version
RUN python3 --version
RUN curl -fsSL https://aptos.dev/scripts/install_cli.py | python3
# Set the PATH environment variable for Aptos CLI
ENV PATH="/root/.local/bin:${PATH}"
# Version check
RUN aptos --version
# Prover dependencies
RUN aptos update prover-dependencies

# Set the working directory
WORKDIR /ui

# Copy package.json and install dependencies
COPY ui/package.json ui/package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY ./ui/ .

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]