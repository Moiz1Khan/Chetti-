# Production: static build + nginx
# Build with your Supabase URL + anon key (see docs/DEPLOY_VPS.md).
#
# docker build \
#   --build-arg VITE_SUPABASE_URL=https://xxx.supabase.co \
#   --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=eyJ... \
#   --build-arg VITE_SITE_URL=https://your-domain.com \
#   -t chetti:latest .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SITE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SITE_URL=$VITE_SITE_URL

RUN npm run build

FROM nginx:alpine
COPY deploy/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
