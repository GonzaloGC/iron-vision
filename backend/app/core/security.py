import hashlib
import secrets


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${pwd_hash}"


def verify_password(plain_password: str, hashed: str) -> bool:
    try:
        salt, pwd_hash = hashed.split("$")
        return hashlib.sha256((salt + plain_password).encode()).hexdigest() == pwd_hash
    except (ValueError, AttributeError):
        return False
