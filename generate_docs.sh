rm -r documentation/
jsdoc -c ./conf.json -d ./documentation -p ./package.json -t /usr/local/lib/node_modules/ink-docstrap/template/ -R README.md -r ./app
