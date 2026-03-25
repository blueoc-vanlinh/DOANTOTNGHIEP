alembic revision --autogenerate -m "init full schema"

alembic upgrade head 

alembic revision --autogenerate -m "update ..."