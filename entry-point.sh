#!/bin/bash -eux

if [ ! -z ${1+x} ]; then git pull origin $1; fi

node_modules/.bin/cypress run --config baseUrl=http://kibanator:8043/ui/