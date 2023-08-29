#!/bin/bash
# @Author: Andrian Putina
# @Date:   2023-06-02 11:27:53
# @Last Modified by:   Andrian Putina
# @Last Modified time: 2023-06-09 10:02:19
#!/bin/bash
IMAGE_TYPE=$1
VERSION=0.0.1
REGISTRY_HOST=localhost:7452

if [ "$IMAGE_TYPE" = "frontend" ]; then
    echo "Building frontend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./frontend -f frontend/Dockerfile-prod -t $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
    docker image push $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
elif [ "$IMAGE_TYPE" = "backend" ]; then
    echo "Building backend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./backend -f backend/Dockerfile -t $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
    docker image push $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
elif [ "$IMAGE_TYPE" = "all" ]; then
    echo "Building backend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./backend -f backend/Dockerfile -t $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
    docker image push $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
    echo "Building frontend image. You have 5 seconds to stop the script"
    sleep 5
    docker build ./frontend -f frontend/Dockerfile-prod -t $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
    docker image push $REGISTRY_HOST/apps/$IMAGE_TYPE:$VERSION
else
    echo "UNKOWN IMAGE TYPE: $IMAGE_TYPE"
fi

