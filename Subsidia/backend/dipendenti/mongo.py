from mongo import BaseMongo
import vars as VARS
from bson.objectid import ObjectId


class DipendentiMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """

    def __init__(self):
        """
        Init DipendentiMongo -> Extend BaseMongo 
        """
        super(DipendentiMongo, self).__init__()

    def get_dipendenti_info(self, db_name, is_active=None):
        try:
            query = {}
            if is_active:
                query['is_active'] = True

            return 200, list(self.client[db_name][VARS.DIPENDENTI_INFO_COLLECTION].find(query, {'name': 1})), VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def add_new_raccolta(self, db_name, data):
        try:
            self.client[db_name][VARS.RACCOLTE_COLLECTION].insert_one(data)
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def add_new_operaio(self, db_name, operaio):
        try:
            self.client[db_name][VARS.DIPENDENTI_INFO_COLLECTION].insert_one(
                {"name": operaio, "is_active": True})
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def active_operaio(self, db_name, operaio):
        try:
            self.client[db_name][VARS.DIPENDENTI_INFO_COLLECTION].update_one(
                {"name": operaio}, {"$set": {"is_active": True}})
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def add_giornate(self, db_name, data):
        try:
            self.client[db_name][VARS.GIORNATE_COLLECTION].insert_many(
                data)
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def get_last_giorante(self, db_name):
        try:
            sort = {"$sort": {"_id": -1}}
            limit = {"$limit": 500}
            return 200, list(self.client[db_name][VARS.GIORNATE_COLLECTION].aggregate([sort, limit])), ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
