# Simple helper to build absolute URLs without depending on django.contrib.sites
from django.conf import settings

def absolute_url(path: str) -> str:
    if path.startswith("http"):
        return path
    # Dev helper; change to your public domain in prod if needed
    domain = "127.0.0.1:8000"
    scheme = "http"
    return f"{scheme}://{domain}{path}"
