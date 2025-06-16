# app/notificaciones/event_bus.py
import asyncio, inspect
from typing import Callable, Dict, List

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, callback: Callable):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(callback)

    async def emit(self, event_name: str, data: dict):
        """
        Lanza los callbacks. Si es coroutine, lo schedulea;
        si no, lo invoca directamente.
        """
        for callback in self._subscribers.get(event_name, []):
            if inspect.iscoroutinefunction(callback):
                # crea la tarea en el loop actual
                asyncio.create_task(callback(data))
            else:
                callback(data)

# Instancia global
event_bus = EventBus()
