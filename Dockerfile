## Stage 1: Build PMTiles and prepare DuckDB database
# Builds tippecanoe from source,
# downloads dev.duckdb from public S3,
# and runs the PMTiles build script.
FROM python:3.12-slim AS pmtiles-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git libsqlite3-dev zlib1g-dev \
    && git clone --depth 1 --branch 2.79.0 https://github.com/felt/tippecanoe.git /tmp/tippecanoe \
    && make -C /tmp/tippecanoe -j$(nproc) install \
    && rm -rf /tmp/tippecanoe /var/lib/apt/lists/*

RUN pip install --no-cache-dir duckdb

WORKDIR /app

COPY data/utils/download.py data/utils/download.py
COPY data/utils/build_pmtiles.py data/utils/build_pmtiles.py

# Download dev.duckdb from public S3 (no credentials needed)
RUN python data/utils/download.py

# Pre-install DuckDB spatial extension (required by build_pmtiles.py)
RUN python -c "import duckdb; conn = duckdb.connect(); conn.execute('INSTALL spatial'); conn.close()"

# DuckDB → GeoJSON → PMTiles (output: website/public/pmtiles/communes.pmtiles)
RUN python data/utils/build_pmtiles.py


## Stage 2: Build Next.js app
FROM node:20-slim AS nextjs-builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY website/package*.json ./
RUN npm ci

COPY website/ ./

# Inject PMTiles from stage 1
COPY --from=pmtiles-builder /app/website/public/pmtiles ./public/pmtiles

# Copy DuckDB
COPY --from=pmtiles-builder /app/data/exploration/dev.duckdb /data/dev.duckdb
ENV DUCKDB_PATH=/data/dev.duckdb

RUN npm run build


## Stage 3: Production runtime
FROM node:20-slim AS runner

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app
RUN chown nextjs:nodejs /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DUCKDB_PATH=/data/dev.duckdb
# Required for Next.js standalone to listen on all interfaces (not just localhost)
ENV HOSTNAME=0.0.0.0
ENV PORT=3000docker build -t pcc-website .
# DuckDB node client writes extension cache under $HOME/.duckdb
ENV HOME=/app

# standalone bundles only what's needed — no npm install required
COPY --from=nextjs-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=nextjs-builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=nextjs-builder --chown=nextjs:nodejs /app/public ./public

# DuckDB database
RUN mkdir -p /data && chown nextjs:nodejs /data
COPY --from=pmtiles-builder --chown=nextjs:nodejs /app/data/exploration/dev.duckdb /data/dev.duckdb

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
