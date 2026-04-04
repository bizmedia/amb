# Runbook CI/CD для AMB на Timeweb Kubernetes

Этот документ описывает только CI/CD-путь для production-развёртывания AMB в Timeweb Kubernetes через GitHub Actions.

Текущая схема:

- Kubernetes cluster: `twc-k8scluster`
- namespace: `megaretro`
- GitHub Actions workflow: `Deploy AMB to Timeweb Kubernetes`
- GitHub Environment: `PROD`
- dashboard: `amb.megaretro.ru`
- API: `api.amb.megaretro.ru`

## Что уже ожидается готовым

- в Timeweb существует рабочий Kubernetes-кластер
- в кластере установлен `ingress-nginx`
- в кластере установлен `cert-manager`
- доступен `ClusterIssuer` `letsencrypt-prod`
- домены `amb.megaretro.ru` и `api.amb.megaretro.ru` смотрят на ingress балансировщик кластера
- в GitHub repository уже запушен workflow

Основной workflow:

- [deploy-timeweb-k8s.yml](/Users/anatolijtukov/Developer/amb-app/.github/workflows/deploy-timeweb-k8s.yml)

Основные манифесты:

- [apply.yaml](/Users/anatolijtukov/Developer/amb-app/deploy/k8s/timeweb/apply.yaml)
- [migrate-job.yaml](/Users/anatolijtukov/Developer/amb-app/deploy/k8s/timeweb/migrate-job.yaml)

## Как работает CI/CD

Workflow делает следующее:

1. Берёт код из репозитория.
2. Проверяет обязательные secrets.
3. Собирает Docker-образы `amb-api` и `amb-web`.
4. Публикует их в Timeweb Container Registry.
5. Обновляет Kubernetes image pull secret.
6. Обновляет Kubernetes secret `amb-secrets`.
7. Запускает Prisma migration job.
8. Выкатывает `Deployment`, `Service` и `Ingress`.
9. Ждёт успешный rollout `amb-api` и `amb-web`.

Теги образов:

- `amb-api:${GITHUB_SHA}`
- `amb-web:${GITHUB_SHA}`

## Где хранить настройки в GitHub

Все production-настройки должны лежать в:

- `GitHub -> Settings -> Environments -> PROD`

Не в обычных repository secrets, а именно в environment `PROD`.

## Secrets для Environment PROD

Нужно создать такие secrets:

```text
TWC_KUBECONFIG=<полный kubeconfig кластера twc-k8scluster>
TWC_REGISTRY_HOST=966b2a59-megaretro-register.registry.twcstorage.ru
TWC_REGISTRY_USERNAME=<логин Timeweb Container Registry>
TWC_REGISTRY_PASSWORD=<пароль или token Timeweb Container Registry>
AMB_DATABASE_URL=postgresql://amb_user:xrZf49KLyfu_A@5.129.247.123:5432/amb_db
AMB_JWT_SECRET=9aabf4f24c40d7d072ba416aa34cc9bbc062db72b42a771b7e4ff830f9768935
```

Назначение:

- `TWC_KUBECONFIG`: доступ GitHub Actions к кластеру
- `TWC_REGISTRY_HOST`: адрес Timeweb registry
- `TWC_REGISTRY_USERNAME` / `TWC_REGISTRY_PASSWORD`: логин в registry
- `AMB_DATABASE_URL`: строка подключения к production PostgreSQL
- `AMB_JWT_SECRET`: production JWT secret для API

## Variables для Environment PROD

Нужно создать такие variables:

```text
AMB_K8S_NAMESPACE=megaretro
AMB_K8S_CLUSTER_ISSUER=letsencrypt-prod
AMB_K8S_IMAGE_PULL_SECRET=timeweb-registry-secret
AMB_WEB_HOST=amb.megaretro.ru
AMB_API_HOST=api.amb.megaretro.ru
TWC_REGISTRY_NAMESPACE=megaretro
AMB_BOOTSTRAP=true
```

Назначение:

- `AMB_K8S_NAMESPACE`: namespace деплоя
- `AMB_K8S_CLUSTER_ISSUER`: issuer для TLS сертификатов
- `AMB_K8S_IMAGE_PULL_SECRET`: имя docker-registry secret внутри Kubernetes
- `AMB_WEB_HOST`: публичный домен dashboard
- `AMB_API_HOST`: публичный домен API
- `TWC_REGISTRY_NAMESPACE`: namespace репозитория образов в registry
- `AMB_BOOTSTRAP`: включить первичный upsert **default tenant** (без пользователя и без проекта)

