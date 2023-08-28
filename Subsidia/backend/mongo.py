from pymongo import MongoClient
import vars as VARS
import logging
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
        self.client = MongoClient(VARS.MONGO_HOST)

    def close(self):
        """
        Close client conection
        """
        self.client.close()

   