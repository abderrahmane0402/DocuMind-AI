from typing import Any
from sqlalchemy.orm import DeclarativeBase, declared_attr
import uuid

class Base(DeclarativeBase):
    id: Any
    __name__: str
    
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

from app.models.user import User
from app.models.workspace import Workspace
from app.models.membership import Membership
