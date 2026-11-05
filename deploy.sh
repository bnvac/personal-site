#!/bin/sh
# Rebuild the front page and make bnvac.com exactly match site/.
#
#   ./deploy.sh            deploy
#   ./deploy.sh --dry-run  show what would be uploaded and deleted, change nothing
#
# --prune deletes every file on Neocities that is not in site/, so the live
# site is always a mirror of this folder. Nothing outside site/ is uploaded.
set -e
cd "$(dirname "$0")"

command -v neocities >/dev/null 2>&1 || { echo "Install the Neocities CLI first: gem install neocities"; exit 1; }

python3 wallet/build.py
python3 wallet/export.py

neocities push --prune "$@" site
