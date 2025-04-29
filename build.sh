echo "Terminal-snake build via pkg"
echo "Will fail if you dont have pkg"
echo ""

# remove old builds
if [ -d "build" ]; then
  find "$folder_path" -mindepth 1 -delete
  echo "Old builds removed."
else
  mkdir build
  echo "No existing build directory found"
fi

# ask if on ARM
while true; do
  read -p "Are you on ARM? (y/n)" answer

  case "$answer" in
    [Yy]*)
      target="arm"
      break
      ;;
    [Nn]*)
      target="x64"
      break
      ;;
    *)
      ;;
  esac
done

# build
echo "Building for windows $target"
pkg snake.js -o build/snake-node18-win-${target} -t node18-win-${target}
echo "Building for linux $target"
pkg snake.js -o build/snake-node18-linux-${target} -t node18-linux-${target}
echo "Building for macos $target"
pkg snake.js -o build/snake-node18-macos-${target} -t node18-macos-${target}

# end
echo ""
echo "Build successfully"
echo "Result in ./build"
