from pydantic import BaseModel, Field
from typing import Literal

ExpenseCategory = Literal["transport", "food", "hotel", "ticket", "coffee", "other"]


class CityCreate(BaseModel):
    name: str
    country: str | None = None


class CityResponse(BaseModel):
    id: int
    name: str
    country: str | None

    model_config = {"from_attributes": True}


class PlaceCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    category: str | None = None
    city_id: int


class PlaceResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    category: str | None
    city_id: int

    model_config = {"from_attributes": True}


class VisitCreate(BaseModel):
    place_id: int
    trip_id: int

    day_number: int = Field(
        ge=1
    )

    order_index: int = Field(
        ge=1
    )

    cost: float | None = Field(
        default=None,
        ge=0
    )
    expense_category: ExpenseCategory | None = None

    rating: int | None = Field(
        default=None,
        ge=1,
        le=5
    )

    note: str | None = Field(
        default=None,
        max_length=2000
    )
    visited_at: str | None = None
    duration: str | None = Field(
        default=None,
        max_length=50
    )
    recommended: bool | None = None
    photo_url: str | None = None


class VisitUpdate(BaseModel):
    day_number: int | None = Field(
        default=None,
        ge=1
    )

    order_index: int | None = Field(
        default=None,
        ge=1
    )

    cost: float | None = Field(
        default=None,
        ge=0
    )

    expense_category: ExpenseCategory | None = None

    rating: int | None = Field(
        default=None,
        ge=1,
        le=5
    )

    note: str | None = Field(
        default=None,
        max_length=2000
    )

    visited_at: str | None = None

    duration: str | None = Field(
        default=None,
        max_length=50
    )

    recommended: bool | None = None

    photo_url: str | None = None

class VisitMoveRequest(BaseModel):
    direction: Literal["up", "down"]

class VisitMoveDayRequest(BaseModel):
    target_day: int = Field(ge=1)


class VisitResponse(BaseModel):
    id: int
    place_id: int
    trip_id: int

    day_number: int | None = None
    order_index: int | None = None

    cost: float | None = None
    expense_category: str | None

    rating: int | None = None
    note: str | None = None
    visited_at: str | None
    duration: str | None
    recommended: bool | None
    photo_url: str | None

    model_config = {"from_attributes": True}


class TripCreate(BaseModel):
    city_id: int

    title: str = Field(min_length=1, max_length=200)

    start_date: str | None = None
    end_date: str | None = None

    description: str | None = Field(default=None, max_length=2000)

    budget: float | None = Field(default=None, ge=0)

    travel_style: str | None = Field(default=None, max_length=50)

    cover_image_url: str | None = None


class TripUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)

    start_date: str | None = None
    end_date: str | None = None

    description: str | None = Field(default=None, max_length=2000)

    budget: float | None = Field(default=None, ge=0)

    travel_style: str | None = Field(default=None, max_length=50)

    cover_image_url: str | None = None


class TripResponse(BaseModel):
    id: int
    city_id: int
    title: str
    start_date: str | None
    end_date: str | None
    description: str | None
    budget: float | None
    travel_style: str | None
    cover_image_url: str | None 

    model_config = {"from_attributes": True}


class TripVisitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    latitude: float
    longitude: float

    category: str | None = Field(default=None, max_length=50)

    day_number: int = Field(ge=1)

    order_index: int = Field(ge=1)

    cost: float | None = Field(default=None, ge=0)

    expense_category: ExpenseCategory | None = None

    rating: int | None = Field(default=None, ge=1, le=5)

    note: str | None = Field(default=None, max_length=2000)

    visited_at: str | None = None

    duration: str | None = Field(default=None, max_length=50)

    recommended: bool | None = None

    photo_url: str | None = None


class TripVisitResponse(BaseModel):
    id: int
    place_id: int
    trip_id: int

    day_number: int | None
    order_index: int | None

    cost: float | None
    expense_category: str | None

    rating: int | None
    note: str | None
    visited_at: str | None
    duration: str | None
    recommended: bool | None
    photo_url: str | None

    place: PlaceResponse

    model_config = {"from_attributes": True}


class TripSummaryResponse(BaseModel):
    trip_id: int
    budget: float | None
    total_cost: float
    remaining_budget: float | None
    visit_count: int


class ExpenseCategoryItem(BaseModel):
    category: str
    total: float


class ExpenseBreakdownResponse(BaseModel):
    trip_id: int
    total_cost: float
    categories: list[ExpenseCategoryItem]


class PlaceSearchResult(BaseModel):
    name: str
    display_name: str

    latitude: float
    longitude: float

    category: str | None = None


class TripOverviewResponse(BaseModel):
    trip_id: int
    day_count: int
    place_count: int
    total_cost: float
    average_rating: float | None
    recommended_count: int
    rated_visit_count: int
    recommendation_rate: float | None


class TripCardResponse(BaseModel):
    id: int
    city_id: int
    title: str

    start_date: str | None
    end_date: str | None

    description: str | None

    budget: float | None

    travel_style: str | None

    cover_image_url: str | None

    day_count: int

    place_count: int

    total_cost: float

class TripSearchResult(BaseModel):
    id: int
    city_id: int

    title: str

    start_date: str | None
    end_date: str | None

    description: str | None

    budget: float | None

    travel_style: str | None

    cover_image_url: str | None

    day_count: int
    place_count: int
    total_cost: float

    average_rating: float | None
