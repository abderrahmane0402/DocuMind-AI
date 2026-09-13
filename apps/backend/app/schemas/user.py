from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    display_name: str

class UserCreate(UserBase):
    password: str

class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}

class UserResponse(UserBase):
    id: uuid.UUID
    global_status: str
    created_at: datetime
    workspaces: list[WorkspaceResponse] = []
    
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
