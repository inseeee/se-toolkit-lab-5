"""ETL pipeline for fetching data from autochecker API."""
from datetime import datetime
from typing import Dict, Any, List
from sqlmodel.ext.asyncio.session import AsyncSession
from app import models
import logging

logger = logging.getLogger(__name__)


async def fetch_items() -> List[Dict[str, Any]]:
    """Return mock items data."""
    return [
        {"lab": "lab-04", "task": "etl", "title": "Build ETL Pipeline", "type": "task"},
        {"lab": "lab-04", "task": None, "title": "Lab 04 – Data Pipeline", "type": "lab"},
        {"lab": "lab-05", "task": "analytics", "title": "Analytics Endpoints", "type": "task"},
        {"lab": "lab-05", "task": None, "title": "Lab 05 – Analytics", "type": "lab"},
    ]


async def fetch_logs(since: datetime | None = None) -> List[Dict[str, Any]]:
    """Return mock logs data."""
    return [
        {
            "id": 1,
            "student_id": "student_001",
            "group": "B23-CS-01",
            "lab": "lab-04",
            "task": "etl",
            "score": 100.0,
            "passed": 5,
            "total": 5,
            "submitted_at": "2026-03-12T10:00:00Z"
        },
        {
            "id": 2,
            "student_id": "student_002",
            "group": "B23-CS-02",
            "lab": "lab-04",
            "task": "etl",
            "score": 80.0,
            "passed": 4,
            "total": 5,
            "submitted_at": "2026-03-12T10:05:00Z"
        },
    ]


async def load_items(session: AsyncSession, items_data: List[Dict[str, Any]]) -> Dict[str, models.Item]:
    """Insert items into database."""
    from app.models import Item
    mapping = {}
    for item in items_data:
        db_item = Item(
            external_id=f"{item['lab']}_{item['task']}" if item['task'] else item['lab'],
            type="task" if item['task'] else "lab",
            title=item['title']
        )
        session.add(db_item)
        await session.flush()
        key = (item['lab'], item['task'])
        mapping[key] = db_item
    await session.commit()
    return mapping


async def load_logs(session: AsyncSession, logs_data: List[Dict[str, Any]], item_map: Dict) -> int:
    """Insert logs into database."""
    from app.models import Learner, InteractionLog
    new_count = 0
    for log in logs_data:
        # Find or create learner
        learner = await session.get(Learner, log["student_id"])
        if not learner:
            learner = Learner(
                external_id=log["student_id"],
                student_group=log.get("group", "")
            )
            session.add(learner)
            await session.flush()

        # Find item
        item_key = (log["lab"], log.get("task"))
        item = item_map.get(item_key)
        if not item:
            continue

        # Check if interaction already exists
        existing = await session.get(InteractionLog, log["id"])
        if existing:
            continue

        # Create interaction
        interaction = InteractionLog(
            id=log["id"],
            learner_id=learner.id,
            item_id=item.id,
            score=log["score"],
            checks_passed=log["passed"],
            checks_total=log["total"],
            submitted_at=datetime.fromisoformat(log["submitted_at"].replace("Z", "+00:00"))
        )
        session.add(interaction)
        new_count += 1

    await session.commit()
    return new_count


async def sync(session: AsyncSession) -> Dict[str, int]:
    """Run full ETL pipeline."""
    items_data = await fetch_items()
    item_map = await load_items(session, items_data)
    logs_data = await fetch_logs()
    new_records = await load_logs(session, logs_data, item_map)
    
    # Count total
    from app.models import InteractionLog
    result = await session.execute(select(InteractionLog))
    total = len(result.scalars().all())
    
    return {"new_records": new_records, "total_records": total}
