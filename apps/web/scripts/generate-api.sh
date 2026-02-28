#!/bin/bash

# Generate OpenAPI types from the running server
echo "Generating OpenAPI types from server..."

# Make sure the server is running on localhost:4000
curl -f http://localhost:4000/openapi.json -o /tmp/openapi.json

if [ $? -eq 0 ]; then
  # Generate types in the shared package
  cd /home/arun/workspace/better-native/better-next
  npx openapi-typescript /tmp/openapi.json -o packages/shared/types/api.ts
  echo "✅ API types generated successfully!"
else
  echo "❌ Failed to fetch OpenAPI spec. Make sure the server is running on localhost:4000"
  exit 1
fi
