"""Test health check endpoints"""

def test_root_health_check(client):
    """Test root endpoint returns health info"""
    response = client.get("/")
    print(f"Response: {response.status_code}, Body: {response.text}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_liveness_probe(client):
    """Test liveness probe endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"


def test_readiness_probe(client):
    """Test readiness probe with database check"""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"
