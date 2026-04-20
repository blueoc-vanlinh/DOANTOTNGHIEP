from sqlalchemy import text
from app.db.session import engine

def reset_db():
    with engine.connect() as conn:
        conn.execute(text("""
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;
        """))
        conn.commit()

    print("✅ Database reset successfully!")

if __name__ == "__main__":
    reset_db()