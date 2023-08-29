#!/bin/bash
# @Author: Andrian Putina
# @Date:   2023-06-02 11:27:53
# @Last Modified by:   Andrian Putina
# @Last Modified time: 2023-06-09 10:02:19
#!/bin/bash
IMAGE_TYPE=$1
VERSION=0.0.1

if [ "$IMAGE_TYPE" = "frontend" ]; then
    echo "Building frontend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./frontend -f frontend/Dockerfile-prod-nobuild -t $IMAGE_TYPE:$VERSION
    docker image push $IMAGE_TYPE:$VERSION
elif [ "$IMAGE_TYPE" = "backend" ]; then
    echo "Building backend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./backend -f backend/Dockerfile -t $IMAGE_TYPE:$VERSION
    docker image push $IMAGE_TYPE:$VERSION
elif [ "$IMAGE_TYPE" = "all" ]; then
    echo "Building frontend/backend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./backend -f backend/Dockerfile -t backend:$VERSION
    docker build ./frontend -f frontend/Dockerfile-prod -t frontend:$VERSION
    docker image push frontend:$VERSION
    docker image push backend:$VERSION
else
    echo "UNKOWN IMAGE TYPE: $IMAGE_TYPE"
fi

