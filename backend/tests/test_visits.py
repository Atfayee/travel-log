def test_create_visit(client, trip, places):
    response = client.post(
        "/visits",
        json={
            "place_id": places[0].id,
            "trip_id": trip.id,
            "day_number": 1,
            "order_index": 1,
            "cost": 25,
            "expense_category": "food",
            "rating": 5,
            "note": "很好",
            "visited_at": None,
            "duration": "1 hour",
            "recommended": True,
            "photo_url": None,
        }
    )

    assert response.status_code == 200

    data = response.json()
    assert data["trip_id"] == trip.id
    assert data["place_id"] == places[0].id
    assert data["cost"] == 25
    assert data["rating"] == 5
    assert data["recommended"] is True

def test_update_visit(client, visits):
    visit = visits[0]
    response = client.patch(
        f"/visits/{visit.id}",
        json={
            "cost": 88,
            "rating": 4,
            "note": "更新后的记录",
            "recommended": False,
        }
    )
    assert response.status_code in {200, 204}
    data = response.json()
    assert data["cost"] == 88
    assert data["rating"] == 4
    assert data["note"] == "更新后的记录"
    assert data["recommended"] is False

def test_delete_visit(client, visits):
    visit = visits[0]
    response = client.delete(
        f"/visits/{visit.id}"
    )
    assert response.status_code in {200, 204}
    response = client.get(
        f"/visits/{visit.id}"
    )
    assert response.status_code == 405

def test_move_visit_up(client, visits):
    second_visit = visits[1]
    response = client.patch(
        f"/visits/{second_visit.id}/move",
        json={
            "direction": "up"
        }
    )
    assert response.status_code == 200
    data = response.json()
    data = sorted(
        data,
        key=lambda item: item["order_index"]
    )
    assert data[0]["id"] == second_visit.id
    assert data[0]["order_index"] == 1
    assert data[1]["order_index"] == 2

def test_move_visit_to_another_day(client, visits):
    visit = visits[2]

    response = client.patch(
        f"/visits/{visit.id}/move-day",
        json={
            "target_day": 1
        }
    )
    assert response.status_code == 200
    data = response.json()
    moved_visit = next(
        item
        for item in data
        if item["id"] == visit.id
    )
    assert moved_visit["day_number"] == 1
    assert moved_visit["order_index"] == 3