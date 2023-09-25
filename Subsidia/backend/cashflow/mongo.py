from mongo import BaseMongo
import vars as VARS
from bson.objectid import ObjectId


class CashFlowMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """

    def __init__(self):
        """
        Init CashFlowMongo -> Extend BaseMongo 
        """
        super(CashFlowMongo, self).__init__()

    