from sqlalchemy import select

from .database import SessionLocal
from .models import City, Place, Trip, Visit

def seed():
    db = SessionLocal()

    try:
        existing_city = db.scalar(
            select(City).where(
                City.name == "上海"
            )
        )
        if existing_city:
            print("Seed data already exisits")
            return

        city = City(name="上海", country="中国")

        db.add(city)
        db.flush()

        wukang = Place(
            name="武康路",
            latitude=31.2087,
            longitude=121.4384,
            category="city_walk",
            city_id=city.id
        )

        bund = Place(
            name="外滩",
            latitude=31.2400,
            longitude=121.4904,
            category="sightseeing",
            city_id=city.id,
        )

        yuyuan = Place(
            name="豫园",
            latitude=31.2272,
            longitude=121.4921,
            category="sightseeing",
            city_id=city.id,
        )

        db.add_all([wukang, bund, yuyuan])
        db.flush()

        trip = Trip(
            city_id=city.id,
            title="上海周末游",
            start_date="2026-09-12",
            end_date="2026-09-13",
            description="两天上海 City Walk 和经典景点。",
            budget=500,
            travel_style="budget",
            cover_image_url=None,
        )

        db.add(trip)
        db.flush()

        visits = [
            Visit(
                place_id=wukang.id,
                trip_id=trip.id,
                day_number=1,
                order_index=1,
                cost=0,
                expense_category="other",
                rating=5,
                note="适合慢慢走。",
                recommended=True,
            ),

            Visit(
                place_id=bund.id,
                trip_id=trip.id,
                day_number=1,
                order_index=2,
                cost=0,
                expense_category="other",
                rating=5,
                note="晚上景色更好。",
                recommended=True,
            ),

            Visit(
                place_id=yuyuan.id,
                trip_id=trip.id,
                day_number=2,
                order_index=1,
                cost=40,
                expense_category="ticket",
                rating=4,
                note="游客比较多。",
                recommended=True,
            ),
        ]

        db.add_all(visits)

        db.commit()

        print("Seed data created successfully")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed()