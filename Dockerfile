# Используем официальный образ nginx
FROM nginx:alpine

# Копируем файлы игры в директорию nginx
COPY . /usr/share/nginx/html

# Контейнер будет слушать порт 80
EXPOSE 80
