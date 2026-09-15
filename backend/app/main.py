from fastapi import FastAPI, Depends, HTTPException, status, Response, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, func, or_, text

from pathlib import Path
from uuid import uuid4
from typing import Literal
import httpx

from .database import get_db, engine, Base
from .config import get_settings
from .models import City, Place, Visit, Trip
from .schemas import (
    CityCreate,
    CityResponse,
    PlaceCreate,
    PlaceResponse,
    VisitResponse,
    VisitCreate,
    VisitMoveRequest,
    VisitMoveDayRequest,
    VisitUpdate,
    TripCreate,
    TripUpdate,
    TripResponse,
    TripVisitCreate,
    TripVisitResponse,
    TripSummaryResponse,
    ExpenseBreakdownResponse,
    ExpenseCategoryItem,
    PlaceSearchResult,
    TripOverviewResponse,
    TripCardResponse,
    TripSearchResult
)

settings = get_settings()

allowed_origins = {
    settings.frontend_url.rstrip("/")
}

if settings.environment == "development":
    allowed_origins.update(
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    )

UPLOAD_DIR = Path(settings.upload_dir)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# alembic upgrade head 取代
# Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "travel-log app is running"}


@app.get("/health/live")
def health_live():
    return {
        "status": "alive"
    }

@app.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable"
        )



@app.post("/cities", response_model=CityResponse)
def create_city(city_data: CityCreate, db: Session = Depends(get_db)):

    city = City(name=city_data.name, country=city_data.country)

    db.add(city)
    db.commit()
    db.refresh(city)

    return city


@app.get("/cities", response_model=list[CityResponse])
def get_cities(db: Session = Depends(get_db)):

    result = db.execute(select(City))

    cities = result.scalars().all()

    return cities


@app.post("/places", response_model=PlaceResponse)
def create_place(place_data: PlaceCreate, db: Session = Depends(get_db)):
    city = db.get(City, place_data.city_id)

    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    place = Place(
        name=place_data.name,
        latitude=place_data.latitude,
        longitude=place_data.longitude,
        category=place_data.category,
        city_id=place_data.city_id,
    )

    db.add(place)
    db.commit()
    db.refresh(place)

    return place


