from pymongo import MongoClient
import vars as VARS
import logging
import os
from bson.objectid import ObjectId

logger = logging.getLogger(__name__)


class BaseMongo(object):
    """
    BaseMongo class. Extend it based on apps. 
    Useful only for connection.
    """

    def __init__(self):
        """
        Create client connection
        """
        super(BaseMongo, self).__init__()
        # Read MongoDB secrets from Docker secrets
        mongodb_username = open('/run/secrets/mongodb-root-username', 'r').read().strip()
        mongodb_password = open('/run/secrets/mongodb-root-password', 'r').read().strip()
        self.client = MongoClient(VARS.MONGO_HOST, username=mongodb_username, password=mongodb_password)

    def close(self):
        """
        Close client conection
        """
        self.client.close()

   