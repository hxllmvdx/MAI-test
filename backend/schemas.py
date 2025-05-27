import json
from datetime import datetime
from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import List, Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    n_days_notice: Optional[int] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    n_days_notice: int

    class Config:
        from_attributes = True

class OlympiadBase(BaseModel):
    title: str
    start_date: str
    end_date: str
    level: str
    duration: str
    university: str
    registration_link: str
    subjects: list[str]

    @field_validator("subjects", mode="before")
    def parse_subjects(cls, v):
        if isinstance(v, str):
            if v.strip() == "-":
                return []
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Если строка не JSON, разбиваем по запятым
                return [s.strip() for s in v.split(",") if s.strip()]
        return v

class OlympiadCreate(OlympiadBase):
    pass

class OlympiadResponse(OlympiadBase):
    id: int
    status: str
    subjects: list[str]

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    author_id: int
    olympiad_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ParticipationBase(BaseModel):
    olympiad_id: int

class ParticipationResponse(ParticipationBase):
    participation_date: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    message: str
    sent_at: datetime
    olympiad: OlympiadResponse

    class Config:
        from_attributes = True

class FilterSettings(BaseModel):
    levels: Optional[List[str]] = None
    subjects: Optional[List[str]] = None
    universities: Optional[List[str]] = None

class UserFilters(FilterSettings):
    selected_olympiads: Optional[List[int]] = None