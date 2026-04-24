# amb-app — bare-metal deploy (Drone SSH)

Deploy flow:

1. `build-images` pushes `amb-api` and `amb-web` images to registry.
2. `deploy` (SSH):
   - validates SSH key;
   - syncs `ops/bare-metal/` to `/opt/amb-app`;
   - generates `/opt/amb-app/.env` from Drone secrets;
   - runs `/opt/amb-app/bin/remote-pull-and-up.sh`.

## Shared-host upstream ports

- `amb.megaretro.ru` -> `127.0.0.1:3201` (web)
- `api.amb.megaretro.ru` -> `127.0.0.1:4201` (api)

## One-time host setup

```bash
sudo mkdir -p /opt/amb-app
sudo chown -R deploy:deploy /opt/amb-app
sudo chmod 755 /opt/amb-app
sudo -u deploy -H docker login <TWC_REGISTRY_HOST>
```

## Required Drone secrets

- `TWC_REGISTRY_HOST`
- `TWC_REGISTRY_USERNAME`
- `TWC_REGISTRY_PASSWORD`
- `twc_registry_namespace`
- `BARE_METAL_SSH_PRIVATE_KEY`
- `BARE_METAL_HOST`
- `AMB_DATABASE_URL`
- `AMB_JWT_SECRET`
- `dockerconfigjson`
