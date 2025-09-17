# Use an official minimal Go image
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the app
RUN go build -o event-logger .

# Final stage: minimal image
FROM alpine:latest

WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /app/event-logger .

# Expose app port
EXPOSE 5555

# Start the server
CMD ["./event-logger"]
