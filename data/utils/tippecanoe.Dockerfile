# Source: https://github.com/jtmiclat/tippecanoe-docker/blob/master/Dockerfile

FROM ubuntu:24.04 AS tippecanoe-builder

RUN apt-get update \
  && apt-get -y install build-essential libsqlite3-dev zlib1g-dev git

ARG TIPPACANOE_VERSION=2.79.0

RUN git clone --depth 1 https://github.com/felt/tippecanoe.git --branch ${TIPPACANOE_VERSION} --single-branch /tmp/tippecanoe-src

WORKDIR /tmp/tippecanoe-src

RUN make && make install


FROM ubuntu:24.04
RUN apt-get update \
  && apt-get -y install libsqlite3-dev zlib1g-dev \
  && rm -rf /var/lib/apt/lists/*
COPY --from=tippecanoe-builder /tmp/tippecanoe-src/tippecanoe* /usr/local/bin/
COPY --from=tippecanoe-builder /tmp/tippecanoe-src/tile-join /usr/local/bin/
WORKDIR /app
