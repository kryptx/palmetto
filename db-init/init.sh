#!/bin/bash
HOST=${COUCHDB_HOSTNAME:-127.0.0.1}
USER=${COUCHDB_USER:-couchdb}
PASS=${COUCHDB_PASSWORD:-$(pwgen -s -1 16)}
DB=${COUCHDB_DBNAME:-}
URL=http://$USER:$PASS@$HOST:5984
echo "URL is $URL"
# Start CouchDB service
echo "Waiting for couch to be up."
while ! nc -vz db 5984; do sleep 1; done

curl -X PUT $URL/_users
curl -X PUT $URL/_replicator
curl -X PUT $URL/_global_changes

# Create User
echo "Creating user: \"$USER\"..."
curl -X PUT $URL/_config/admins/$USER -d '"'${PASS}'"'

# Create Database
if [ ! -z "$DB" ]; then
    echo "Creating database: \"$DB\"..."
    curl -X PUT $URL/$DB

    curl -X PUT $URL/users/_design/by-username --data '{"views": {"username": {"map": "function(doc) { emit(doc.username, null) }"}}}' 
fi

echo "========================================================================"
echo "CouchDB User: \"$USER\""
echo "CouchDB Password: \"$PASS\""
if [ ! -z "$DB" ]; then
    echo "CouchDB Database: \"$DB\""
fi
echo "========================================================================"
