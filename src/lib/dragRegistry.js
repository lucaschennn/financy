// Simple in-memory registry to track draggable elements and detect collisions.
const registry = new Map();

export function registerDrag(id, getRectFn) {
  if (!id || typeof getRectFn !== 'function') return () => {};
  registry.set(id, getRectFn);
  return () => registry.delete(id);
}

function rectsOverlap(a, b) {
  if (!a || !b) return false;
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

// Check whether the given rect would collide with any other registered rect
export function wouldCollide(id, rect) {
  for (const [otherId, getRect] of registry.entries()) {
    if (otherId === id) continue;
    try {
      const otherRect = getRect();
      if (!otherRect) continue;
      if (rectsOverlap(rect, otherRect)) return true;
    } catch (e) {
      // ignore individual errors reading rect
    }
  }
  return false;
}

export function getRegisteredIds() {
  return Array.from(registry.keys());
}
