// SPDX-License-Identifier: AGPL-3.0-or-later

import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAtomValue } from 'jotai';

import { Button, makeStyles, tokens } from '@fluentui/react-components';
import {
  LayoutColumnTwoFocusRightFilled,
  WindowMultipleRegular,
} from '@fluentui/react-icons';
import { isNull, isUndefined } from '@freik/typechk';

import {
  Offset,
  ResponsiveAnchor,
  ResponsiveSquareCanvasProps,
} from '../ClientTypes';
import {
  FieldVizPercentAtom,
  ThemeAtom,
  UseExternalFieldAtom,
} from '../state/SavedSettings';
import { FieldConfigHashAtom, HasFieldImageAtom } from '../state/UserCode';

const defaultAnchor: ResponsiveAnchor = { x: 'center', y: 'middle' };

function translateX(x: 'left' | 'center' | 'right') {
  switch (x) {
    case 'left':
      return 'start';
    case 'center':
      return 'center';
    case 'right':
      return 'end';
  }
}

function translateY(y: 'top' | 'middle' | 'bottom') {
  switch (y) {
    case 'top':
      return 'start';
    case 'middle':
      return 'middle';
    case 'bottom':
      return 'end;';
  }
}

function getObjectPos(anchor: ResponsiveAnchor): string {
  const x = anchor.x === 'center' ? '50%' : anchor.x;
  const y = anchor.y === 'middle' ? '50%' : anchor.y;
  return `${x} ${y}`;
}

function getPreserveAspectRation(anchor: ResponsiveAnchor): string {
  const x = anchor.x === 'center' ? 'Mid' : anchor.x == 'left' ? 'Min' : 'Max';
  const y = anchor.y === 'middle' ? 'Mid' : anchor.y == 'top' ? 'Min' : 'Max';
  return `x${x}Y${y} meet`;
}

// Absolute positioned canvas requires offsets to follow the anchor location
function getCanvasOffset(
  anchor: ResponsiveAnchor,
  width: number,
  height: number,
): Offset {
  const delta = Math.abs(height - width);
  let top = 0;
  let left = 0;
  if (width < height) {
    switch (anchor.y) {
      case 'middle':
        top = Math.floor(delta / 2);
        break;
      case 'bottom':
        top = delta;
        break;
    }
  } else {
    switch (anchor.x) {
      case 'center':
        left = Math.floor(delta / 2);
        break;
      case 'right':
        left = delta;
        break;
    }
  }
  return { top, left };
}

