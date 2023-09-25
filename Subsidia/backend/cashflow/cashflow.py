from flask import request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from authentication.mongo import AuthMongo
from cashflow.mongo import CashFlowMongo
from datetime import datetime
import vars as VARS
import json
import user_limitations as USER
import pandas as pd

bp = Blueprint('cashflow', __name__, url_prefix='/api/cashflow')

@USER.has_cashflow()
@bp.route('/get-main-sub-categories', methods=["POST"])
def get_main_sub_categories():
    
