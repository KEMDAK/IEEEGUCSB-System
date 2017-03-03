#!/usr/bin/env bash
sudo apt-get remove --purge "^mysql.*"
sudo apt-get autoremove
sudo apt-get autoclean
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/log/mysql
sudo apt-get update -q
sudo apt-get install mysql-server -y
mysql --version