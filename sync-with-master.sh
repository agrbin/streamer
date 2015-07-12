set -e

branch=$(git rev-parse --abbrev-ref HEAD)

if [ ! -d .git ]; then
  echo "position yourself in root of gh-pages to call this.";
  exit 1
fi

if [ $branch != "gh-pages" ]; then
  echo "position yourself in root of gh-pages to call this.";
  exit 1
fi

git co master -- client
mv client/* .
rm -rf client
git add --all
git commit -m 'syncing gh-pages with master branch.'
git push
