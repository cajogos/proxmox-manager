#!/usr/bin/env bash
exec "$(dirname "$0")/node_modules/.bin/tsx" "$(dirname "$0")/src/index.ts" "$@"
