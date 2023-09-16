from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from authentication.mongo import AuthMongo
from dipendenti.mongo import DipendentiMongo
from datetime import datetime
import vars as VARS
import json
import user_limitations as USER
import pandas as pd

bp = Blueprint('dipendenti', __name__, url_prefix='/api/dipendenti')

# Function to distribute the integer amount
def distribute_integer_amount(df, amount):
    for index, row in df.iterrows():
        remaining_pay = row['pay'] - row['payed']
        if remaining_pay >= amount:
            df.at[index, 'payed'] += amount
            amount -= amount
        elif remaining_pay > 0:
            df.at[index, 'payed'] += remaining_pay
            amount -= remaining_pay
        if amount == 0:
            break
    return df

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
        elif operaio_info[0]['is_active'] == False:
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
    
    if status != 200:
        return {"message" : res}, status
    
    return json.dumps(res, default=str)

@bp.route('/get-operai-summary', methods=["POST"])
@USER.has_dipendenti()
def get_operai_summary():
    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.get_operai_summary(db_name=db_name)
    
    if status != 200:
        return {"message" : res}, status
    
    return json.dumps(res, default=str)

@bp.route('/set-new-acconto', methods=["POST"])
@USER.has_dipendenti()
def set_new_acconto():
    input_operai_list = request.json.get("operai")
    amount = int(request.json.get("amount"))

    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.get_giornate_to_pay(db_name=db_name, operai_list=input_operai_list)
    
    if status != 200:
        return {"message" : res}, status
    
    df = pd.DataFrame(res)
    
    # Controllo che tutti gli operai inseriti abbiano almeno una giornata da saldare
    df_unique_operai = set(df['operaio'].unique())
    expected_operai = set(input_operai_list)
    diff_operai = expected_operai - df_unique_operai
    if len(diff_operai) > 0:
        return {"message":'I seguenti operai non hanno giornate da saldare: {}'.format(list(diff_operai))}

    # Controllo che l'acconto sia al massimo quanto l'operaio deve ricevere
    for operaio in input_operai_list:
        db_operaio = df[df['operaio'] == operaio].copy()
        value_to_pay = db_operaio['pay'].sum()
        value_payed = db_operaio['payed'].sum()
        
        if (value_to_pay-value_payed) < amount:
            return {"message" : "L'operaio [{}] non può ricevere più di quanto gli spetta".format(operaio)}, 400
    
    # Distribuisco l'ammontare per le giornate di ogni singolo operaio
    for operaio in input_operai_list:
        db_operaio = df[df['operaio'] == operaio].copy()
        db_operaio = distribute_integer_amount(db_operaio, amount)
        df.update(db_operaio, overwrite=True)
    
    status, msg, dev_msg = mongo.update_giornate_after_acconto(db_name=db_name, df=df)
    return {"message" : msg}, status

@bp.route('/delete-giornata', methods=["POST"])
@USER.has_dipendenti()
def delete_giornata():
    id = request.json.get("id")

    user_email = get_jwt_identity()['email']
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)
    db_name = str(user_info['_id'])

    mongo = DipendentiMongo()

    status, res, dev_msg = mongo.delete_giornata(db_name=db_name, id=id)

    return {'message' : res}, status






        




