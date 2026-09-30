import os
import logging
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("health-ai-service.db")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://healthguard:healthguard_secure_password@localhost:5432/healthguard_db"
)


def get_db_connection():
    """
    Establish a connection to the existing PostgreSQL database.
    """
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL database: {e}")
        return None


def execute_query(query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
    """
    Execute a read query against the PostgreSQL database and return rows as dictionaries.
    """
    conn = get_db_connection()
    if not conn:
        return []
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            rows = cur.fetchall()
            return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Query execution error: {e}")
        return []
    finally:
        conn.close()


def execute_statement(query: str, params: Optional[tuple] = None) -> bool:
    """
    Execute a insert/update statement against PostgreSQL database.
    """
    conn = get_db_connection()
    if not conn:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            conn.commit()
            return True
    except Exception as e:
        logger.error(f"Statement execution error: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
