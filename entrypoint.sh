#!/bin/bash

while [ 1 ] ; do
	wait-for-it -t 5 "${CLAMD_IP:-127.0.0.1}:${CLAMD_PORT:-3310}"
	if [ $? -eq 0 ] ; then
		break
	fi
done

npm start
