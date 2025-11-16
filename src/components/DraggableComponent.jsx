'use client';

import { useRef, useState, useEffect } from 'react';
import { generateDragId, registerDrag, wouldCollide } from '@/lib/dragRegistry';
import { setLocationByGrid } from '@/lib/windowMath';
import { WIDGET_GRID_DIM } from '@/app/page';

const DraggableComponent = ({ children, widgetId, dim = { x: 1, y: 1}, initialGridPosition = { x: 0, y: 0 }, onPositionChange}) => {
  const [componentLoaded, setComponentLoaded] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});
  const elementRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const idRef = useRef(widgetId);
  const unregisterRef = useRef(null);
  const lastValidRef = useRef(position);
  const SNAP_GRID_SIZE = 20;

  const snapToGrid = (value) => Math.round(value / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;

  useEffect(() => {
    // register a getter that returns the current bounding rect (viewport coords)
    unregisterRef.current = registerDrag(idRef.current, () => {
      const el = elementRef.current;
      if (!el) return null;
      // return a DOMRect-like plain object
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    });

    return () => {
      unregisterRef.current?.();
    };
  }, []);

  useEffect(() => {
    setPosition(setLocationByGrid(initialGridPosition.x, initialGridPosition.y));
    setComponentLoaded(true);
  }, []);

  const handleMouseDown = (e) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
    // bring to front while dragging
    if (elementRef.current) elementRef.current.style.zIndex = 999;
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;

    const newX = snapToGrid(e.clientX - dragRef.current.startX);
    const newY = snapToGrid(e.clientY - dragRef.current.startY);

    const el = elementRef.current;
    if (!el) return;

    // compute prospective rect in viewport coordinates
    const parent = el.offsetParent || el.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const left = parentRect.left + newX;
    const top = parentRect.top + newY;
    const prospectiveRect = { left, top, right: left + width, bottom: top + height, width, height };

    // Don't block movement here. Instead, remember the last valid (non-overlapping)
    // position so we can revert on mouse up if the user releases while overlapping.
    const collides = wouldCollide(idRef.current, prospectiveRect);
    if (!collides) {
      lastValidRef.current = { x: newX, y: newY };
    }

    // Always update the visual position while dragging (tentative).
    setPosition({ x: newX, y: newY });
    onPositionChange?.({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    // On mouse release, check whether we ended overlapping another item.
    // If so, revert to the last known non-overlapping position.
    const el = elementRef.current;
    if (el) {
      const parent = el.offsetParent || el.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 };
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const left = parentRect.left + position.x;
      const top = parentRect.top + position.y;
      const currentRect = { left, top, right: left + width, bottom: top + height, width, height };
      const collides = wouldCollide(idRef.current, currentRect);
      if (collides) {
        // revert to last valid (non-overlapping) position
        const last = lastValidRef.current || initialPosition;
        setPosition(last);
        onPositionChange?.(last);
      }
      el.style.zIndex = '';
    }

    dragRef.current.isDragging = false;
  };

  return ( componentLoaded &&
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'move',
        userSelect: 'none',
        width: dim.x * (100),
        height: dim.y * (100),
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="text-black bg-white p-4 rounded-lg shadow-md min-w-[200px]"
    >
      {children}
    </div>
  );
};

export default DraggableComponent;