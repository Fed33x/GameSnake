# Настройка CI/CD для Snake Game

## Требования

- Сервер с Docker: 192.168.1.102
- Jenkins: 192.168.1.102:8080
- GitHub репозиторий с кодом

## Шаг 1: Настройка Docker на сервере

### Вариант 1: Jenkins в контейнере с доступом к Docker socket (РЕКОМЕНДУЕТСЯ)

Если Jenkins запущен в Docker контейнере, самый безопасный способ - монтировать Docker socket:

1. Запустите Jenkins контейнер с монтированием Docker socket:
```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker \
  jenkins/jenkins:lts
```

2. В этом случае в Jenkinsfile **НЕ нужно** указывать `DOCKER_HOST`, так как будет использоваться socket.

3. Убедитесь, что пользователь jenkins в контейнере имеет доступ к Docker socket (обычно это работает автоматически).

### Вариант 2: Включение Docker API (для удаленного доступа)

Если Jenkins работает не в контейнере или нужно удаленное подключение:

1. Используйте скрипт настройки:
```bash
chmod +x setup-docker.sh
sudo ./setup-docker.sh
```

Или вручную создайте/отредактируйте файл `/etc/docker/daemon.json`:
```json
{
  "hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}
```

2. Перезапустите Docker:
```bash
sudo systemctl restart docker
```

**ВНИМАНИЕ:** Открытие Docker API на порту 2375 без аутентификации небезопасно для продакшена. Для продакшена используйте TLS или ограничьте доступ через firewall.

3. Если используете этот вариант, в Jenkinsfile уже настроен `DOCKER_HOST = 'tcp://192.168.1.102:2375'`.

## Шаг 2: Настройка Jenkins

### 2.1. Установка необходимых плагинов

В Jenkins перейдите в **Manage Jenkins** → **Manage Plugins** и установите:

- **Docker Pipeline** (для работы с Docker)
- **Git** (для работы с Git репозиториями)
- **GitHub** (опционально, для интеграции с GitHub)
- **Pipeline** (для работы с Jenkinsfile)

### 2.2. Настройка Docker в Jenkins (только для Варианта 2)

Если вы используете Docker API через TCP (Вариант 2), настройте Docker Cloud:

1. Перейдите в **Manage Jenkins** → **Configure System**
2. Найдите секцию **Cloud** → **Docker**
3. Добавьте новый Docker Cloud:
   - **Name**: `docker-server`
   - **Docker Host URI**: `tcp://192.168.1.102:2375`
   - Нажмите **Test Connection** для проверки

**Примечание:** Если Jenkins запущен в контейнере с монтированным Docker socket (Вариант 1), эта настройка не требуется.

### 2.3. Создание Pipeline Job

1. В Jenkins нажмите **New Item**
2. Выберите **Pipeline**
3. Укажите имя: `snake-game-pipeline`
4. В разделе **Pipeline**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: URL вашего GitHub репозитория
   - **Credentials**: Добавьте credentials для доступа к репозиторию (если приватный)
   - **Branch Specifier**: `*/main` (или ваша основная ветка)
   - **Script Path**: `Jenkinsfile`
5. Сохраните

### 2.4. Настройка Credentials (если репозиторий приватный)

1. Перейдите в **Manage Jenkins** → **Manage Credentials**
2. Добавьте новый credential:
   - **Kind**: Username with password (для HTTPS) или SSH Username with private key (для SSH)
   - Введите данные для доступа к GitHub

## Шаг 3: Настройка Jenkinsfile

### Если Jenkins в контейнере с Docker socket (Вариант 1)

Если Jenkins запущен в контейнере с монтированным Docker socket, отредактируйте Jenkinsfile и уберите строку `DOCKER_HOST`:

```groovy
environment {
    // DOCKER_HOST = 'tcp://192.168.1.102:2375'  // Закомментируйте эту строку
    IMAGE_NAME = 'snake-game'
    CONTAINER_NAME = 'snake-game'
    PORT = '80'
}
```

### Если используется Docker API через TCP (Вариант 2)

Jenkinsfile уже настроен и готов к использованию без изменений.

## Шаг 4: Запуск Pipeline

1. В Jenkins выберите созданный job `snake-game-pipeline`
2. Нажмите **Build Now**
3. Следите за прогрессом в **Console Output**

## Шаг 5: Проверка деплоя

После успешного деплоя приложение будет доступно по адресу:
- **http://192.168.1.102**

## Автоматический запуск при push в GitHub

### Настройка Webhook в GitHub:

1. В репозитории GitHub перейдите в **Settings** → **Webhooks**
2. Нажмите **Add webhook**
3. Заполните:
   - **Payload URL**: `http://192.168.1.102:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Выберите **Just the push event**
4. Сохраните

### Настройка Jenkins для автоматического запуска:

1. В настройках Pipeline job перейдите в **Build Triggers**
2. Отметьте **GitHub hook trigger for GITScm polling**
3. Сохраните

Теперь при каждом push в репозиторий будет автоматически запускаться pipeline.

## Troubleshooting

### Проблема: Jenkins не может подключиться к Docker

**Решение:**
- Проверьте, что Docker API доступен: `curl http://192.168.1.102:2375/version`
- Проверьте firewall на сервере
- Убедитесь, что Jenkins контейнер имеет доступ к Docker socket или сети

### Проблема: Ошибка при сборке образа

**Решение:**
- Проверьте, что Dockerfile находится в корне репозитория
- Убедитесь, что все необходимые файлы присутствуют
- Проверьте логи в Jenkins Console Output

### Проблема: Контейнер не запускается

**Решение:**
- Проверьте, что порт 80 не занят другим приложением
- Проверьте логи контейнера: `docker logs snake-game`
- Убедитесь, что образ собран корректно

## Безопасность

Для продакшена рекомендуется:

1. Использовать TLS для Docker API
2. Настроить firewall для ограничения доступа
3. Использовать секреты Jenkins для хранения credentials
4. Настроить HTTPS для Jenkins
5. Регулярно обновлять Jenkins и плагины

