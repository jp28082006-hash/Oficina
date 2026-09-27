#!/usr/bin/env bash
# Script de build do backend para o Render (ou qualquer host similar).
set -o errexit

pip install -r backend/requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
