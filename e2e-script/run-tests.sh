#!/usr/bin/env bash
docker-compose up -d --build
docker-compose run contracts ./deploy.sh
docker-compose run -d bridge npm run watcher:signature-request
docker-compose run -d bridge npm run watcher:collected-signatures
docker-compose run -d bridge npm run watcher:affirmation-request
docker-compose run -d bridge npm run sender:home
docker-compose run -d bridge npm run sender:foreign
docker-compose run -d ui npm start
docker-compose run e2e npm run startE2e
rc=$?
docker-compose down
exit $rc
