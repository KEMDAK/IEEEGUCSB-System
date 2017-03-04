#!/usr/bin/env bash
sudo apt-get remove --purge "^mysql.*"
sudo apt-get autoremove
sudo apt-get autoclean
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/log/mysql
echo mysql-apt-config mysql-apt-config/select-server select mysql-5.7 | 
sudo debconf-set-selections
wget http://dev.mysql.com/get/mysql-apt-config_0.6.0-1_all.deb
sudo dpkg -i mysql-apt-config_0.6.0-1_all.deb
sudo apt-get update -q
sudo apt-get install mysql-server -y
sudo service mysql start
mysql --version