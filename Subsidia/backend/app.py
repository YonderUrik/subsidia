from flask import Flask, request
import vars as VARS
from datetime import timedelta
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

app = Flask(__name__)

jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = VARS.JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

@app.after_request
def add_header(response):
    response.headers.add('Access-Control-Allow-Origin','http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers','Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS')

     # Handle OPTIONS request
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, DELETE, OPTIONS'
        return response
    
    return response

import authentication.authentication as auth
app.register_blueprint(auth.bp)

import raccolte.raccolte as raccolte
app.register_blueprint(raccolte.bp)

 

# Main Route
@app.route("/")
def index():
    pass

if __name__ == "__main__":
    app.run(debug=True, port=VARS.APP_DEBUG_PORT)