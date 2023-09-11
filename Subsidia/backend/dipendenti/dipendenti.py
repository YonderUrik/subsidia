from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from authentication.mongo import AuthMongo
from dipendenti.mongo import DipendentiMongo
from datetime import datetime
import vars as VARS
import json
import user_limitations as USER

bp = Blueprint('dipendenti', __name__, url_prefix='/api/dipendenti')

@bp.route('/get-operai-info', methods=["POST"])
@USER.has_dipendenti()
def get_operai_info():
    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.get_dipendenti_info(db_name=db_name, is_active=True)

    if status != 200:
        return {"message" : res}, status
    
    return json.dumps(res, default=str)

@bp.route('/set-giornata-operai', methods=["POST"])
@USER.has_dipendenti()
def set_giornata_operai():
    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.get_dipendenti_info(db_name=db_name)
    
    if status != 200:
        return {"message" : res}, status

    request_data = request.json.get("data")

    giornate_doc = []
    for operaio in request_data['operai']:
        operaio_info = [opr for opr in res if opr['name'].lower()==operaio.lower()]

        if len(operaio_info) == 0:
            # AGGIUNGERE OPERAIO ALLA LISTA DI OPERAI
            status, msg, dev_msg = mongo.add_new_operaio(db_name, operaio)
            if status != 200:
                return {"message" : msg}, status
        elif operaio_info['is_active'][0] == False:
            # RIABILITO OPERAIO
            status, msg, dev_msg = mongo.active_operaio(db_name, operaio)
            if status != 200:
                return {"message" : msg}, status

        doc_to_insert = {
            "operaio" : operaio,
            "date" : datetime.strptime(request_data['date'], "%Y-%m-%dT%H:%M:%S.%fZ"),
            "pay" : float(request_data['pay']),
            "type" : int(request_data['type']),
            "activity" : str(request_data['activity']),
            "payed" : float(0),
        }

        giornate_doc.append(doc_to_insert)

    status, msg, dev_msg = mongo.add_giornate(db_name, giornate_doc)
    return {"message" : msg}, status

@bp.route('/get-last-giornate', methods=["POST"])
@USER.has_dipendenti()
def get_last_giorante():
    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.get_last_giorante(db_name=db_name)
    print(dev_msg)
    
    if status != 200:
        return {"message" : res}, status
    
    return json.dumps(res, default=str)



        




