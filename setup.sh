#!/bin/bash
npx -y create-next-app@latest invisible-yield \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --eslint \
  --turbopack
