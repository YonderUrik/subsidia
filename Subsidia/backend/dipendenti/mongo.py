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

            return 200, list(self.client[db_name][VARS.DIPENDENTI_INFO_COLLECTION].find(query)), VARS.SUCCESS_MESSAGE
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
        
    def edit_giornata_operi(self, db_name, id, data):
        try:
            self.client[db_name][VARS.GIORNATE_COLLECTION].update_one({"_id" : ObjectId(id)}, {"$set" : data})
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def get_last_giorante(self, db_name):
        try:
            sort = {"$sort": {"date": -1}}
            limit = {"$limit": 500}
            return 200, list(self.client[db_name][VARS.GIORNATE_COLLECTION].aggregate([sort, limit])), ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def get_giornate_to_pay(self, db_name, operai_list):
        pipeline = [
            {
                "$match": {
                    "operaio": {"$in": operai_list}
                }
            },
            {
                "$addFields": {
                    "payed_lt_pay": {"$lt": ["$payed", "$pay"]}
                }
            },
            {
                "$match": {
                    "payed_lt_pay": True
                }
            },
            {
                "$sort": {
                    "date": 1
                }
            }
        ]

        try:
            return 200, self.client[db_name][VARS.GIORNATE_COLLECTION].aggregate(pipeline), ""
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def update_giornate_after_acconto(self, db_name, df):
        try:
            # Iterate through the DataFrame and update documents in MongoDB
            for index, row in df.iterrows():
                _id = row['_id']
                payed_value = row['payed']

                # Update the document in MongoDB using the '_id' field
                self.client[db_name][VARS.GIORNATE_COLLECTION].update_one(
                    {'_id': _id},
                    {'$set': {'payed': payed_value}}
                )
            return 200, VARS.SUCCESS_MESSAGE, "OK"
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def get_operai_summary(self, db_name):
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$operaio",  # Group by the "operaio" field
                        "total_pay": {"$sum": "$pay"},  # Sum the "pay" field
                        "total_payed": {"$sum": "$payed"},  # Sum the "payed" field
                        "total_type": {
                            "$sum": {
                                "$cond": [
                                    {"$eq": ["$type", 0]},  # Check if type is 0
                                    0.5,  # If type is 0, add 0.5
                                    1.0,  # If type is not 0, add 1.0
                                ]
                            }
                        }
                    }
                }
            ]
            return 200, list(self.client[db_name][VARS.GIORNATE_COLLECTION].aggregate(pipeline)), "ok"
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def delete_giornata(self, db_name, id):
        try:
            self.client[db_name][VARS.GIORNATE_COLLECTION].delete_one({"_id" : ObjectId(id)})

            return 200, VARS.SUCCESS_MESSAGE, "Giornata eliminata"
        
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        

