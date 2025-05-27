import json
from datetime import datetime
from sqlalchemy import ForeignKey, String, DateTime, Boolean, Integer, Table, Column, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property
from .database import Base

user_selected_olympiad = Table(
    'user_selected_olympiad', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('olympiad_id', Integer, ForeignKey('olympiads.id'), primary_key=True)
)

user_selected_subject = Table(
    'user_selected_subject',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('olympiad_id', Integer, ForeignKey('olympiads.id'), primary_key=True),
    Column('subject', String(100))  # Просто хранит subject без ForeignKey
)

user_selected_level = Table(
    'user_selected_level',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('olympiad_id', Integer, ForeignKey('olympiads.id'), primary_key=True),
    Column('level', String(50))  # Просто хранит level без ForeignKey
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(1024))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    n_days_notice: Mapped[int] = mapped_column(Integer, default=7)

    participations: Mapped[list["Participation"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="author")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")

    selected_olympiads: Mapped[list["Olympiad"]] = relationship(
        secondary=user_selected_olympiad,
        back_populates="subscribed_users"
    )

    selected_subjects: Mapped[list["Olympiad"]] = relationship(
        secondary=user_selected_subject,
        primaryjoin="User.id == user_selected_subject.c.user_id",
        secondaryjoin="Olympiad.id == user_selected_subject.c.olympiad_id",
        foreign_keys="[user_selected_subject.c.user_id, user_selected_subject.c.olympiad_id]",
        viewonly=True,
        overlaps="subscribed_users"
    )

    selected_levels: Mapped[list["Olympiad"]] = relationship(
        secondary=user_selected_level,
        primaryjoin="User.id == user_selected_level.c.user_id",
        secondaryjoin="Olympiad.id == user_selected_level.c.olympiad_id",
        foreign_keys="[user_selected_level.c.user_id, user_selected_level.c.olympiad_id]",
        viewonly=True,
        overlaps="subscribed_users"
    )


class Olympiad(Base):
    __tablename__ = "olympiads"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    start_date: Mapped[str] = mapped_column(String(10))  # Changed to String to store dd.mm.yyyy
    end_date: Mapped[str] = mapped_column(String(10))  # Changed to String to store dd.mm.yyyy
    duration: Mapped[str] = mapped_column(String(255))
    level: Mapped[str] = mapped_column(String(50))
    subjects: Mapped[str] = mapped_column(String(100))
    university: Mapped[str] = mapped_column(String(150))
    registration_link: Mapped[str] = mapped_column(String(2048))

    comments: Mapped[list["Comment"]] = relationship(back_populates="olympiad")
    participations: Mapped[list["Participation"]] = relationship(back_populates="olympiad")
    subscribed_users: Mapped[list["User"]] = relationship(
        secondary=user_selected_olympiad,
        back_populates="selected_olympiads"
    )

    subscribed_by_subject: Mapped[list["User"]] = relationship(
        secondary=user_selected_subject,
        primaryjoin="Olympiad.id == user_selected_subject.c.olympiad_id",
        secondaryjoin="User.id == user_selected_subject.c.user_id",
        foreign_keys="[user_selected_subject.c.olympiad_id, user_selected_subject.c.user_id]",
        back_populates="selected_subjects",
        overlaps="selected_subjects"
    )

    subscribed_by_level: Mapped[list["User"]] = relationship(
        secondary=user_selected_level,
        primaryjoin="Olympiad.id == user_selected_level.c.olympiad_id",
        secondaryjoin="User.id == user_selected_level.c.user_id",
        foreign_keys="[user_selected_level.c.olympiad_id, user_selected_level.c.user_id]",
        back_populates="selected_levels",
        overlaps="selected_levels"
    )

    @hybrid_property
    def status(self) -> str:
        try:
            end_date = datetime.strptime(self.end_date, "%d.%m.%Y")
            return "completed" if datetime.now() > end_date else "upcoming"
        except ValueError:
            return "unknown"

    @hybrid_property
    def parsed_subjects(self) -> list:
        if self.subjects.strip() == "-":
            return []
        try:
            return json.loads(self.subjects)
        except json.JSONDecodeError:
            return [s.strip() for s in self.subjects.split(",")]


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    text: Mapped[str] = mapped_column(String(2048))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    olympiad_id: Mapped[int] = mapped_column(ForeignKey("olympiads.id"))

    author: Mapped["User"] = relationship(back_populates="comments")
    olympiad: Mapped["Olympiad"] = relationship(back_populates="comments")


class Participation(Base):
    __tablename__ = "participations"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    olympiad_id: Mapped[int] = mapped_column(ForeignKey("olympiads.id"), primary_key=True)
    participation_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="participations")
    olympiad: Mapped["Olympiad"] = relationship(back_populates="participations")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    message: Mapped[str] = mapped_column(String(1024))
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    olympiad_id: Mapped[int] = mapped_column(ForeignKey("olympiads.id"))

    user: Mapped["User"] = relationship(back_populates="notifications")
    olympiad: Mapped["Olympiad"] = relationship()