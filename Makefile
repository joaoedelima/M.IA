.PHONY: run dev check docker-build docker-run

run:
	npm start

dev:
	npm run dev

check:
	node --check app.js
	node --check server.js

docker-build:
	docker build -t mia-studio:latest .

docker-run:
	docker run --rm -p 3000:3000 mia-studio:latest
