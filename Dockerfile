# --- build stage ---
    FROM node:20 AS builder
    WORKDIR /app
    COPY . .
    RUN npm ci && npm run build
    
    # --- run stage ---
    FROM gcr.io/distroless/nodejs20-debian12
    WORKDIR /app
    COPY --from=builder /app/.next ./.next
    # COPY --from=builder /app/public ./public
    COPY --from=builder /app/package*.json ./
    EXPOSE 8080
    CMD ["next", "start", "-p", "8080"]
    