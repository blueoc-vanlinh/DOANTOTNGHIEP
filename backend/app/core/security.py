# from passlib.context import CryptContext
# from jose import jwt
# from datetime import datetime, timedelta

# SECRET_KEY = "secret"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 60

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # hash password
# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)

# # verify password
# def verify_password(plain, hashed):
#     return pwd_context.verify(plain, hashed)

# # create token
# def create_access_token(data: dict):
#     to_encode = data.copy()
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)