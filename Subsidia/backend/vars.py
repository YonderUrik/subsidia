import os
from dotenv import load_dotenv
load_dotenv()

# ENVIRONMENTS
# - JWT_SECRET_KEY
# - APP_DEBUG_PORT

try:
    JWT_SECRET_KEY = open(os.environ.get('JWT_SECRET_KEY')).read()
except Exception:
    JWT_SECRET_KEY = 'testing'

try:
    APP_DEBUG_PORT = int(os.getenv("APP_DEBUG_PORT"))
except:
    APP_DEBUG_PORT = 5000

MONGO_HOST = '127.0.0.1:27017'
DB_NAME = 'subsidia'
USERS_COLLECTION = 'users'
RACCOLTE_COLLECTION = 'raccolte'


# MESSAGES

ERROR_MESSAGE = "Qualcosa non ha funzionato, riprova"
SUCCESS_MESSAGE = "Operazione riuscita con successo"
