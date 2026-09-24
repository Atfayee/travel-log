def test_create_trip(client, city):
    response = client.post(
        "/trips",
        json={
            "city_id": city.id,
            "title": "上海咖啡周末",
            "start_date": "2026-10-01",
            "end_date": "2026-10-02",
            "description": "咖啡和 City Walk",
            "budget": 600,
            "travel_style": "budget",
            "cover_image_url": None,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["title"] == "上海咖啡周末"
    assert data["city_id"] == city.id
    assert data["budget"] == 600
    assert data["travel_style"] == "budget"
    assert "id" in data


def test_get_trip(client, trip):
    response = client.get(
        f"/trips/{trip.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == trip.id
    assert data["title"] == "上海周末游"
    assert data["budget"] == 500

def test_update_trip(client, trip):
    response = client.patch(
        f"/trips/{trip.id}",
        json={
            "title": "更新后的上海旅游",
            "budget": 800
        }
    )
    assert response.status_code in {200, 204}

    data = response.json()
    assert data["title"] == "更新后的上海旅游"
    assert data["budget"] == 800


def test_delete_trip(client, trip):
    response = client.delete(
        f"/trips/{trip.id}"
    )
    assert response.status_code in {200, 204}
    response = client.get(
        f"/trips/{trip.id}"
    )
    assert response.status_code == 404

def test_get_missing_trip_status(client, trip):
    response = client.get(
        "/trips/99999"
    )
    assert response.status_code == 404