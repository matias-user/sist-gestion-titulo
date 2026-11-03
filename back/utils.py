from passlib.context import CryptContext

# Configuramos Bcrypt como nuestro algoritmo de hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Recibe la contraseña en texto plano y devuelve el hash encriptado."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara la contraseña ingresada con el hash guardado en la BBDD."""
    return pwd_context.verify(plain_password, hashed_password)