from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import activity, auth, dashboard, health, ideas, projects, sandbox, settings as settings_routes, tags, tasks
from app.core.config import get_settings


app_settings = get_settings()

app = FastAPI(
    title=app_settings.app_name,
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(ideas.router)
app.include_router(sandbox.router)
app.include_router(tags.router)
app.include_router(activity.router)
app.include_router(settings_routes.router)