## Что такое AMB_K8S_IMAGE_PULL_SECRET

`AMB_K8S_IMAGE_PULL_SECRET` это не пароль, а имя Kubernetes secret, через который кластер тянет Docker-образы из registry.

В текущей схеме:

```text
AMB_K8S_IMAGE_PULL_SECRET=timeweb-registry-secret
```

Почему это `Variables`, а не `Secrets`:

- это не чувствительное значение
- это только имя объекта в Kubernetes
- реальные секретные данные лежат в:
  - `TWC_REGISTRY_USERNAME`
  - `TWC_REGISTRY_PASSWORD`

## Первый запуск

Для первого production deploy:

```text
AMB_BOOTSTRAP=true
```

Это нужно, чтобы API при старте **гарантировал** запись default tenant в БД. Пользователя и проект создаёте через Dashboard (**sign up**, затем **create project**).

После первого успешного deploy нужно изменить variable:

```text
AMB_BOOTSTRAP=false
```

## Как запускать deploy

Вариант 1. Ручной запуск:

1. Открыть `GitHub -> Actions`.
2. Выбрать workflow `Deploy AMB to Timeweb Kubernetes`.
3. Нажать `Run workflow`.
4. Выбрать ветку.
5. Запустить workflow.

Вариант 2. Автоматически:

- workflow уже запускается на `push` в `main`, если изменились релевантные файлы

## Что проверять после запуска

В GitHub Actions должны успешно пройти шаги:

- `Validate required secrets`
- `Log in to Timeweb Container Registry`
- `Build and push deployment images`
- `Update image pull secret`
- `Update app secrets`
- `Run database migrations`
- `Deploy workloads and ingress`
- `Wait for rollout`

После этого проверить вручную:

```bash
curl -I https://amb.megaretro.ru
curl https://api.amb.megaretro.ru/api/health
```

Ожидаемое поведение:

- `amb.megaretro.ru` отвечает по HTTPS
- `api.amb.megaretro.ru/api/health` возвращает успешный health response

## Типовые проблемы

### 1. Missing required GitHub secrets

Причина:

- secrets добавлены не в `Environment -> PROD`
- workflow не видит нужные значения

Проверить:

- secrets созданы именно в `PROD`
- job использует `environment: PROD`

### 2. Username and password required

Причина:

- это обычно не Timeweb deploy workflow, а `docker-publish.yml`
- для него не хватает `DOCKERHUB_USERNAME` и `DOCKERHUB_TOKEN`

Если нужен именно production deploy на Timeweb, запускайте workflow:

- `Deploy AMB to Timeweb Kubernetes`

### 3. Ingress создан, но домен не открывается

Проверить:

- DNS реально указывает на ingress IP кластера
- сертификат успел выпуститься через `cert-manager`
- rollout `amb-api` и `amb-web` завершился успешно

### 4. Ошибка на migration step

Проверить:

- `AMB_DATABASE_URL`
- доступность PostgreSQL с кластера
- права пользователя БД

## Операционный минимум

Если нужна короткая рабочая памятка, то порядок такой:

1. Заполнить `PROD secrets`.
2. Заполнить `PROD variables`.
3. Оставить `AMB_BOOTSTRAP=true` на первом запуске.
4. Запустить `Deploy AMB to Timeweb Kubernetes`.
5. Проверить `amb.megaretro.ru`.
6. Проверить `api.amb.megaretro.ru/api/health`.
7. После первого успешного запуска переключить `AMB_BOOTSTRAP=false`.

## Связанные файлы

- [deploy-timeweb-k8s.yml](/Users/anatolijtukov/Developer/amb-app/.github/workflows/deploy-timeweb-k8s.yml)
- [README.md](/Users/anatolijtukov/Developer/amb-app/deploy/k8s/timeweb/README.md)
- [apply.yaml](/Users/anatolijtukov/Developer/amb-app/deploy/k8s/timeweb/apply.yaml)
- [migrate-job.yaml](/Users/anatolijtukov/Developer/amb-app/deploy/k8s/timeweb/migrate-job.yaml)
