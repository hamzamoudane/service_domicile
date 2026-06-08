from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from fastapi.security import HTTPBearer
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ===== Configuration =====
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_DAYS = 30

app = FastAPI(title="SOS Dépannage France API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sos-depannage")


# ===== Helpers =====
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_MINUTES * 60,
        path="/",
    )


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")


async def get_token_from_request(request: Request) -> Optional[str]:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    return token


async def get_current_user(request: Request) -> dict:
    token = await get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        if not user.get("active", True):
            raise HTTPException(status_code=403, detail="Compte désactivé")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")


async def get_current_user_optional(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return user


# ===== Models =====
class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    addresses: List[dict] = []
    active: bool = True
    created_at: str


class RegisterBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    phone: Optional[str] = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileBody(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    addresses: Optional[List[dict]] = None


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class ForgotPasswordBody(BaseModel):
    email: EmailStr


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class ServiceBody(BaseModel):
    name_fr: str
    name_en: str
    description_fr: str
    description_en: str
    category: str  # plomberie | electricite | serrurerie | chauffage | assainissement
    price: float
    price_label: Optional[str] = None  # e.g. "à partir de"
    image_url: str
    active: bool = True
    popular: bool = False


class ProductBody(BaseModel):
    name_fr: str
    name_en: str
    description_fr: str
    description_en: str
    category: str
    price: float
    stock: int = 0
    images: List[str] = []
    active: bool = True


class CartItem(BaseModel):
    item_type: Literal["service", "product"]
    item_id: str
    name: str
    price: float
    quantity: int = 1
    image_url: Optional[str] = None


class OrderBody(BaseModel):
    items: List[CartItem]
    address: str
    city: str
    postal_code: str
    phone: str
    notes: Optional[str] = None


class InterventionBody(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    postal_code: str
    service_category: str
    service_id: Optional[str] = None
    description: str
    preferred_date: Optional[str] = None
    urgent: bool = False
    quote_only: bool = False


class ReviewBody(BaseModel):
    name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    service_category: Optional[str] = None


class ContactBody(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class StatusUpdateBody(BaseModel):
    status: str
    admin_notes: Optional[str] = None


# ===== Auth Endpoints =====
@api_router.post("/auth/register")
async def register(body: RegisterBody, response: Response):
    email = body.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name,
        "phone": body.phone,
        "role": "client",
        "addresses": [],
        "active": True,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email, "client")
    set_auth_cookies(response, token)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return {"user": user_doc, "token": token}


@api_router.post("/auth/login")
async def login(body: LoginBody, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.get("active", True):
        raise HTTPException(status_code=403, detail="Compte désactivé")
    token = create_access_token(user["id"], email, user["role"])
    set_auth_cookies(response, token)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"user": user, "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.patch("/auth/profile")
async def update_profile(body: UpdateProfileBody, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return updated


@api_router.post("/auth/change-password")
async def change_password(body: ChangePasswordBody, user: dict = Depends(get_current_user)):
    full = await db.users.find_one({"id": user["id"]})
    if not verify_password(body.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    await db.users.update_one(
        {"id": user["id"]}, {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    return {"ok": True}


@api_router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordBody):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    # Always return ok to avoid user enumeration
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["id"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
            "used": False,
        })
        logger.info(f"[Password Reset] Link for {email}: /reset-password?token={token}")
    return {"ok": True, "message": "Si ce compte existe, un lien a été envoyé"}


@api_router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordBody):
    record = await db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Token invalide ou déjà utilisé")
    if datetime.fromisoformat(record["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expiré")
    await db.users.update_one(
        {"id": record["user_id"]}, {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True}


# ===== Services (Prestations) =====
@api_router.get("/services")
async def list_services(category: Optional[str] = None, q: Optional[str] = None):
    query = {"active": True}
    if category and category != "all":
        query["category"] = category
    if q:
        query["$or"] = [
            {"name_fr": {"$regex": q, "$options": "i"}},
            {"name_en": {"$regex": q, "$options": "i"}},
            {"description_fr": {"$regex": q, "$options": "i"}},
        ]
    items = await db.services.find(query, {"_id": 0}).to_list(500)
    return items


@api_router.get("/services/{service_id}")
async def get_service(service_id: str):
    item = await db.services.find_one({"id": service_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Prestation introuvable")
    return item


@api_router.post("/admin/services")
async def create_service(body: ServiceBody, admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.services.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/services/{service_id}")
async def update_service(service_id: str, body: ServiceBody, admin: dict = Depends(require_admin)):
    res = await db.services.update_one({"id": service_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prestation introuvable")
    item = await db.services.find_one({"id": service_id}, {"_id": 0})
    return item


@api_router.delete("/admin/services/{service_id}")
async def delete_service(service_id: str, admin: dict = Depends(require_admin)):
    res = await db.services.delete_one({"id": service_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prestation introuvable")
    return {"ok": True}


# ===== Products =====
@api_router.get("/products")
async def list_products(category: Optional[str] = None, q: Optional[str] = None):
    query = {"active": True}
    if category and category != "all":
        query["category"] = category
    if q:
        query["$or"] = [
            {"name_fr": {"$regex": q, "$options": "i"}},
            {"name_en": {"$regex": q, "$options": "i"}},
            {"description_fr": {"$regex": q, "$options": "i"}},
        ]
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    return items


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    item = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return item


@api_router.post("/admin/products")
async def create_product(body: ProductBody, admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, body: ProductBody, admin: dict = Depends(require_admin)):
    res = await db.products.update_one({"id": product_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    item = await db.products.find_one({"id": product_id}, {"_id": 0})
    return item


@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return {"ok": True}


# ===== Orders =====
@api_router.post("/orders")
async def create_order(body: OrderBody, user: dict = Depends(get_current_user)):
    subtotal = sum(item.price * item.quantity for item in body.items)
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "items": [i.model_dump() for i in body.items],
        "subtotal": subtotal,
        "total": subtotal,
        "address": body.address,
        "city": body.city,
        "postal_code": body.postal_code,
        "phone": body.phone,
        "notes": body.notes,
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/orders/me")
async def my_orders(user: dict = Depends(get_current_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/admin/orders")
async def admin_orders(admin: dict = Depends(require_admin), status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    items = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.patch("/admin/orders/{order_id}")
async def admin_update_order(order_id: str, body: StatusUpdateBody, admin: dict = Depends(require_admin)):
    update = {"status": body.status}
    if body.admin_notes is not None:
        update["admin_notes"] = body.admin_notes
    res = await db.orders.update_one({"id": order_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return await db.orders.find_one({"id": order_id}, {"_id": 0})


# ===== Interventions =====
@api_router.post("/interventions")
async def create_intervention(body: InterventionBody, request: Request):
    user = await get_current_user_optional(request)
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["user_id"] = user["id"] if user else None
    doc["status"] = "pending"
    doc["admin_notes"] = ""
    doc["created_at"] = now_iso()
    await db.interventions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/interventions/me")
async def my_interventions(user: dict = Depends(get_current_user)):
    items = await db.interventions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/admin/interventions")
async def admin_interventions(admin: dict = Depends(require_admin), status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    items = await db.interventions.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.patch("/admin/interventions/{intervention_id}")
async def admin_update_intervention(
    intervention_id: str, body: StatusUpdateBody, admin: dict = Depends(require_admin)
):
    update = {"status": body.status}
    if body.admin_notes is not None:
        update["admin_notes"] = body.admin_notes
    res = await db.interventions.update_one({"id": intervention_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    return await db.interventions.find_one({"id": intervention_id}, {"_id": 0})


# ===== Reviews =====
@api_router.get("/reviews")
async def list_reviews():
    items = await db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


@api_router.post("/reviews")
async def create_review(body: ReviewBody):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["approved"] = True  # Auto-approve for MVP
    doc["created_at"] = now_iso()
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ===== Contact =====
@api_router.post("/contact")
async def contact(body: ContactBody):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "id": doc["id"]}


# ===== Admin: Users =====
@api_router.get("/admin/users")
async def admin_list_users(admin: dict = Depends(require_admin)):
    items = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return items


@api_router.patch("/admin/users/{user_id}/toggle-active")
async def admin_toggle_user(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    new_state = not user.get("active", True)
    await db.users.update_one({"id": user_id}, {"$set": {"active": new_state}})
    return {"active": new_state}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    res = await db.users.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"ok": True}


# ===== Admin: Stats =====
@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    orders_count = await db.orders.count_documents({})
    interventions_count = await db.interventions.count_documents({})
    clients_count = await db.users.count_documents({"role": "client"})
    pending_interventions = await db.interventions.count_documents({"status": "pending"})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    urgent_interventions = await db.interventions.count_documents({"urgent": True, "status": {"$in": ["pending", "confirmed"]}})

    # Revenue (sum totals of completed orders)
    rev_pipeline = [
        {"$match": {"status": {"$in": ["completed", "confirmed", "processing"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ]
    rev = await db.orders.aggregate(rev_pipeline).to_list(1)
    revenue = rev[0]["total"] if rev else 0

    # Top services by intervention requests
    top_services_pipeline = [
        {"$group": {"_id": "$service_category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_services = await db.interventions.aggregate(top_services_pipeline).to_list(5)

    # Recent activity
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    recent_interventions = await db.interventions.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)

    return {
        "orders_count": orders_count,
        "interventions_count": interventions_count,
        "clients_count": clients_count,
        "pending_interventions": pending_interventions,
        "pending_orders": pending_orders,
        "urgent_interventions": urgent_interventions,
        "revenue": revenue,
        "top_services": top_services,
        "recent_orders": recent_orders,
        "recent_interventions": recent_interventions,
    }


# ===== Public Stats (for landing) =====
@api_router.get("/public/stats")
async def public_stats():
    interventions = await db.interventions.count_documents({})
    clients = await db.users.count_documents({"role": "client"})
    return {
        "interventions": max(interventions + 12847, 12847),
        "clients": max(clients + 5234, 5234),
        "cities": 36000,
        "satisfaction": 98,
    }


# ===== Seed =====
SERVICES_SEED = [
    # Plomberie
    {"name_fr": "Recherche de fuite", "name_en": "Leak detection", "description_fr": "Détection précise de fuite d'eau par caméra thermique et inspection ciblée.", "description_en": "Precise water leak detection using thermal camera and targeted inspection.", "category": "plomberie", "price": 89, "image_url": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg", "popular": True},
    {"name_fr": "Débouchage évier", "name_en": "Sink unclogging", "description_fr": "Débouchage rapide d'évier sans démontage, garantie résultat.", "description_en": "Fast sink unclogging without disassembly, guaranteed result.", "category": "plomberie", "price": 99},
    {"name_fr": "Débouchage WC", "name_en": "Toilet unclogging", "description_fr": "Débouchage professionnel de toilettes, matériel adapté.", "description_en": "Professional toilet unclogging with adapted equipment.", "category": "plomberie", "price": 119},
    {"name_fr": "Réparation chasse d'eau", "name_en": "Toilet flush repair", "description_fr": "Diagnostic et remise en état de chasse d'eau défectueuse.", "description_en": "Diagnosis and repair of faulty toilet flush.", "category": "plomberie", "price": 79},
    {"name_fr": "Remplacement robinet", "name_en": "Faucet replacement", "description_fr": "Pose d'un robinet neuf, pièces et main d'œuvre comprises.", "description_en": "Installation of new faucet, parts and labor included.", "category": "plomberie", "price": 129},
    {"name_fr": "Installation lavabo", "name_en": "Washbasin installation", "description_fr": "Installation complète d'un lavabo avec raccordement.", "description_en": "Complete washbasin installation with plumbing connection.", "category": "plomberie", "price": 249},
    {"name_fr": "Installation douche", "name_en": "Shower installation", "description_fr": "Installation complète d'une douche avec étanchéité.", "description_en": "Complete shower installation with waterproofing.", "category": "plomberie", "price": 599},
    {"name_fr": "Installation chauffe-eau", "name_en": "Water heater installation", "description_fr": "Pose d'un chauffe-eau électrique ou gaz, mise en service incluse.", "description_en": "Installation of electric or gas water heater, commissioning included.", "category": "plomberie", "price": 890},

    # Électricité
    {"name_fr": "Recherche de panne électrique", "name_en": "Electrical fault diagnosis", "description_fr": "Diagnostic complet de panne électrique avec rapport détaillé.", "description_en": "Complete electrical fault diagnosis with detailed report.", "category": "electricite", "price": 99, "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e", "popular": True},
    {"name_fr": "Remplacement prise électrique", "name_en": "Power outlet replacement", "description_fr": "Remplacement d'une prise électrique aux normes NF C 15-100.", "description_en": "Power outlet replacement to NF C 15-100 standards.", "category": "electricite", "price": 79},
    {"name_fr": "Remplacement interrupteur", "name_en": "Switch replacement", "description_fr": "Remplacement d'interrupteur défectueux, toutes marques.", "description_en": "Faulty switch replacement, all brands.", "category": "electricite", "price": 69},
    {"name_fr": "Installation luminaire", "name_en": "Lighting installation", "description_fr": "Pose et raccordement d'un luminaire au plafond.", "description_en": "Ceiling light fixture installation and wiring.", "category": "electricite", "price": 89},
    {"name_fr": "Mise aux normes électrique", "name_en": "Electrical compliance upgrade", "description_fr": "Mise en conformité installation électrique selon normes en vigueur.", "description_en": "Bring electrical installation up to current code.", "category": "electricite", "price": 690, "price_label": "à partir de"},
    {"name_fr": "Installation tableau électrique", "name_en": "Electrical panel install", "description_fr": "Installation d'un tableau électrique neuf complet.", "description_en": "Complete new electrical panel installation.", "category": "electricite", "price": 990},

    # Serrurerie
    {"name_fr": "Ouverture porte claquée", "name_en": "Slammed door opening", "description_fr": "Ouverture rapide sans dégâts, intervention 24h/24.", "description_en": "Fast non-destructive opening, 24/7 service.", "category": "serrurerie", "price": 89, "image_url": "https://images.unsplash.com/photo-1564767609213-c75ee685263a", "popular": True},
    {"name_fr": "Ouverture porte verrouillée", "name_en": "Locked door opening", "description_fr": "Ouverture de porte verrouillée à clé sans casse.", "description_en": "Locked door opening without breakage.", "category": "serrurerie", "price": 149},
    {"name_fr": "Remplacement serrure standard", "name_en": "Standard lock replacement", "description_fr": "Pose d'une serrure standard, cylindre et fournitures inclus.", "description_en": "Standard lock installation, cylinder and supplies included.", "category": "serrurerie", "price": 189},
    {"name_fr": "Remplacement serrure haute sécurité", "name_en": "Hi-security lock replacement", "description_fr": "Pose d'une serrure A2P haute sécurité avec cylindre breveté.", "description_en": "Hi-security A2P lock installation with patented cylinder.", "category": "serrurerie", "price": 349},
    {"name_fr": "Blindage de porte", "name_en": "Door reinforcement", "description_fr": "Blindage complet de porte avec plaque acier renforcée.", "description_en": "Complete door reinforcement with steel plate.", "category": "serrurerie", "price": 790, "price_label": "à partir de"},

    # Chauffage
    {"name_fr": "Dépannage chauffe-eau", "name_en": "Water heater repair", "description_fr": "Diagnostic et réparation de chauffe-eau, toutes marques.", "description_en": "Water heater diagnosis and repair, all brands.", "category": "chauffage", "price": 119, "image_url": "https://images.unsplash.com/photo-1660330589827-da8ab7dd3c02", "popular": True},
    {"name_fr": "Remplacement résistance", "name_en": "Heating element replacement", "description_fr": "Remplacement de résistance de chauffe-eau, pièce neuve garantie.", "description_en": "Water heater heating element replacement, new part warrantied.", "category": "chauffage", "price": 149},
    {"name_fr": "Entretien chauffe-eau", "name_en": "Water heater maintenance", "description_fr": "Entretien annuel: détartrage anode, vérifications de sécurité.", "description_en": "Annual maintenance: descaling, anode, safety checks.", "category": "chauffage", "price": 99},
    {"name_fr": "Remplacement ballon d'eau chaude", "name_en": "Hot water tank replacement", "description_fr": "Pose d'un ballon neuf, dépose ancien inclus.", "description_en": "New tank installation, old tank removal included.", "category": "chauffage", "price": 890},
    {"name_fr": "Installation ballon thermodynamique", "name_en": "Heat pump water heater", "description_fr": "Installation ballon thermodynamique éligible aides d'État.", "description_en": "Heat pump water heater install, government grants eligible.", "category": "chauffage", "price": 1890},

    # Assainissement
    {"name_fr": "Débouchage canalisation", "name_en": "Pipe unclogging", "description_fr": "Débouchage canalisations bouchées, machine furet professionnelle.", "description_en": "Clogged pipe clearing, professional auger machine.", "category": "assainissement", "price": 149, "image_url": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg"},
    {"name_fr": "Curage canalisation", "name_en": "Pipe cleaning", "description_fr": "Curage haute pression de canalisations, nettoyage complet.", "description_en": "High pressure pipe cleaning, complete service.", "category": "assainissement", "price": 249},
    {"name_fr": "Inspection caméra", "name_en": "Camera inspection", "description_fr": "Inspection vidéo de canalisations, rapport vidéo fourni.", "description_en": "Pipe video inspection, video report provided.", "category": "assainissement", "price": 199},
    {"name_fr": "Camion hydrocureur", "name_en": "Hydro jet truck", "description_fr": "Intervention camion hydrocureur haute pression industriel.", "description_en": "Industrial high-pressure hydro jet truck service.", "category": "assainissement", "price": 390},
]

PRODUCTS_SEED = [
    {"name_fr": "Mitigeur cuisine chromé", "name_en": "Chrome kitchen mixer", "description_fr": "Mitigeur cuisine chromé haut de gamme, bec haut orientable, garantie 5 ans.", "description_en": "High-end chrome kitchen mixer, high swivel spout, 5-year warranty.", "category": "plomberie", "price": 129, "stock": 24, "images": ["https://images.unsplash.com/photo-1565374393707-4e88e2f4abec"]},
    {"name_fr": "Robinet thermostatique douche", "name_en": "Thermostatic shower valve", "description_fr": "Mitigeur thermostatique de douche, sécurité enfant, finition chrome.", "description_en": "Thermostatic shower mixer, child safety, chrome finish.", "category": "plomberie", "price": 189, "stock": 18, "images": ["https://images.unsplash.com/photo-1620626011761-996317b8d101"]},
    {"name_fr": "Évier inox 1 bac", "name_en": "Stainless steel sink", "description_fr": "Évier inox brossé 1 bac avec égouttoir, dimensions 80x50cm.", "description_en": "Brushed stainless steel sink with drainer, 80x50cm.", "category": "plomberie", "price": 159, "stock": 12, "images": ["https://images.unsplash.com/photo-1556909114-44e3e9399a2e"]},
    {"name_fr": "Serrure A2P 3 étoiles", "name_en": "A2P 3-star lock", "description_fr": "Serrure de sûreté certifiée A2P 3 étoiles, 5 points, anti-perçage.", "description_en": "A2P 3-star certified security lock, 5 points, anti-drill.", "category": "serrurerie", "price": 349, "stock": 9, "images": ["https://images.unsplash.com/photo-1558002038-1055907df827"]},
    {"name_fr": "Cylindre haute sécurité", "name_en": "High-security cylinder", "description_fr": "Cylindre breveté anti-effraction avec 5 clés réversibles.", "description_en": "Patented anti-burglary cylinder with 5 reversible keys.", "category": "serrurerie", "price": 119, "stock": 32, "images": ["https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9"]},
    {"name_fr": "Ballon d'eau chaude 200L", "name_en": "200L water tank", "description_fr": "Chauffe-eau électrique 200L, résistance stéatite, garantie 5 ans.", "description_en": "200L electric water heater, steatite element, 5-year warranty.", "category": "chauffage", "price": 549, "stock": 7, "images": ["https://images.unsplash.com/photo-1585128792020-803d29415281"]},
    {"name_fr": "Chauffe-eau thermodynamique", "name_en": "Heat pump water heater", "description_fr": "Chauffe-eau thermodynamique 250L, classe A+, économe en énergie.", "description_en": "250L heat pump water heater, A+ class, energy efficient.", "category": "chauffage", "price": 1690, "stock": 4, "images": ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece"]},
    {"name_fr": "Prise électrique 16A Schuko", "name_en": "16A Schuko outlet", "description_fr": "Prise 2P+T 16A blanche, normes NF C 15-100, pack de 5.", "description_en": "2P+T 16A white outlet, NF C 15-100, pack of 5.", "category": "electricite", "price": 24, "stock": 120, "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64"]},
    {"name_fr": "Interrupteur va-et-vient", "name_en": "Two-way switch", "description_fr": "Interrupteur va-et-vient blanc encastrable, pack de 5.", "description_en": "Recessed two-way white switch, pack of 5.", "category": "electricite", "price": 19, "stock": 95, "images": ["https://images.unsplash.com/photo-1565608438257-fac3c27beb36"]},
    {"name_fr": "Tableau électrique 4 rangées", "name_en": "4-row electrical panel", "description_fr": "Tableau électrique pré-équipé 4 rangées, 52 modules, certifié NF.", "description_en": "Pre-equipped 4-row electrical panel, 52 modules, NF certified.", "category": "electricite", "price": 289, "stock": 14, "images": ["https://images.unsplash.com/photo-1623910270362-f9c1ee2b7b95"]},
    {"name_fr": "Suspension LED design", "name_en": "Designer LED pendant", "description_fr": "Suspension LED design moderne 24W, 3 températures de couleur.", "description_en": "Modern designer LED pendant 24W, 3 color temperatures.", "category": "electricite", "price": 89, "stock": 28, "images": ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15"]},
    {"name_fr": "Furet plomberie 10m", "name_en": "10m plumbing snake", "description_fr": "Furet manuel 10 mètres pour débouchage canalisations.", "description_en": "10-meter manual snake for pipe unclogging.", "category": "plomberie", "price": 39, "stock": 45, "images": ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39"]},
]


REVIEWS_SEED = [
    {"name": "Marie L.", "rating": 5, "comment": "Intervention ultra rapide pour une fuite d'eau un dimanche soir. Technicien pro, courtois et efficace. Je recommande à 100%.", "service_category": "plomberie"},
    {"name": "Julien P.", "rating": 5, "comment": "Serrurier arrivé en 25 minutes pour porte claquée. Tarif respecté à l'euro près, aucun dégât. Service impeccable.", "service_category": "serrurerie"},
    {"name": "Sophie M.", "rating": 5, "comment": "Mise aux normes du tableau électrique parfaite. Devis clair, travail soigné, factures détaillées. Top.", "service_category": "electricite"},
    {"name": "Thomas D.", "rating": 4, "comment": "Très satisfait du remplacement du chauffe-eau. Technicien à l'écoute. Délai légèrement dépassé mais qualité au rendez-vous.", "service_category": "chauffage"},
    {"name": "Caroline B.", "rating": 5, "comment": "Débouchage canalisation efficace. L'équipe est polie, propre et professionnelle. Devis gratuit comme promis.", "service_category": "assainissement"},
    {"name": "Maxime R.", "rating": 5, "comment": "Service client au top, intervention dans la nuit pour une urgence plomberie. Tarif transparent, je recommande vivement.", "service_category": "plomberie"},
]


async def ensure_user(email: str, password: str, name: str, role: str):
    existing = await db.users.find_one({"email": email})
    if existing:
        # Update password if changed
        if not verify_password(password, existing["password_hash"]):
            await db.users.update_one(
                {"email": email},
                {"$set": {"password_hash": hash_password(password), "role": role, "active": True}},
            )
        return
    await db.users.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": hash_password(password),
        "name": name,
        "phone": None,
        "role": role,
        "addresses": [],
        "active": True,
        "created_at": now_iso(),
    })


async def seed_database():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.services.create_index("category")
    await db.products.create_index("category")
    await db.orders.create_index("user_id")
    await db.interventions.create_index("user_id")

    # Seed accounts
    await ensure_user(os.environ["ADMIN_EMAIL"], os.environ["ADMIN_PASSWORD"], "Administrateur", "admin")
    await ensure_user(os.environ["CLIENT1_EMAIL"], os.environ["CLIENT1_PASSWORD"], "Jean Dupont", "client")
    await ensure_user(os.environ["CLIENT2_EMAIL"], os.environ["CLIENT2_PASSWORD"], "Marie Martin", "client")

    # Seed services
    if await db.services.count_documents({}) == 0:
        category_images = {
            "plomberie": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg",
            "electricite": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
            "serrurerie": "https://images.unsplash.com/photo-1564767609213-c75ee685263a",
            "chauffage": "https://images.unsplash.com/photo-1660330589827-da8ab7dd3c02",
            "assainissement": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg",
        }
        for s in SERVICES_SEED:
            doc = {**s}
            doc.setdefault("image_url", category_images.get(doc["category"], ""))
            doc.setdefault("popular", False)
            doc.setdefault("active", True)
            doc.setdefault("price_label", None)
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = now_iso()
            await db.services.insert_one(doc)

    # Seed products
    if await db.products.count_documents({}) == 0:
        for p in PRODUCTS_SEED:
            doc = {**p}
            doc.setdefault("active", True)
            doc["id"] = str(uuid.uuid4())
            doc["created_at"] = now_iso()
            await db.products.insert_one(doc)

    # Seed reviews
    if await db.reviews.count_documents({}) == 0:
        for r in REVIEWS_SEED:
            doc = {**r}
            doc["id"] = str(uuid.uuid4())
            doc["approved"] = True
            doc["created_at"] = now_iso()
            await db.reviews.insert_one(doc)


@app.on_event("startup")
async def on_startup():
    await seed_database()
    logger.info("✅ SOS Dépannage France API ready")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# Include router and CORS
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
