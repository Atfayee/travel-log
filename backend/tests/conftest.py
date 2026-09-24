import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import City, Place, Trip, Visit

TEST_DATABASE_URl = os.getenv(
    "TEST_DATABASE_URL", "postgresql+psycopg://postgres@localhost:5432/travel_log_test"
)

test_engine = create_engine(
    url=TEST_DATABASE_URl,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    Base.metadata.drop_all(bind=test_engine)

    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db():
    connection = test_engine.connect()
    transcation = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transcation.rollback()
        connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def city(db):
    city = City(name="上海", country="中国")
    db.add(city)
    db.flush()

    return city


@pytest.fixture()
def trip(db, city):
    trip = Trip(
        city_id=city.id,
        title="上海周末游",
        start_date="2026-09-12",
        end_date="2026-09-13",
        description="上海两日旅行",
        budget=500,
        travel_style="budget",
        cover_image_url=None,
    )

    db.add(trip)
    db.flush()

    return trip


@pytest.fixture()
def places(db, city):
    places = [
        Place(
            name="武康路",
            latitude=31.2087,
            longitude=121.4384,
            category="city_walk",
            city_id=city.id,
        ),
        Place(
            name="外滩",
            latitude=31.2400,
            longitude=121.4904,
            category="sightseeing",
            city_id=city.id,
        ),
        Place(
            name="豫园",
            latitude=31.2272,
            longitude=121.4921,
            category="sightseeing",
            city_id=city.id,
        ),
    ]

    db.add_all(places)
    db.flush()

    return places


@pytest.fixture()
def visits(db, trip, places):
    visit_list = [
        Visit(
            place_id=places[0].id,
            trip_id=trip.id,
            day_number=1,
            order_index=1,
            cost=20,
            expense_category="food",
            rating=5,
            note="第一站",
            recommended=True,
        ),
        Visit(
            place_id=places[1].id,
            trip_id=trip.id,
            day_number=1,
            order_index=2,
            cost=50,
            expense_category="ticket",
            rating=4,
            note="第二站",
            recommended=True,
        ),
        Visit(
            place_id=places[2].id,
            trip_id=trip.id,
            day_number=2,
            order_index=1,
            cost=30,
            expense_category="ticket",
            rating=3,
            note="第三站",
            recommended=False,
        ),
    ]

    db.add_all(visit_list)
    db.flush()

    return visit_list
