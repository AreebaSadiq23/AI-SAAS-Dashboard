"""Generic in-memory repository.

The repository pattern isolates the rest of the app from the storage backend.
Swapping the in-memory dicts for a SQL/async database only requires new
repository implementations with the same interface.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class InMemoryRepository(Generic[T]):
    def __init__(self, collection: dict[str, T], id_getter: Callable[[T], str]) -> None:
        self._collection = collection
        self._id = id_getter

    def get(self, entity_id: str) -> T | None:
        return self._collection.get(entity_id)

    def list(self, predicate: Callable[[T], bool] | None = None) -> list[T]:
        items = list(self._collection.values())
        if predicate:
            items = [i for i in items if predicate(i)]
        return items

    def add(self, entity: T) -> T:
        self._collection[self._id(entity)] = entity
        return entity

    def update(self, entity: T) -> T:
        self._collection[self._id(entity)] = entity
        return entity

    def delete(self, entity_id: str) -> bool:
        return self._collection.pop(entity_id, None) is not None
