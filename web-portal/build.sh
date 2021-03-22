SHA1=$(git rev-parse HEAD | cut -c 1-8)
BRANCH=$(git branch --show-current)
TAG=$BRANCH-$SHA1
# TAG=$CIRCLE_BUILD_NUM-$CIRCLE_BRANCH-$CIRCLE_SHA1
# Move the UI code into place here
saved_dir=$(pwd)
echo "Buiding the ui"
cd ../ui/medir-ui
yarn install
yarn audit --level moderate
yarn build
cd $saved_dir

echo "Building the web-portal"
mv ../ui/medir-ui/build/ ./build/
docker build -t mitchelljthomas/medir-portal:$TAG --label "github-commit=$SHA1" --label "branch=$BRANCH" --build-arg circle_ci_image_tag=medir-portal:$TAG .
docker push mitchelljthomas/medir-portal:$TAG
