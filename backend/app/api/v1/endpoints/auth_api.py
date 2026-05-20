from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Response
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.auth_schema import LoginRequest, LoginResponse, RefreshRequest
from app.services.auth_service import login_service, refresh_token_service
from app.services.rate_limit_service import check_rate_limit

router = APIRouter( tags=["Auth"])


def set_auth_cookies(response: Response, auth_payload: LoginResponse):
    response.set_cookie(
        key="access_token",
        value=auth_payload["accessToken"],
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 12,
    )
    response.set_cookie(
        key="refresh_token",
        value=auth_payload["refreshToken"],
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60 * 24 * 7,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    data: LoginRequest,
    response: Response,
    session: Session = Depends(get_session),
):
    check_rate_limit(data.email.lower())
    auth_payload = login_service(session, data.email, data.password)
    set_auth_cookies(response, auth_payload)
    return auth_payload


@router.post("/refresh", response_model=LoginResponse)
def refresh(
    response: Response,
    data: RefreshRequest | None = Body(default=None),
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    token = data.refreshToken if data else refresh_token
    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    auth_payload = refresh_token_service(session, token)
    set_auth_cookies(response, auth_payload)
    return auth_payload


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}
