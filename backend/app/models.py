from sqlalchemy import String, Float, ForeignKey, Text, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

class City(Base):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True
    )

    country: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(200)
    )

    latitude: Mapped[float] = mapped_column(
        Float
    )

    longitude: Mapped[float] = mapped_column(
        Float
    )

    category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    city_id: Mapped[int] = mapped_column(
        ForeignKey("cities.id")
    )

    city: Mapped["City"] = relationship()

class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    place_id: Mapped[int] = mapped_column(
        ForeignKey("places.id")
    )

    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id")
    )

    day_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    order_index: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    cost: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    expense_category: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    rating: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    visited_at: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    duration: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    recommended: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True
    )

    photo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    place: Mapped["Place"] = relationship()
    trip: Mapped["Trip"] = relationship()


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    city_id: Mapped[int] = mapped_column(
        ForeignKey("cities.id")
    )

    title: Mapped[str] = mapped_column(
        String(200)
    )

    start_date: Mapped[str | None] = mapped_column(
        String(20), 
        nullable=True
    )

    end_date: Mapped[str | None] = mapped_column(
        String(20), 
        nullable=True
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    budget: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    travel_style: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    cover_image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    city: Mapped["City"] = relationship()





    

