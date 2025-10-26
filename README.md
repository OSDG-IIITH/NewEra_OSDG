## Getting Started

for updating linux installation docsi

clone repo with typ code for the documentation

use pandoc to convert typ to html

```
pandoc -o fedora.html fedora.typ 
```

you might wanna delete line 7 in typ file before running that 

then copy fedora.html & assets folder to public/linux-installation/

### Development

First, run the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker Deployment

#### Using Docker Compose (Recommended)

The easiest way to run the application with persistent storage:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**Data Persistence:** Projects are stored in the `./data` directory on your host machine, which is mounted to `/app/data` inside the container. This ensures your projects persist across container restarts.

#### Using Docker CLI

Alternatively, you can use Docker commands directly:

```bash
# Build the image
docker build -t osdg-web .

# Run the container with volume mount
docker run -d \
  --name osdg-web \
  -p 3000:80 \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  osdg-web

# View logs
docker logs -f osdg-web

# Stop and remove container
docker stop osdg-web && docker rm osdg-web
```

#### Data Directory

The `data/projects.json` file stores all user-created projects. Make sure this directory has proper write permissions:

```bash
# Create data directory if it doesn't exist
mkdir -p data

# On Linux/Mac, ensure proper permissions
chmod 777 data
```

