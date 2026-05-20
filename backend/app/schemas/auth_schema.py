from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    accessToken: str
    refreshToken: str
    user: dict


class RefreshRequest(BaseModel):
    refreshToken: str
