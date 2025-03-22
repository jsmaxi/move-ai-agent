# Use this image as the base
FROM ubuntu:latest

# Install Aptos CLI
RUN apt-get update && apt-get install -y curl python3 nodejs npm unzip
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
# Set the environment variables
ENV BOOGIE_EXE=/root/.local/bin/boogie
ENV Z3_EXE=/root/.local/bin/z3
# Check if they are set
RUN echo "Boogie path: $BOOGIE_EXE" && echo "Z3 path: $Z3_EXE"
# Init
RUN aptos init --profile default --network devnet

# Set the working directory
WORKDIR /ui

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]