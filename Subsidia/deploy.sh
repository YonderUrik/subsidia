#!/bin/bash
# @Author: Andrian Putina
# @Date:   2023-06-05 14:36:41
# @Last Modified by:   Andrian Putina
# @Last Modified time: 2023-06-09 10:28:48
OPERATION=$1

if [ "$OPERATION" = "stop" ]; then
	echo "Removing subsidia stack... 5 seconds to stop"
	# sleep 5
	docker stack rm subsidia
else
    docker stack deploy -c docker-compose.yml subsidia
fi