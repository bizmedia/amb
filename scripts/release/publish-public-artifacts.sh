#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$ROOT_DIR"

REGISTRY_PREFIX="${REGISTRY_PREFIX:-docker.io/openaisdk}"
IMAGE_TAG="${IMAGE_TAG:-$(node -p "require('./package.json').version")}"
NPM_TAG="${NPM_TAG:-latest}"
PUBLISH_LATEST="${PUBLISH_LATEST:-true}"
PUBLISH_WEB="${PUBLISH_WEB:-true}"
PUBLISH_API="${PUBLISH_API:-true}"
PUBLISH_NPM="${PUBLISH_NPM:-true}"
DOCKER_BUILDX_TIMEOUT_MS="${DOCKER_BUILDX_TIMEOUT_MS:-5000}"
# Comma-separated; registry clients pick the matching digest per host arch.
IMAGE_PLATFORMS="${IMAGE_PLATFORMS:-linux/amd64,linux/arm64}"
WEB_IMAGE_NAME="${WEB_IMAGE_NAME:-amb-web-ui}"
API_IMAGE_NAME="${API_IMAGE_NAME:-amb-api}"

is_multi_platforms() {
  case "$IMAGE_PLATFORMS" in
    *,*) return 0 ;;
    *) return 1 ;;
  esac
}

docker_buildx_available() {
  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi

  node - "$DOCKER_BUILDX_TIMEOUT_MS" <<'EOF'
const { spawnSync } = require('node:child_process');

const timeoutMs = Number(process.argv[2] || '5000');
const result = spawnSync('docker', ['buildx', 'version'], {
  stdio: 'ignore',
  timeout: timeoutMs,
});

if (result.error) {
  process.exit(1);
}

process.exit(result.status === 0 ? 0 : 1);
EOF
}

if [ -n "${CONTAINER_CLI:-}" ]; then
  CONTAINER_CLI_REASON="forced via CONTAINER_CLI"
elif is_multi_platforms && docker_buildx_available; then
  CONTAINER_CLI="docker"
  CONTAINER_CLI_REASON="auto-selected docker buildx for multi-arch"
elif command -v podman >/dev/null 2>&1; then
  CONTAINER_CLI="podman"
  CONTAINER_CLI_REASON="auto-selected podman fallback"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER_CLI="docker"
  CONTAINER_CLI_REASON="auto-selected docker fallback"
else
  echo "Neither podman nor docker is installed." >&2
  exit 1
fi

export CONTAINER_CLI IMAGE_PLATFORMS ROOT_DIR

WEB_IMAGE="$REGISTRY_PREFIX/$WEB_IMAGE_NAME:$IMAGE_TAG"
API_IMAGE="$REGISTRY_PREFIX/$API_IMAGE_NAME:$IMAGE_TAG"
WEB_LATEST_IMAGE="$REGISTRY_PREFIX/$WEB_IMAGE_NAME:latest"
API_LATEST_IMAGE="$REGISTRY_PREFIX/$API_IMAGE_NAME:latest"

BUILD_PUSH="$ROOT_DIR/scripts/release/build-push-image-multiarch.sh"

publish_image() {
  primary_ref="$1"
  latest_ref="$2"
  if [ "$PUBLISH_LATEST" = "true" ] && [ "$IMAGE_TAG" != "latest" ]; then
    sh "$BUILD_PUSH" "$primary_ref" "$latest_ref"
  else
    sh "$BUILD_PUSH" "$primary_ref"
  fi
}

echo "Using container CLI: $CONTAINER_CLI"
echo "Container CLI selection: $CONTAINER_CLI_REASON"
echo "Image platforms: $IMAGE_PLATFORMS"
echo "Version image tag: $IMAGE_TAG"
echo "Publish latest tag: $PUBLISH_LATEST"
echo "Publish web image: $PUBLISH_WEB"
echo "Publish api image: $PUBLISH_API"
echo "Publishing images:"
if [ "$PUBLISH_WEB" = "true" ]; then
  echo "  $WEB_IMAGE"
fi
if [ "$PUBLISH_WEB" = "true" ] && [ "$PUBLISH_LATEST" = "true" ] && [ "$IMAGE_TAG" != "latest" ]; then
  echo "  $WEB_LATEST_IMAGE"
fi
if [ "$PUBLISH_API" = "true" ]; then
  echo "  $API_IMAGE"
  if [ "$PUBLISH_LATEST" = "true" ] && [ "$IMAGE_TAG" != "latest" ]; then
    echo "  $API_LATEST_IMAGE"
  fi
fi
if [ "$PUBLISH_NPM" = "true" ]; then
  echo "Publishing npm package with tag: $NPM_TAG"
fi

if [ "$PUBLISH_WEB" = "true" ]; then
  echo ""
  echo "Building and pushing web image..."
  publish_image "$WEB_IMAGE" "$WEB_LATEST_IMAGE"
fi

if [ "$PUBLISH_API" = "true" ]; then
  echo ""
  echo "Building and pushing api image..."
  if [ "$PUBLISH_LATEST" = "true" ] && [ "$IMAGE_TAG" != "latest" ]; then
    sh "$BUILD_PUSH" -f Dockerfile.api "$API_IMAGE" "$API_LATEST_IMAGE"
  else
    sh "$BUILD_PUSH" -f Dockerfile.api "$API_IMAGE"
  fi
fi

if [ "$PUBLISH_NPM" = "true" ]; then
  echo ""
  echo "Building MCP package..."
  pnpm mcp:build

  echo ""
  echo "Publishing @openaisdk/amb-mcp to npm..."
  cd "$ROOT_DIR/packages/mcp-server"
  npm publish --access public --tag "$NPM_TAG"
fi

echo ""
echo "Artifact publish flow completed successfully."
