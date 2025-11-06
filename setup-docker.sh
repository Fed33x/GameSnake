#!/bin/bash

# Скрипт для настройки Docker API на сервере
# ВНИМАНИЕ: Это настраивает незащищенный доступ к Docker API
# Для продакшена используйте TLS!

echo "Настройка Docker API для удаленного доступа..."

# Создаем директорию для конфигурации Docker, если её нет
sudo mkdir -p /etc/docker

# Создаем или обновляем daemon.json
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}
EOF

# Останавливаем Docker
echo "Остановка Docker..."
sudo systemctl stop docker

# Обновляем systemd service для Docker (если используется)
if [ -f /etc/systemd/system/docker.service.d/override.conf ]; then
    echo "Обновление systemd override..."
else
    sudo mkdir -p /etc/systemd/system/docker.service.d
    sudo tee /etc/systemd/system/docker.service.d/override.conf > /dev/null <<EOF
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
EOF
fi

# Перезагружаем systemd
sudo systemctl daemon-reload

# Запускаем Docker
echo "Запуск Docker..."
sudo systemctl start docker

# Проверяем статус
echo "Проверка статуса Docker..."
sudo systemctl status docker --no-pager

# Проверяем доступность API
echo "Проверка доступности Docker API..."
sleep 2
curl -s http://localhost:2375/version | head -n 1

echo ""
echo "Настройка завершена!"
echo "Docker API теперь доступен на порту 2375"
echo "ВНИМАНИЕ: Настройте firewall для ограничения доступа!"

