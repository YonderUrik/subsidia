from mongo import BaseMongo
import vars as VARS
from bson.objectid import ObjectId


class RaccolteMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """

    def __init__(self):
        """
        Init RaccolteMongo -> Extend BaseMongo 
        """
        super(RaccolteMongo, self).__init__()

    def add_new_raccolta(self, db_name, data):
        try:
            self.client[db_name][VARS.RACCOLTE_COLLECTION].insert_one(data)
            return 200, VARS.SUCCESS_MESSAGE, ''
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def get_distinct_value(self, db_name, field):
        try:
            return 200, self.client[db_name][VARS.RACCOLTE_COLLECTION].distinct(field), VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)

    def get_distinct_years(self, db_name):
        try:
            pipeline = [
                {
                    "$project": {
                        # Extract year from the 'date' field
                        "year": {"$year": "$date"}
                    }
                },
                {
                    "$group": {
                        "_id": "$year",  # Group by year
                    }
                },
                {
                    "$sort": {"_id": -1}  # Optional: Sort results by year
                }
            ]
            # Execute the aggregation pipeline and convert the result to a list
            distinct_years_result = list(
                self.client[db_name][VARS.RACCOLTE_COLLECTION].aggregate(pipeline))

            # Extract the distinct years from the result array
            distinct_years = [year["_id"] for year in distinct_years_result]

            return 200, distinct_years, VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def get_data(self, db_name, year):
        try:
            # Query for documents with the current year in the date field
            query = {
                "$expr": {
                    "$eq": [
                        {"$year": "$date"},  # Extract year from the 'date' field
                        year
                    ]
                }
            }

            documents = self.client[db_name][VARS.RACCOLTE_COLLECTION].find(query)

            return 200, list(documents), VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def get_single_doc(self, db_name, id):
        try:
            return 200, self.client[db_name][VARS.RACCOLTE_COLLECTION].find_one({"_id": ObjectId(id)}), VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def edit_raccolta(self, db_name, data, id):
        try:
            self.client[db_name][VARS.RACCOLTE_COLLECTION].update_one({"_id": ObjectId(id)},{"$set" : data})
            return 200, VARS.SUCCESS_MESSAGE, VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)
        
    def delete_rows(self, db_name, ids):
        try:
            id_list = [ObjectId(id_val) for id_val in ids]
            filter = {'_id': {'$in': id_list}}
            self.client[db_name][VARS.RACCOLTE_COLLECTION].delete_many(filter)
            return 200, VARS.SUCCESS_MESSAGE, VARS.SUCCESS_MESSAGE
        except Exception as e:
            return 500, VARS.ERROR_MESSAGE, str(e)