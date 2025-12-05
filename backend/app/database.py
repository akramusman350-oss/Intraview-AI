from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from functools import lru_cache
import os

MONGODB_URI_ENV = "MONGODB_URI"
MONGODB_DB_NAME_ENV = "MONGODB_DB_NAME"


class Database:
    """
    Simple wrapper around Motor client and database selection.
    """

    def __init__(self, uri: str, db_name: str):
        self._client = AsyncIOMotorClient(uri)
        self._db = self._client[db_name]

    @property
    def client(self) -> AsyncIOMotorClient:
        return self._client

    @property
    def db(self) -> AsyncIOMotorDatabase:
        return self._db


@lru_cache(maxsize=1)
def get_database() -> Database:
    """
    Lazily create and cache the Database instance.

    Environment variables:
      - MONGODB_URI: full MongoDB connection string
      - MONGODB_DB_NAME: database name to use
    """
    uri = os.getenv(MONGODB_URI_ENV, "mongodb://localhost:27017")
    db_name = os.getenv(MONGODB_DB_NAME_ENV, "intraview_ai")
    return Database(uri=uri, db_name=db_name)


def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency-friendly accessor that returns the Motor database.
    """
    return get_database().db


