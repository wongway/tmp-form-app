# Realm App Configs

## To update realm configs

Log-in to realm:
> realm-cli login

Pull the latest version of the Realm app configs
> realm-cli pull

Push local config changes up to the cloud
> realm-cli push

## Generate language-specific structs from schemas

You'll need to trim first two lines from the new schema file.

> realm-cli schemas datamodels -l javascript --flat -o ../src/schema.js -y
> realm-cli schemas datamodels -l typescript --flat -o ../src/schema.js -y

## The apps

* fitness-app: syncs with the `test` database -- currently being used in the `main` and `develop` branches. This should  
* form-app: syncs with the `demo` database -- currently being used by Tony for the `stat_tracking_43` branch