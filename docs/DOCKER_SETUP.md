# Docker Setup - Exercise Frontend

Complete guide for building and deploying the Exercise Frontend application with Docker.

## Overview

The frontend is containerized using a **multi-stage Docker build**:
1. **Builder stage**: Node.js 20 Alpine - builds the Vite/React application
2. **Runtime stage**: Nginx Alpine - serves static files efficiently

**Final image size**: ~50MB (optimized)

## Architecture

```
┌─────────────────────────┐
│  Builder Stage          │
│  (node:20-alpine)       │
│  - npm ci               │
│  - npm run build        │
│  - Output: dist/        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Runtime Stage          │
│  (nginx:alpine)         │
│  - Copy dist/           │
│  - Nginx config         │
│  - Serve on port 80     │
└─────────────────────────┘
```

## Files

### `Dockerfile`
Multi-stage build configuration:
- Stage 1: Build React app with Vite
- Stage 2: Serve with Nginx

### `nginx.conf`
Nginx server configuration:
- SPA routing (fallback to index.html)
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint

### `buildAndPush.sh`
Build and push script:
- Builds Docker image
- Tags with version
- Pushes to Docker Hub

### `.dockerignore`
Excludes from build context:
- node_modules
- dist
- coverage
- docs

## Building the Image

### Prerequisites

- Docker installed and running
- Docker Hub account
- Set `DOCKER_USERNAME` environment variable

### Build Command

```bash
# Set your Docker Hub username
export DOCKER_USERNAME=your-username

# Build and push
./buildAndPush.sh 1.0.0

# Or use latest tag
./buildAndPush.sh latest
```

### Manual Build

```bash
docker build -t your-username/exercises-frontend:1.0.0 .
```

## Configuration

### Environment Variables

**Build Time:**
- `VITE_API_URL` - API backend URL (embedded in build)

**Runtime:**
- Not configurable at runtime (static build)

### API URL Configuration

The API URL is **embedded at build time** via Vite:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/exercise-logging',
};
```

**For different environments, build separate images:**

```bash
# Development build
VITE_API_URL=http://localhost:8080/exercise-logging npm run build

# Production build
VITE_API_URL=https://api.production.com/exercise-logging npm run build
```

## Running the Container

### Standalone

```bash
docker run -d \
  --name exercises-frontend \
  -p 3000:80 \
  your-username/exercises-frontend:latest
```

### With Docker Compose

See `exercises-infra/dev/docker-compose.yml` or `exercises-infra/prod/docker-compose.yml`

```bash
cd exercises-infra/dev
docker-compose up -d frontend
```

## Nginx Configuration

### Features

**SPA Routing:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
All routes fallback to index.html for client-side routing.

**Gzip Compression:**
- Enabled for text files
- Min size: 1024 bytes
- Reduces transfer size by ~70%

**Security Headers:**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

**Static Asset Caching:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**Health Check:**
```nginx
location /health {
    return 200 "OK\n";
}
```

### Custom Nginx Config

To modify nginx configuration:

1. Edit `nginx.conf`
2. Rebuild image
3. Deploy updated image

## Health Checks

### Container Health

Docker health check built-in:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

### Manual Check

```bash
# From host
curl http://localhost:3000/health

# From inside container
docker exec exercises-frontend-dev wget -qO- http://localhost/health
```

## Image Details

### Size Optimization

| Stage | Size | Purpose |
|-------|------|---------|
| Builder | ~500MB | Build artifacts |
| Runtime | ~50MB | Final image |

**Optimizations:**
- Multi-stage build (90% reduction)
- Alpine base images
- No dev dependencies in runtime
- Minified JS/CSS bundles

### Security

✅ Non-root user (nginx default)
✅ Alpine Linux (minimal attack surface)
✅ No source code in image
✅ Security headers configured
✅ Regular base image updates

## Deployment Workflow

### 1. Build Frontend Image

```bash
cd exercises-frontend
export DOCKER_USERNAME=myusername
./buildAndPush.sh 1.0.0
```

**Result**: Image pushed to `docker.io/myusername/exercises-frontend:1.0.0`

### 2. Deploy with Infrastructure

```bash
cd exercises-infra/dev
# Update .env with FRONTEND_VERSION=1.0.0
docker-compose up -d frontend
```

### 3. Verify Deployment

```bash
# Check container
docker-compose ps frontend

# Check health
curl http://localhost:3000/health

# Access application
open http://localhost:3000
```

## Environment-Specific Builds

### Development

```bash
# Build with dev API URL
docker build \
  --build-arg VITE_API_URL=http://localhost:8080/exercise-logging \
  -t myusername/exercises-frontend:dev .
```

### Production

```bash
# Build with production API URL
docker build \
  --build-arg VITE_API_URL=https://api.example.com/exercise-logging \
  -t myusername/exercises-frontend:1.0.0 .
```

## Troubleshooting

### Build Fails

**Problem**: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
./buildAndPush.sh
```

### Container Won't Start

**Problem**: Container exits immediately

**Solution**:
```bash
# Check logs
docker logs exercises-frontend-dev

# Verify nginx config
docker run --rm -it your-username/exercises-frontend:latest nginx -t
```

### 404 on Routes

**Problem**: Direct URL access returns 404

**Cause**: Nginx not configured for SPA

**Solution**: Check `nginx.conf` has `try_files $uri $uri/ /index.html;`

### API Calls Fail (CORS)

**Problem**: Browser console shows CORS errors

**Solutions**:
1. Ensure backend has CORS configured
2. Check API URL in frontend config
3. Verify network connectivity between containers

## Advanced Configuration

### Custom Build Args

Add to Dockerfile:
```dockerfile
ARG API_URL=http://localhost:8080
ENV VITE_API_URL=$API_URL
```

Build with:
```bash
docker build --build-arg API_URL=https://api.example.com -t frontend .
```

### Nginx as Reverse Proxy

Uncomment in `nginx.conf`:
```nginx
location /exercise-logging/ {
    proxy_pass http://backend:8080;
    # ... proxy headers
}
```

This allows API calls through same domain (avoids CORS).

### SSL/TLS

For HTTPS, mount certificates:
```yaml
volumes:
  - ./certs:/etc/nginx/certs:ro
```

Update nginx.conf to listen on 443.

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Push Frontend
  run: |
    export DOCKER_USERNAME=${{ secrets.DOCKER_USERNAME }}
    cd exercises-frontend
    ./buildAndPush.sh ${{ github.sha }}
```

### GitLab CI Example

```yaml
build-frontend:
  script:
    - cd exercises-frontend
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
```

## Performance Tips

### Build Performance

```bash
# Use buildkit for faster builds
DOCKER_BUILDKIT=1 docker build -t frontend .
```

### Runtime Performance

- Gzip enabled (70% size reduction)
- Static assets cached (1 year)
- HTTP/2 support (via nginx)
- Minified bundles (Vite default)

## Summary

✅ **Multi-stage build** - Optimized image size
✅ **Nginx serving** - Fast static file delivery
✅ **SPA routing** - Client-side navigation works
✅ **Health checks** - Container monitoring
✅ **Security headers** - Basic protection
✅ **Gzip compression** - Reduced bandwidth
✅ **Docker Hub ready** - Easy deployment

The frontend is production-ready for Docker deployment! 🚀
