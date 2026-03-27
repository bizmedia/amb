#!/usr/bin/env sh
# Build and push one image (multi-arch manifest: amd64 + arm64 by default).
# Usage: build-push-image-multiarch.sh [-f Dockerfile] IMAGE_REF
# Env:
#   CONTAINER_CLI   podman | docker (required)
#   IMAGE_PLATFORMS comma-separated, default linux/amd64,linux/arm64
#   ROOT_DIR        repo root (default: cwd)

set -eu

ROOT_DIR="${ROOT_DIR:-$(pwd)}"
IMAGE_PLATFORMS="${IMAGE_PLATFORMS:-linux/amd64,linux/arm64}"

DOCKERFILE=""
while [ $# -gt 0 ]; do
  case "$1" in
    -f)
      DOCKERFILE="$2"
      shift 2
      ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

IMAGE_REF="${1:?usage: build-push-image-multiarch.sh [-f Dockerfile] IMAGE_REF}"

cd "$ROOT_DIR"

is_multi() {
  case "$IMAGE_PLATFORMS" in
    *,*) return 0 ;;
    *) return 1 ;;
  esac
}

docker_buildx_ensure() {
  if ! docker buildx version >/dev/null 2>&1; then
    echo "docker buildx is required for multi-arch images. Install Docker Buildx or use Podman." >&2
    exit 1
  fi
  if ! docker buildx inspect amb-release >/dev/null 2>&1; then
    docker buildx create --name amb-release --driver docker-container --use >/dev/null
  else
    docker buildx use amb-release >/dev/null
  fi
  docker buildx inspect --bootstrap >/dev/null
}

docker_build_push() {
  docker_buildx_ensure
  if [ -n "$DOCKERFILE" ]; then
    docker buildx build --platform "$IMAGE_PLATFORMS" --push -f "$DOCKERFILE" -t "$IMAGE_REF" .
  else
    docker buildx build --platform "$IMAGE_PLATFORMS" --push -t "$IMAGE_REF" .
  fi
}

podman_build_push_single() {
  if [ -n "$DOCKERFILE" ]; then
    podman build -f "$DOCKERFILE" -t "$IMAGE_REF" .
  else
    podman build -t "$IMAGE_REF" .
  fi
  podman push "$IMAGE_REF"
}

podman_build_push_multi() {
  podman manifest rm "$IMAGE_REF" 2>/dev/null || true
  podman manifest create "$IMAGE_REF"

  OLD_IFS=$IFS
  IFS=,
  for plat in $IMAGE_PLATFORMS; do
    IFS=$OLD_IFS
    plat=$(echo "$plat" | tr -d ' ')
    if [ -n "$DOCKERFILE" ]; then
      podman build --platform "$plat" --manifest "$IMAGE_REF" -f "$DOCKERFILE" .
    else
      podman build --platform "$plat" --manifest "$IMAGE_REF" .
    fi
  done
  IFS=$OLD_IFS

  podman manifest push "$IMAGE_REF"
}

case "$CONTAINER_CLI" in
  docker)
    if is_multi; then
      docker_build_push
    else
      if [ -n "$DOCKERFILE" ]; then
        docker build -f "$DOCKERFILE" -t "$IMAGE_REF" .
      else
        docker build -t "$IMAGE_REF" .
      fi
      docker push "$IMAGE_REF"
    fi
    ;;
  podman)
    if is_multi; then
      podman_build_push_multi
    else
      podman_build_push_single
    fi
    ;;
  *)
    echo "CONTAINER_CLI must be docker or podman" >&2
    exit 1
    ;;
esac