export function ResponsiveSquareCanvas({
  anchor,
  style,
  className,
  render,
  animate,
}: ResponsiveSquareCanvasProps): ReactElement {
  const fieldAnchor: ResponsiveAnchor = anchor || defaultAnchor;
  const theme = useAtomValue(ThemeAtom);
  const redrawField = useAtomValue(FieldConfigHashAtom);
  const fieldViz = useAtomValue(FieldVizPercentAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<HTMLCanvasElement>(null); // Offscreen cache
  const requestRef = useRef<number>(null);
  const observerRef = useRef<ResizeObserver>(null);
  const hasCustomField = useAtomValue(HasFieldImageAtom);
  const useCustomField = useAtomValue(UseExternalFieldAtom);
  const [canvasOffset, setCanvasOffset] = useState<Offset>({ top: 0, left: 0 });

  // Okay, so to enable animation without re-rendering the whole canvas,
  // we create a memory image to blit for every animation frame.

  // First, create the cached canvas:
  useEffect(() => {
    if (!mainRef.current) {
      return;
    }
    if (animate) {
      const main = mainRef.current;
      cacheRef.current = document.createElement('canvas');
      cacheRef.current.width = main.width;
      cacheRef.current.height = main.height;
    } else {
      cacheRef.current = null;
    }
  }, [animate]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use devicePixelContentBoxSize for sharp rendering on HiDPI screens
        // const size = entry.devicePixelContentBoxSize[0];
        const size = entry.contentBoxSize[0];
        if (isUndefined(size)) {
          continue;
        }
        const newSize = Math.min(size.inlineSize, size.blockSize);

        const main = mainRef.current;
        const cache = cacheRef.current;

        if (isNull(main) || (animate && isNull(cache))) {
          continue;
        }
        // 1. Resize both canvases (this clears them)
        main.width = newSize;
        main.height = newSize;
        if (animate) {
          cache!.width = newSize;
          cache!.height = newSize;
        }
        // 2. Set the canvas location offsets according to the 'ResponsiveAnchor' parameter:
        const offset = getCanvasOffset(
          fieldAnchor,
          size.inlineSize,
          size.blockSize,
        );
        if (
          offset.left !== canvasOffset.left ||
          offset.top !== canvasOffset.top
        ) {
          setCanvasOffset(offset);
        }
        // 3. Immediately redraw the background to the new cache size
        // This ensures the cache is never empty or stretched
        const ctx = animate ? cache!.getContext('2d') : main.getContext('2d');
        if (isNull(ctx)) {
          continue;
        }
        render(ctx, window.devicePixelRatio || 1);
      }
    });

    // Observe the container using 'device-pixel-content-box' for crisp canvas rendering
    observerRef.current.observe(element, { box: 'device-pixel-content-box' });

    return () => observerRef.current?.disconnect();
  }, [
    animate,
    render,
    fieldAnchor,
    redrawField /* TODO: This should trigger for any changes to the paths! */,
  ]); // Re-bind if background logic changes

  // Animation Loop (Unchanged, just uses current canvas.width/height)
  const animateFrame = () => {
    if (!animate) return;
    const main = mainRef.current;
    const cache = cacheRef.current;
    if (!main || !cache) return;

    const ctx = main.getContext('2d');
    if (isNull(ctx)) {
      return;
    }
    ctx.clearRect(0, 0, main.width, main.height);

    // Draw the fresh cache (which was updated on resize)
    ctx.drawImage(cache, 0, 0);

    animate(ctx, window.devicePixelRatio || 1);
    requestRef.current = requestAnimationFrame(animateFrame);
  };

  useEffect(() => {
    if (animate) {
      requestRef.current = requestAnimationFrame(animateFrame);
      return () => cancelAnimationFrame(requestRef.current!);
    }
  }, [animate]);

  return (
    <div
      ref={containerRef}
      style={{
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: translateX(fieldAnchor.x),
        alignItems: translateY(fieldAnchor.y),
        overflow: 'hidden',
      }}>
      <img
        src={`/img/${hasCustomField && useCustomField ? 'field' : 'svg'}/${theme}`}
        style={{
          objectPosition: getObjectPos(fieldAnchor),
          opacity: fieldViz,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      <canvas
        style={{
          ...style,
          position: 'absolute',
          left: `${canvasOffset.left}px`,
          top: `${canvasOffset.top}px`,
        }}
        className={className}
        ref={mainRef}
      />
    </div>
  );
}

const useStyles = makeStyles({
  floatingPanel: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
    overflow: 'hidden',
    zIndex: 1000,
    resize: 'both',
    minWidth: '200px',
    minHeight: '200px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    ':active': {
      cursor: 'grabbing',
    },
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: 0,
    overflow: 'hidden',
  },
});

// WIP:
/*export*/ function MovableCanvas(): ReactElement {
  const styles = useStyles();
  const [isPoppedOut, setIsPoppedOut] = useState(false);

  // Position state for tracking where the panel lives on screen
  const [position, setPosition] = useState({ x: 100, y: 100 });

  // Refs to manage dragging logic without triggering excessive re-renders
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag if clicking the header itself, not the buttons inside it
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }
    draggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - position.x,
      y: Math.max(0, e.clientY - position.y),
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;

    // We intentionally do NOT clamp x to window bounds here,
    // which allows the window go partially off-screen.
    setPosition({
      x: e.clientX - offsetRef.current.x,
      y: Math.max(0, e.clientY - offsetRef.current.y),
    });
  }, []);

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {} // Just in case already released...
  };

  return (
    <>
      {/* Trigger Button to Pop Out */}
      {!isPoppedOut && (
        <Button
          appearance="primary"
          onClick={() => setIsPoppedOut(true)}
          icon={<WindowMultipleRegular />}
        />
      )}

      {/* Custom Movable & Resizable Floating Panel */}
      {isPoppedOut && (
        <div
          className={styles.floatingPanel}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            width: '450px',
            height: '450px',
          }}>
          {/* Grabber Handle Header */}
          <div
            className={styles.header}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}>
            <span style={{ fontWeight: 600 }}>
              Grab Handle: Field Visualizer
            </span>
            <Button
              appearance="subtle"
              icon={<LayoutColumnTwoFocusRightFilled />}
              size="small"
              onClick={() => setIsPoppedOut(false)}
              title="Dock back / Close"
            />
          </div>

          {/* Resizable Content Section */}
          <div className={styles.contentArea}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#111',
                color: '#fff',
              }}>
              <canvas style={{ width: '100%', height: '100%' }} />
              <span style={{ position: 'absolute' }}>
                X: {position.x} Y: {position.y}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
