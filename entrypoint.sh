#!/usr/bin/env bash

echo "running entrypoint: ${*}"

export INPUT_EXAMPLE="${1}"

node /action/dist/index.js