@app.get("/cities/{city_id}/places", response_model=list[PlaceResponse])
def get_places_by_city(city_id: int, db: Session = Depends(get_db)):
    city = db.get(City, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    result = db.execute(select(Place).where(Place.city_id == city_id))

    places = result.scalars().all()

    return places


@app.post("/visits", response_model=TripVisitResponse)
def create_visit(visit_data: VisitCreate, db: Session = Depends(get_db)):
    place = db.get(Place, visit_data.place_id)

    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    trip = db.get(Trip, visit_data.trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if place.city_id != trip.city_id:
        raise HTTPException(
            status_code=400, detail="Place does not belong to the trip city"
        )

    visit = Visit(
        place_id=visit_data.place_id,
        trip_id=visit_data.trip_id,
        day_number=visit_data.day_number,
        order_index=visit_data.order_index,
        cost=visit_data.cost,
        expense_category=visit_data.expense_category,
        rating=visit_data.rating,
        note=visit_data.note,
        visited_at=visit_data.visited_at,
        duration=visit_data.duration,
        recommended=visit_data.recommended,
        photo_url=visit_data.photo_url,
    )

    db.add(visit)
    db.commit()
    db.refresh(visit)

    return visit


@app.patch("/visits/{visit_id}", response_model=TripVisitResponse)
def update_visit(visit_id: int, visit_data: VisitUpdate, db: Session = Depends(get_db)):
    visit = db.get(Visit, visit_id)

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    update_data = visit_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(visit, field, value)

    db.commit()
    db.refresh(visit)

    return visit


@app.delete("/visits/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit(visit_id: int, db: Session = Depends(get_db)):
    visit = db.get(Visit, visit_id)

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    db.delete(visit)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.patch("/visits/{visit_id}/move", response_model=list[TripVisitResponse])
def move_visit(
    visit_id: int, move_data: VisitMoveRequest, db: Session = Depends(get_db)
):
    visit = db.get(Visit, visit_id)

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    statement = (
        select(Visit)
        .where(Visit.trip_id == visit.trip_id)
        .where(Visit.day_number == visit.day_number)
        .order_by(Visit.order_index.asc(), Visit.id.asc())
    )

    visits = list(db.scalars(statement).all())

    current_index = next(
        (index for index, item in enumerate(visits) if item.id == visit.id), None
    )

    if move_data.direction == "up":
        target_index = current_index - 1
    else:
        target_index = current_index + 1

    if target_index < 0 or target_index >= len(visits):
        return visits

    visits[current_index], visits[target_index] = (
        visits[target_index],
        visits[current_index],
    )

    for index, item in enumerate(visits, start=1):
        item.order_index = index

    db.commit()

    updated_statement = (
        select(Visit)
        .where(Visit.trip_id == visit.trip_id)
        .where(Visit.day_number == visit.day_number)
        .order_by(Visit.order_index.asc(), Visit.id.asc())
    )

    return list(db.scalars(updated_statement).all())


@app.patch("/visits/{visit_id}/move-day", response_model=list[TripVisitResponse])
def move_visit_to_day(
    visit_id: int, move_data: VisitMoveDayRequest, db: Session = Depends(get_db)
):
    visit = db.get(Visit, visit_id)

    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    old_day = visit.day_number if visit.day_number is not None else 1

    target_day = move_data.target_day

    if old_day == target_day:
        statement = (
            select(Visit)
            .where(Visit.trip_id == visit.trip_id)
            .order_by(Visit.day_number.asc(), Visit.order_index.asc(), Visit.id.asc())
        )
        return list(db.scalars(statement).all())

    # 找到原 Day 剩下的 Visit
    old_day_statement = (
        select(Visit)
        .where(Visit.trip_id == visit.trip_id)
        .where(func.coalesce(Visit.day_number, 1) == old_day)
        .where(Visit.id != visit.id)
        .order_by(Visit.order_index.asc(), Visit.id.asc())
    )

    old_day_visits = list(db.scalars(old_day_statement).all())

    # 原 Day 重新编号
    for index, item in enumerate(old_day_visits, start=1):
        item.order_index = index

    # 找目标 Day 已有 Visit

    target_day_statement = (
        select(Visit)
        .where(Visit.trip_id == visit.trip_id)
        .where(func.coalesce(Visit.day_number, 1) == target_day)
        .order_by(Visit.order_index.asc(), Visit.id.asc())
    )

    target_visits = list(db.scalars(target_day_statement).all())

    # 修改当前 Visit
    visit.day_number = target_day
    visit.order_index = len(target_visits) + 1

    db.commit()

    updated_statement = (
        select(Visit)
        .where(Visit.trip_id == visit.trip_id)
        .order_by(Visit.day_number.asc(), Visit.order_index.asc(), Visit.id.asc())
    )
    return list(db.scalars(updated_statement).all())


@app.get("/places/search", response_model=list[PlaceSearchResult])
async def search_places(q: str, city: str | None = None):
    query = q.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Search query is required")

    if city:
        query = f"{query}, {city}"

    params = {
        "q": query,
        "format": "jsonv2",
        "limit": 5,
        "addressdetails": 1,
    }

    headers = {"User-Agent": "travel-log-learning-project/1.0"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:

            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params=params,
                headers=headers,
            )

            response.raise_for_status()

            results = response.json()

    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Place search service unavailable")

    return [
        PlaceSearchResult(
            name=(item.get("name") or item.get("display_name", "").split(",")[0]),
            display_name=item.get("display_name", ""),
            latitude=float(item["lat"]),
            longitude=float(item["lon"]),
            category=(item.get("type") or item.get("category")),
        )
        for item in results
    ]


@app.get("/places/{place_id}/visits", response_model=list[VisitResponse])
def get_visit_by_place(place_id: int, db: Session = Depends(get_db)):
    place = db.get(Place, place_id)

    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    result = db.execute(select(Visit).where(Visit.place_id == place_id))

    visits = result.scalars().all()

    return visits


@app.get("/places/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.get(Place, place_id)

    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    return place


@app.post("/trips", response_model=TripResponse)
def create_trip(trip_data: TripCreate, db: Session = Depends(get_db)):
    city = db.get(City, trip_data.city_id)

    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    trip = Trip(
        city_id=trip_data.city_id,
        title=trip_data.title,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        description=trip_data.description,
        budget=trip_data.budget,
        travel_style=trip_data.travel_style,
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)

    return trip


@app.get("/cities/{city_id}", response_model=CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.get(City, city_id)

    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    return city


@app.get("/cities/{city_id}/trips", response_model=list[TripResponse])
def get_trips_by_city(city_id: int, db: Session = Depends(get_db)):
    city = db.get(City, city_id)

    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    result = db.execute(select(Trip).where(Trip.city_id == city_id))

    return result.scalars().all()


@app.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip


@app.patch("/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip_data: TripUpdate, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = trip_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(trip, field, value)

    db.commit()
    db.refresh(trip)

    return trip


@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    visits_results = db.execute(select(Visit).where(Visit.trip_id == trip_id))

    visits = visits_results.scalars().all()

    for visit in visits:
        db.delete(visit)

    db.delete(trip)
    db.commit()

    return {"message": "Trip deleted successfully"}


@app.post("/trips/{trip_id}/visits-with-place", response_model=TripVisitResponse)
def create_trip_visit_with_place(
    trip_id: int, data: TripVisitCreate, db: Session = Depends(get_db)
):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    place = Place(
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        category=data.category,
        city_id=trip.city_id,
    )

    db.add(place)
    db.flush()

    visit = Visit(
        place_id=place.id,
        trip_id=trip.id,
        day_number=data.day_number,
        order_index=data.order_index,
        cost=data.cost,
        expense_category=data.expense_category,
        rating=data.rating,
        note=data.note,
        visited_at=data.visited_at,
        duration=data.duration,
        recommended=data.recommended,
        photo_url=data.photo_url,
    )

    db.add(visit)

    db.commit()

    db.refresh(visit)

    return visit


@app.get("/trips/{trip_id}/visits", response_model=list[TripVisitResponse])
def get_visits_by_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    result = db.execute(
        select(Visit)
        .where(Visit.trip_id == trip_id)
        .order_by(Visit.day_number, Visit.order_index)
    )
    visits = result.scalars().all()

    return visits


@app.get("/trips/{trip_id}/summary", response_model=TripSummaryResponse)
def get_trip_summary(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    total_cost_result = db.execute(
        select(func.coalesce(func.sum(Visit.cost), 0)).where(Visit.trip_id == trip_id)
    )

    total_cost = float(total_cost_result.scalar_one())

    visit_count_result = db.execute(
        select(func.count(Visit.id)).where(Visit.trip_id == trip_id)
    )
    visit_count = visit_count_result.scalar_one()

    remaining_budget = None
    if trip.budget is not None:
        remaining_budget = trip.budget - total_cost

    return TripSummaryResponse(
        trip_id=trip.id,
        budget=trip.budget,
        total_cost=total_cost,
        remaining_budget=remaining_budget,
        visit_count=visit_count,
    )


@app.get("/trips/{trip_id}/expense-breakdown", response_model=ExpenseBreakdownResponse)
def get_expense_breakdown(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    result = db.execute(
        select(Visit.expense_category, func.coalesce(func.sum(Visit.cost), 0))
        .where(Visit.trip_id == trip_id)
        .group_by(Visit.expense_category)
    )

    rows = result.all()

    categories = []

    total_cost = 0.0

    for category, total in rows:
        category_name = category or "other"

        total_value = float(total)

        total_cost += total_value

        categories.append(ExpenseCategoryItem(category=category_name, total=total_cost))

    return ExpenseBreakdownResponse(
        trip_id=trip_id, total_cost=total_cost, categories=categories
    )


@app.get("/trips/{trip_id}/overview", response_model=TripOverviewResponse)
def get_trip_overview(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    statement = select(Visit).where(Visit.trip_id == trip_id)

    visits = list(db.scalars(statement).all())

    if not visits:
        return TripOverviewResponse(
            trip_id=trip_id,
            day_count=0,
            place_count=0,
            total_cost=0,
            average_rating=None,
            recommended_count=0,
            rated_visit_count=0,
            recommendation_rate=None,
        )

    day_numbers = {
        visit.day_number if visit.day_number is not None else 1 for visit in visits
    }

    place_ids = {visit.place_id for visit in visits}

    total_cost = sum(visit.cost or 0 for visit in visits)

    ratings = [visit.rating for visit in visits if visit.rating is not None]

    average_rating = round(sum(ratings) / len(ratings), 2) if ratings else None

    recommended_count = sum(1 for visit in visits if visit.recommended is True)

    recommendation_values = [
        visit.recommended for visit in visits if visit.recommended is not None
    ]

    recommendation_rate = (
        round(recommended_count / len(recommendation_values) * 100, 1)
        if recommendation_values
        else None
    )

    return TripOverviewResponse(
        trip_id=trip_id,
        day_count=len(day_numbers),
        place_count=len(place_ids),
        total_cost=round(total_cost, 2),
        average_rating=average_rating,
        recommended_count=recommended_count,
        rated_visit_count=len(ratings),
        recommendation_rate=recommendation_rate,
    )

@app.post("/uploads/image")
async def upload_image(file: UploadFile = File(...)):

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPEG, PNG and WEBP "
                "images are allowed"
            )
        )

    extension = allowed_types[file.content_type]

    filename = (f"{uuid4().hex}{extension}")

    file_path = (UPLOAD_DIR / filename)

    contents = await file.read()

    max_size = 5 * 1024 * 1024

    if len(contents) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5MB"
        )

    file_path.write_bytes(contents)

    return {"url": f"/uploads/{filename}"}
    
@app.get(
    "/cities/{city_id}/trip-cards",
    response_model=list[TripCardResponse]
)
def get_city_trip_cards(
    city_id: int,
    db: Session = Depends(get_db)
):
    city = db.get(City, city_id)

    if not city:
        raise HTTPException(
            status_code=404,
            detail="City not found"
        )

    trips = list(
        db.scalars(
            select(Trip)
            .where(Trip.city_id == city_id)
            .order_by(Trip.id.desc())
        ).all()
    )

    result = []

    for trip in trips:
        visits = list(
            db.scalars(
                select(Visit)
                .where(Visit.trip_id == trip.id)
            ).all()
        )

        day_numbers = {
            visit.day_number
            if visit.day_number is not None
            else 1
            for visit in visits
        }

        place_ids = {
            visit.place_id
            for visit in visits
        }

        total_cost = sum(
            visit.cost or 0 for visit in visits 
        )

        result.append(
            TripCardResponse(
                id=trip.id,
                city_id=trip.city_id,
                title=trip.title,
                start_date=trip.start_date,
                end_date=trip.start_date,
                description=trip.description,
                budget=trip.budget,
                travel_style=trip.travel_style,
                cover_image_url=trip.cover_image_url,
                day_count=len(day_numbers),
                place_count=len(place_ids),
                total_cost=round(total_cost, 2)
            )
        )
    return result

@app.get(
    "/cities/{city_id}/trip-search",
    response_model=list[TripSearchResult]
)
def search_city_trips(
    city_id: int,
    q: str | None = None,
    travel_style: str | None = None,
    max_budget: float | None = None,
    sort: Literal[
        "latest",
        "cost",
        "rating"
    ] = "latest",
    db: Session = Depends(get_db)
):
    city = db.get(City, city_id)

    if not city:
        raise HTTPException(
            status_code=404,
            detail="City not found"
        )

    statement = (
        select(
            Trip.id.label(
                "id"
            ),

            Trip.city_id.label(
                "city_id"
            ),

            Trip.title.label(
                "title"
            ),

            Trip.start_date.label(
                "start_date"
            ),

            Trip.end_date.label(
                "end_date"
            ),

            Trip.description.label(
                "description"
            ),

            Trip.budget.label(
                "budget"
            ),

            Trip.travel_style.label(
                "travel_style"
            ),

            Trip.cover_image_url.label(
                "cover_image_url"
            ),

            func.count(
                func.distinct(
                    func.coalesce(
                        Visit.day_number,
                        1,
                    )
                )
            ).label(
                "day_count"
            ),

            func.count(
                func.distinct(
                    Visit.place_id
                )
            ).label(
                "place_count"
            ),

            func.coalesce(
                func.sum(
                    Visit.cost
                ),
                0,
            ).label(
                "total_cost"
            ),

            func.avg(
                Visit.rating
            ).label(
                "average_rating"
            ),
        )
        .outerjoin(
            Visit,
            Visit.trip_id
            == Trip.id,
        )
        .outerjoin(
            Place,
            Place.id
            == Visit.place_id,
        )
        .where(
            Trip.city_id
            == city_id
        )
    )

    if q:
        cleaned_q = q.strip()
        if cleaned_q:
            pattern = f"%{cleaned_q}%"
            statement = (
                statement.where(
                    or_(
                        Trip.title.ilike(pattern),
                        Trip.description.ilike(pattern),
                        Place.name.ilike(pattern),
                        Place.category.ilike(pattern)
                    )
                )
            )

    if travel_style:
        statement = (
            statement.where(
                Trip.travel_style == travel_style
            )
        )

    if max_budget is not None:
        statement = (
            statement.where(
                Trip.budget.is_not(None)
            )
            .where(
                Trip.budget <= max_budget
            )
        )

    statement = (
        statement.group_by(Trip.id)
    )

    if sort == "cost":
        statement = (
            statement.order_by(
                func.coalesce(
                    func.sum(
                        Visit.cost
                    ),
                    0
                ).asc(),
                Trip.id.desc()
            )
        )
    elif sort == "rating":
        statement = (
            statement.order_by(
                func.avg(
                    Visit.rating
                ).desc(),
                Trip.id.desc()
            )
        )
    else:
        statement = (
            statement.order_by(
                Trip.id.desc()
            )
        )

    rows = db.execute(statement).mappings().all()

    results = []

    for row in rows:
        average_rating = (
            round(float(row["average_rating"]), 1)
        ) if row["average_rating"] is not None else None
        results.append(
            TripSearchResult(
                id=row["id"],
                city_id=row["city_id"],
                title=row["title"],
                start_date=row["start_date"],
                end_date=row["end_date"],
                description=row["description"],
                budget=row["budget"],
                travel_style=row["travel_style"],
                cover_image_url=row["cover_image_url"],
                day_count=row["day_count"],
                place_count=row["place_count"],
                total_cost=round(float(row["total_cost"]), 2),
                average_rating=average_rating
            )
        )
    return results


app.mount(
    "/uploads",
    StaticFiles(
        directory=str(
            UPLOAD_DIR
        )
    ),
    name="uploads",
)
