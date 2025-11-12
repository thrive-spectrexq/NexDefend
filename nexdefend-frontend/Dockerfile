# Use an official Node.js runtime
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Expose the port Vite runs on (defined in vite.config.ts)
EXPOSE 5173

# Command to run the dev server
# We also add --host to make it accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
