# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the application code to the working directory
COPY . .

# Install the dependencies
RUN npm install

RUN npm run build

EXPOSE 3100

# Command to run the application
# CMD ["npm", "run", "start:prod"]
CMD [ "./start.sh" ]