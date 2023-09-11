from functools import wraps
from flask_jwt_extended import get_jwt_identity,verify_jwt_in_request


def has_raccolte():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            tags_allowed = ['raccolte']
            if any(tag in current_user['tags'] for tag in tags_allowed):
                return fn(*args, **kwargs)
            else:
                return {"message": "Modulo Raccolte non abilitato"}, 403
        return decorator
    return wrapper

def has_dipendenti():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            tags_allowed = ['dipendenti']
            if any(tag in current_user['tags'] for tag in tags_allowed):
                return fn(*args, **kwargs)
            else:
                return {"message": "Modulo Dipendenti non abilitato"}, 403
        return decorator
    return wrapper