#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$ROOT_DIR"

if command -v podman >/dev/null 2>&1; then
  CONTAINER_CLI="podman"
elif command -v docker >/dev/null 2>&1; then
  CONTAINER_CLI="docker"
else
  echo "Neither podman nor docker is installed." >&2
  exit 1
fi

REGISTRY_PREFIX="${REGISTRY_PREFIX:-docker.io/openaisdk}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
NPM_TAG="${NPM_TAG:-latest}"
# Comma-separated; registry clients pick the matching digest per host arch.
IMAGE_PLATFORMS="${IMAGE_PLATFORMS:-linux/amd64,linux/arm64}"
export CONTAINER_CLI IMAGE_PLATFORMS ROOT_DIR

WEB_IMAGE="$REGISTRY_PREFIX/amb:$IMAGE_TAG"
API_IMAGE="$REGISTRY_PREFIX/amb-api:$IMAGE_TAG"
SEED_IMAGE="$REGISTRY_PREFIX/amb-seed:$IMAGE_TAG"

BUILD_PUSH="$ROOT_DIR/scripts/release/build-push-image-multiarch.sh"

echo "Using container CLI: $CONTAINER_CLI"
echo "Image platforms: $IMAGE_PLATFORMS"
echo "Publishing images:"
echo "  $WEB_IMAGE"
echo "  $API_IMAGE"
echo "  $SEED_IMAGE"
echo "Publishing npm package with tag: $NPM_TAG"

echo ""
echo "Building and pushing web image..."
sh "$BUILD_PUSH" "$WEB_IMAGE"

echo ""
echo "Building and pushing api image..."
sh "$BUILD_PUSH" -f Dockerfile.api "$API_IMAGE"

echo ""
echo "Building and pushing seed image..."
sh "$BUILD_PUSH" -f Dockerfile.seed "$SEED_IMAGE"

echo ""
echo "Building MCP package..."
pnpm mcp:build

echo ""
echo "Publishing @openaisdk/amb-mcp to npm..."
cd "$ROOT_DIR/packages/mcp-server"
npm publish --access public --tag "$NPM_TAG"

echo ""
echo "Public artifacts published successfully."
