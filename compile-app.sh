
# compile react
cd ./ui
npm run build
cd ..

# move assets to app
rm -rf ./app/www
mv ./ui/build ./app/www

# compile app
cd ./app
cordova build android