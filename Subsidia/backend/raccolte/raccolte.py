from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from authentication.mongo import AuthMongo
from raccolte.mongo import RaccolteMongo
from datetime import datetime
import vars as VARS
import json
import user_limitations as USER

bp = Blueprint('raccolte', __name__, url_prefix='/api/raccolte')

@bp.route('/edit-raccolta', methods=["POST"])
@USER.has_raccolte()
def edit_raccolta():
    user_email = get_jwt_identity()['email']
    request_data = request.json.get('data')
    id = request.json.get('id')

    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    # Convert strings to float
    request_data['weight'] = float(request_data['weight'])
    request_data['price'] = float(request_data['price'])
    request_data['revenue'] = float(request_data['revenue'])
    request_data['date'] = datetime.strptime(request_data['date'], "%Y-%m-%dT%H:%M:%S.%fZ")

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, msg, msg_dev = mongo.edit_raccolta(db_name, request_data, id)
    print(msg_dev)
    return {"message" : msg}, status

@bp.route('/new-raccolta', methods=["POST"])
@USER.has_raccolte()
def new_raccolta():
    user_email = get_jwt_identity()['email']
    request_data = request.json.get('data')

    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    # Convert strings to float
    request_data['weight'] = float(request_data['weight'])
    request_data['price'] = float(request_data['price'])
    request_data['revenue'] = float(request_data['revenue'])
    request_data['date'] = datetime.strptime(request_data['date'], "%Y-%m-%dT%H:%M:%S.%fZ")

    db_name = str(user_info['_id'])

    mongo = RaccolteMongo()

    status, msg, msg_dev = mongo.add_new_raccolta(db_name, request_data)
    return {"message" : msg}, status

@bp.route('/get-distinct-value', methods=["POST"])
@USER.has_raccolte()
def get_distinct_value():
    user_email = get_jwt_identity()['email']
    field_to_get = request.json.get('value')
    
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, res, msg_dev = mongo.get_distinct_value(db_name, field_to_get)

    if status != 200:
        return {"message" : VARS.ERROR_MESSAGE}, status
    
    return json.dumps(res, default=str)

@bp.route('/get-distinct-years', methods=["GET"])
@USER.has_raccolte()
def get_distinct_years():
    user_email = get_jwt_identity()['email']

    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, res, msg_dev = mongo.get_distinct_years(db_name)

    if status != 200:
        return {"message" : VARS.ERROR_MESSAGE}, status
    
    return json.dumps(res, default=str)
    
@bp.route('/get-data', methods=["POST"])
@USER.has_raccolte()
def get_data():
    year = request.json.get('year')
    
    user_email = get_jwt_identity()['email']

    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, res, msg_dev = mongo.get_data(db_name, year)

    if status != 200:
        return {"message" : VARS.ERROR_MESSAGE}, status
    
    return json.dumps(res, default=str)

@bp.route('/get-single-doc', methods=["POST"])
@USER.has_raccolte()
def get_single_doc():
    _id = request.json.get('id')
    user_email = get_jwt_identity()['email']
    
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, res, msg_dev = mongo.get_single_doc(db_name, _id)

    if status != 200:
        return {"message" : VARS.ERROR_MESSAGE}, status
    
    return json.dumps(res, default=str)

@bp.route('/delete-rows', methods=["POST"])
@USER.has_raccolte()
def delete_rows():
    _ids = request.json.get('ids')

    print(_ids)

    user_email = get_jwt_identity()['email']
    
    mongo = AuthMongo()
    user_info = mongo.get_usr_by_email(user_email)

    db_name = str(user_info['_id'])
    mongo = RaccolteMongo()

    status, msg, msg_dev = mongo.delete_rows(db_name, _ids)

    return {"message" : msg}, status





