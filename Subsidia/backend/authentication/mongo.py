
from mongo import BaseMongo
import vars as VARS

class AuthMongo(BaseMongo):
    """
    Mongo driver for authentication queries
    """
    def __init__(self):
        """
        Init AuthMongo -> Extend BaseMongo 
        """
        super(AuthMongo, self).__init__()

    def get_usr_by_email(self, email):
        """
        Get user info
        """
        try:
            return self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].find_one({"email": email})
        except Exception as e:
            print(str(e))
            self.close()
            return None
        
    def set_user_need_psw(self,email, code):
        """
        Set need_reset to True for an user
        """
        try:
            self.client[VARS.DB_NAME][VARS.USERS_COLLECTION].update_one({"email":email}, {"$set": {"confirm_code":code}})
            return True
        except Exception as e:
            self.close()
            print(str(e))
            return False