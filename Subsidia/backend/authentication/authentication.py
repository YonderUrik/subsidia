from flask import request, Blueprint, current_app
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authentication.mongo import AuthMongo
from email_driver import send_email
import random

bp = Blueprint('auth', __name__, url_prefix='/api')

# Login API
# Expected email and password as JSON


@bp.route('/login', methods=["POST"])
def login():
    try:
        mongo = AuthMongo()
        _email = request.json.get("email")
        _password = request.json.get("password")

        user_exists = mongo.get_usr_by_email(_email)

        if not user_exists:
            return {"message": "Credenziali errate"}, 401

        if user_exists['need_reset'] is True:
            return {"message": "L'utente ha bisogno di impostare la password", "status": 300}, 300

        if not check_password_hash(user_exists['password'], _password):
            return {"message": "Credenziali errate"}, 401

        user_auth_token = {"email": user_exists['email']}

        token = create_access_token(
            identity=user_auth_token, expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
        return {"token": token, "user": user_auth_token}, 200
    except Exception as e:
        print(str(e))
        return {"message": "Qualcosa è andato storto"}, 500


@bp.route('/reset-password', methods=["POST"])
def resetpassword():
    mongo = AuthMongo()
    _email_to_verify = request.json.get("email")

    user_info = mongo.get_usr_by_email(_email_to_verify)

    if not user_info:
        return {"message": "Email inviata"}, 200

    random_code = random.randint(100000, 999999)
    if mongo.set_user_need_psw(_email_to_verify, random_code) is True:
        msg_to_send = f"""
        <h1>Reset Password</h1>
        <p>Gentile utente,</p>
        <p>Hai richiesto il reset della password per il tuo account.</p>
        <p>Di seguito trovi il codice di reset:</p>
        <h2>Codice di Reset: <span style="color: blue;">{random_code}</span></h2>
        <p>Inserisci il codice per completare la procedura.</p>
        <p>Se non hai richiesto il reset della password, ti consigliamo di contattarci immediatamente.</p>
        """
        recipient = user_info['email']
        subject = f"Conferma reset password Subsidia"

        if send_email(recipient, subject, msg_to_send) is True:
            return {"message": f"È stata inviata una mail al seguente indirizzo : {recipient}. Inserisci il codice ricevuto"}, 200
        else:
            return {"message": f"Something went wrong, retry"}, 500


@bp.route('/my-account', methods=["GET"])
@jwt_required()
def myaccount():
    current_user = get_jwt_identity()
    return {"user": current_user}, 200
