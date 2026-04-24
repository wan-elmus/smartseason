from routers.auth import router as auth_router
from routers.fields import router as fields_router
from routers.updates import router as updates_router
from routers.dashboard import router as dashboard_router
from routers.ai import router as ai_router
from routers.upload import router as upload_router
from routers.users import router as users_router
from routers.trends import router as trends_router

__all__ = [
    "auth_router",
    "fields_router",
    "updates_router",
    "dashboard_router",
    "ai_router",
    "upload_router",
    "users_router",
    "trends_router",
]