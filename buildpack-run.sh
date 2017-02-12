#!/bin/sh
REPO=https://github.com/brennakatphotography/ui-server.git
DIR=ui-server

if [ ! -d "$DIR" ]; then
  git clone $REPO $DIR
fi
cd $DIR
echo "Pulling latest UI-Server Changes..."
git reset --hard HEAD > /dev/null
git checkout master > /dev/null
git pull -r > /dev/null
echo "Installing UI-Server dependencies"
npm install --only=production
echo "Building UI-Server"
npm run build
cd - > /dev/null
