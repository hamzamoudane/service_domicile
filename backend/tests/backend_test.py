"""End-to-end backend tests for SOS Dépannage France API."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback - read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@store.com"
ADMIN_PASSWORD = "Admin123!"
CLIENT1_EMAIL = "client1@store.com"
CLIENT1_PASSWORD = "Client123!"


# ===== Fixtures =====
# NOTE: Use a fresh requests instance per test (no session) to avoid cookie pollution.
# Backend prioritizes httpOnly cookie over Authorization header, so a stale login
# cookie can override the Bearer header in tests using a shared session.

@pytest.fixture()
def s():
    # Plain requests module - no session, no cookie persistence.
    return requests


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def client_token():
    r = requests.post(f"{API}/auth/login", json={"email": CLIENT1_EMAIL, "password": CLIENT1_PASSWORD})
    assert r.status_code == 200, f"Client login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def client_headers(client_token):
    return {"Authorization": f"Bearer {client_token}"}


# ===== Public endpoints =====
class TestPublic:
    def test_services_count(self, s):
        r = s.get(f"{API}/services")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 28, f"Expected >=28 services, got {len(data)}"
        # 5 categories
        cats = set(item["category"] for item in data)
        assert {"plomberie", "electricite", "serrurerie", "chauffage", "assainissement"}.issubset(cats)

    def test_services_filter_by_category(self, s):
        r = s.get(f"{API}/services", params={"category": "plomberie"})
        assert r.status_code == 200
        items = r.json()
        assert all(i["category"] == "plomberie" for i in items)
        assert len(items) > 0

    def test_products_count(self, s):
        r = s.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 10

    def test_reviews_count(self, s):
        r = s.get(f"{API}/reviews")
        assert r.status_code == 200
        assert len(r.json()) >= 6

    def test_public_stats(self, s):
        r = s.get(f"{API}/public/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("interventions", "clients", "cities", "satisfaction"):
            assert k in d


# ===== Auth =====
class TestAuth:
    def test_register_new_client(self, s):
        email = f"TEST_{uuid.uuid4().hex[:10]}@example.com"
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass1234!", "name": "Test User"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == email.lower()
        assert data["user"]["role"] == "client"

    def test_register_duplicate_fails(self, s):
        r = s.post(f"{API}/auth/register", json={
            "email": ADMIN_EMAIL, "password": "Whatever123!", "name": "X"
        })
        assert r.status_code == 400

    def test_login_admin(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["token"]

    def test_login_client(self, s):
        r = s.post(f"{API}/auth/login", json={"email": CLIENT1_EMAIL, "password": CLIENT1_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "client"

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, s, admin_headers):
        r = s.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_unauth(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_change_password_and_revert(self, s):
        # create temp user
        email = f"TEST_pw_{uuid.uuid4().hex[:8]}@example.com"
        reg = s.post(f"{API}/auth/register", json={"email": email, "password": "Orig123!", "name": "PW"})
        token = reg.json()["token"]
        h = {"Authorization": f"Bearer {token}"}
        r = s.post(f"{API}/auth/change-password", json={
            "current_password": "Orig123!", "new_password": "NewPass456!"
        }, headers=h)
        assert r.status_code == 200
        # login with new
        r2 = s.post(f"{API}/auth/login", json={"email": email, "password": "NewPass456!"})
        assert r2.status_code == 200


# ===== Interventions =====
class TestInterventions:
    payload = {
        "first_name": "John", "last_name": "Doe",
        "email": "guest@example.com", "phone": "0601020304",
        "address": "1 rue de la Paix", "city": "Paris", "postal_code": "75002",
        "service_category": "plomberie", "description": "Fuite urgente",
        "urgent": True,
    }

    def test_guest_intervention(self, s):
        r = s.post(f"{API}/interventions", json=self.payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "pending"
        assert d["user_id"] is None

    def test_client_intervention(self, s, client_headers):
        r = s.post(f"{API}/interventions", json=self.payload, headers=client_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["user_id"] is not None

    def test_my_interventions(self, s, client_headers):
        r = s.get(f"{API}/interventions/me", headers=client_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ===== Orders =====
class TestOrders:
    def test_create_and_list_order(self, s, client_headers):
        payload = {
            "items": [{
                "item_type": "product", "item_id": "p1", "name": "Test prod",
                "price": 50.0, "quantity": 2,
            }],
            "address": "1 rue de la Paix", "city": "Paris",
            "postal_code": "75002", "phone": "0601020304",
        }
        r = s.post(f"{API}/orders", json=payload, headers=client_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["total"] == 100.0
        assert d["status"] == "pending"
        # list
        r2 = s.get(f"{API}/orders/me", headers=client_headers)
        assert r2.status_code == 200
        assert any(o["id"] == d["id"] for o in r2.json())

    def test_create_order_unauth(self, s):
        r = requests.post(f"{API}/orders", json={
            "items": [], "address": "x", "city": "x", "postal_code": "x", "phone": "x"
        })
        assert r.status_code == 401


# ===== Admin =====
class TestAdmin:
    def test_stats(self, s, admin_headers):
        r = s.get(f"{API}/admin/stats", headers=admin_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("orders_count", "interventions_count", "clients_count", "revenue"):
            assert k in d

    def test_stats_rejects_non_admin(self, s, client_headers):
        r = s.get(f"{API}/admin/stats", headers=client_headers)
        assert r.status_code == 403

    def test_admin_listings(self, s, admin_headers):
        for path in ("admin/orders", "admin/interventions", "admin/users"):
            r = s.get(f"{API}/{path}", headers=admin_headers)
            assert r.status_code == 200, path
            assert isinstance(r.json(), list)

    def test_admin_listings_rejects_non_admin(self, s, client_headers):
        r = s.get(f"{API}/admin/users", headers=client_headers)
        assert r.status_code == 403

    def test_service_crud(self, s, admin_headers):
        payload = {
            "name_fr": "TEST_service", "name_en": "TEST_service",
            "description_fr": "desc", "description_en": "desc",
            "category": "plomberie", "price": 10.0,
            "image_url": "https://example.com/x.jpg",
        }
        r = s.post(f"{API}/admin/services", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        sid = r.json()["id"]
        # Update
        payload["price"] = 25.0
        r2 = s.put(f"{API}/admin/services/{sid}", json=payload, headers=admin_headers)
        assert r2.status_code == 200
        assert r2.json()["price"] == 25.0
        # GET verifies persistence
        r3 = s.get(f"{API}/services/{sid}")
        assert r3.status_code == 200 and r3.json()["price"] == 25.0
        # Delete
        r4 = s.delete(f"{API}/admin/services/{sid}", headers=admin_headers)
        assert r4.status_code == 200
        # 404 after delete
        r5 = s.get(f"{API}/services/{sid}")
        assert r5.status_code == 404

    def test_product_crud(self, s, admin_headers):
        payload = {
            "name_fr": "TEST_prod", "name_en": "TEST_prod",
            "description_fr": "d", "description_en": "d",
            "category": "plomberie", "price": 99.0, "stock": 5, "images": [],
        }
        r = s.post(f"{API}/admin/products", json=payload, headers=admin_headers)
        assert r.status_code == 200
        pid = r.json()["id"]
        payload["price"] = 120.0
        r2 = s.put(f"{API}/admin/products/{pid}", json=payload, headers=admin_headers)
        assert r2.status_code == 200 and r2.json()["price"] == 120.0
        r3 = s.delete(f"{API}/admin/products/{pid}", headers=admin_headers)
        assert r3.status_code == 200

    def test_update_order_status(self, s, admin_headers, client_headers):
        # Create order as client
        payload = {
            "items": [{"item_type": "service", "item_id": "s1", "name": "X",
                       "price": 50.0, "quantity": 1}],
            "address": "x", "city": "x", "postal_code": "75001", "phone": "0600000000",
        }
        cr = s.post(f"{API}/orders", json=payload, headers=client_headers)
        oid = cr.json()["id"]
        r = s.patch(f"{API}/admin/orders/{oid}",
                    json={"status": "confirmed", "admin_notes": "ok"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

    def test_update_intervention_status(self, s, admin_headers):
        # create as guest
        body = {
            "first_name": "A", "last_name": "B",
            "email": "g@example.com", "phone": "0600",
            "address": "x", "city": "x", "postal_code": "75001",
            "service_category": "plomberie", "description": "d",
        }
        c = s.post(f"{API}/interventions", json=body).json()
        r = s.patch(f"{API}/admin/interventions/{c['id']}",
                    json={"status": "confirmed", "admin_notes": "notes"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"
        assert r.json()["admin_notes"] == "notes"


# ===== Reviews / Contact =====
class TestReviewsContact:
    def test_create_review(self, s):
        r = s.post(f"{API}/reviews", json={
            "name": "TEST_user", "rating": 5, "comment": "Great!",
            "service_category": "plomberie",
        })
        assert r.status_code == 200
        assert r.json()["rating"] == 5

    def test_contact(self, s):
        r = s.post(f"{API}/contact", json={
            "name": "TEST_user", "email": "t@example.com",
            "subject": "Hi", "message": "Hello there",
        })
        assert r.status_code == 200
        assert r.json()["ok"] is True
