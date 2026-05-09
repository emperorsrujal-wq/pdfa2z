# Serve pre-built static files with nginx.
# The frontend is built in the CI runner (where GitHub secrets are available),
# so the dist/ directory is already present when this image is built.
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
