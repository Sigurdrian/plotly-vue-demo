# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source to the working directory
COPY . .

# Expose port 5173 for the Vue.js development server
EXPOSE 5173

# Run the development server
CMD ["npm", "run", "serve"]