import pytest


def test_trip_summary(client, trip, visits):
    response = client.get(f"/trips/{trip.id}/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["budget"] == 500
    assert data["total_cost"] == 100
    assert data["remaining_budget"] == 400
    assert data["visit_count"] == 3


def test_expense_breakdown(client, trip, visits):
    response = client.get(f"/trips/{trip.id}/expense-breakdown")

    assert response.status_code == 200
    data = response.json()
    categories = {item["category"]: item["total"] for item in data["categories"]}
    assert categories["food"] == 20
    assert categories["ticket"] == 80
    assert data["total_cost"] == 100


def test_trip_overview(client, trip, visits):
    response = client.get(f"/trips/{trip.id}/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["day_count"] == 2
    assert data["place_count"] == 3
    assert data["total_cost"] == 100
    assert data["average_rating"] == pytest.approx(4.0)
    assert data["recommended_count"] == 2
    assert data["rated_visit_count"] == 3
    assert data["recommendation_rate"] == pytest.approx(66.67, abs=0.1)


def test_search_trip_by_title(client, city, trip, visits):
    response = client.get(f"/cities/{city.id}/trip-search", params={"q": "上海"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    result = data[0]
    assert result["title"] == "上海周末游"
    assert result["id"] == trip.id
    assert result["place_count"] == 3
    assert result["total_cost"] == 100
    assert result["average_rating"] == pytest.approx(4.0)


def test_search_trip_by_place_name(client, city, trip, visits):
    response = client.get(f"/cities/{city.id}/trip-search", params={"q": "外滩"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    result = data[0]
    assert result["id"] == trip.id
    assert result["title"] == "上海周末游"
    
    assert result["place_count"] == 3
    assert result["total_cost"] == 100
    assert result["average_rating"] == pytest.approx(4.0)
