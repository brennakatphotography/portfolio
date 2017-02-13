#!/bin/sh
REPO=https://github.com/brennakatphotography/ui-server.git
DIR=ui-server
export STATIC_FOLDER=$(pwd)/$1

if [ -z "$PORT" ]; then
  export PORT=$2
fi

if [ ! -d "$DIR" ]; then
  git clone $REPO $DIR
fi

cd $DIR
echo "**************************************"
echo "** Pulling latest UI-Server Changes **"
echo "**************************************"
git reset --hard HEAD
git checkout master
git pull -r
echo "***************************************"
echo "** Installing UI-Server dependencies **"
echo "***************************************"
npm install
echo "************************************"
echo "** Building and Running UI-Server **"
echo "************************************"
npm start