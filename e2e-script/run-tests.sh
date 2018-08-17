#!/usr/bin/env bash
docker-compose up -d --build
cd ..
npm run start:blocks &
cd e2e-script
docker-compose run contracts ./deploy.sh
docker-compose run -d bridge npm run watcher:signature-request
docker-compose run -d bridge npm run watcher:collected-signatures
docker-compose run -d bridge npm run watcher:affirmation-request
docker-compose run -d bridge npm run sender:home
docker-compose run -d bridge npm run sender:foreign
docker-compose run -d ui nginx -g 'daemon off;'
echo "Waiting for blocks being generated"
sleep 5m
cd ..
npm run startE2e
rc=$?
cd e2e-script
docker-compose down
exit $rc
