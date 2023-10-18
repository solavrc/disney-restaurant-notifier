FROM node:20-bullseye

RUN apt-get update \
  && apt-get install -y chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN npm init -y &&  \
  npm i puppeteer \
  && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /usr/app

USER pptruser

WORKDIR /app

COPY ./package.json ./tsconfig.json /app/
RUN npm i
COPY ./src/ /app/src/

CMD ["-r", "esbuild-register", "/app/src/index.ts"]
