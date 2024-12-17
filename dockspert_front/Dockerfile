# Base Node image
FROM node:22.1.0

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Copy the rest of the files
COPY . /app/

# Build the React app for production
RUN npm run build && ls -l /app/build

# Install `serve` to serve the React app
RUN npm install -g serve

# Expose the port for React app
EXPOSE 3000

# Command to serve the React app
CMD ["serve", "-s", "build", "-l", "3000", "--single"]
