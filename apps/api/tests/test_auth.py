import pytest


@pytest.mark.asyncio
async def test_register_token(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "testpass123", "full_name": "New User"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "password": "testpass123", "full_name": "Dup"},
    )
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "password": "testpass123", "full_name": "Dup"},
    )
    assert response.status_code == 400
