# 🚀 Быстрый старт CI/CD

## Краткая инструкция

### 1. Настройка Docker на сервере

**Если Jenkins в контейнере (рекомендуется):**
```bash
# Убедитесь, что Jenkins запущен с монтированным Docker socket
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  jenkins/jenkins:lts
```

**Если Jenkins не в контейнере:**
```bash
# На сервере выполните:
chmod +x setup-docker.sh
sudo ./setup-docker.sh
```

### 2. Настройка Jenkins

1. Откройте http://192.168.1.102:8080
2. Установите плагины: **Docker Pipeline**, **Git**, **Pipeline**
3. Создайте новый **Pipeline** job:
   - Название: `snake-game-pipeline`
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: ваш GitHub репозиторий
   - Script Path: `Jenkinsfile` (или `Jenkinsfile.socket` если Jenkins в контейнере)

### 3. Выбор Jenkinsfile

- **Jenkinsfile** - для Docker API через TCP (если настроен порт 2375)
- **Jenkinsfile.socket** - для Jenkins в контейнере с Docker socket
- **Jenkinsfile.compose** - альтернативный вариант с docker-compose

### 4. Запуск

1. Нажмите **Build Now** в Jenkins
2. После успешного деплоя приложение будет доступно: http://192.168.1.102

### 5. Автоматический запуск (опционально)

1. В GitHub: **Settings** → **Webhooks** → **Add webhook**
2. Payload URL: `http://192.168.1.102:8080/github-webhook/`
3. В Jenkins: **Build Triggers** → **GitHub hook trigger for GITScm polling**

Теперь при каждом push будет автоматически запускаться деплой!

---

Подробная документация: [JENKINS_SETUP.md](JENKINS_SETUP.md)

