#!/usr/bin/env bash
set -eu

if [ "$BRANCH" = "main" ]; then
  NAME=party
  PORT=3000
elif [ "$BRANCH" = "dev" ]; then
  NAME=party-dev
  PORT=3001
else
  echo "Kein Deploy für Branch $BRANCH"
  exit 0
fi

IMAGE=ghcr.io/atomarverseucht/atomsawardwinningpartyproject:$BRANCH

sudo docker pull "$IMAGE"
sudo docker stop "$NAME" || true
sudo docker rm "$NAME" || true
sudo docker run -d --name "$NAME" -p "$PORT":3000 --restart unless-stopped "$IMAGE"
sudo docker image prune -f