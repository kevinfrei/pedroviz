// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactElement, useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';

import { isNull, isUndefined } from '@freik/typechk';

import { FieldVizPercentAtom, ThemeAtom } from '../state/SavedSettings';
import { FieldConfigHashAtom } from '../state/UserCode';
import {
  Offset,
  ResponsiveAnchor,
  ResponsiveSquareCanvasProps,
} from '../types';

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
      <svg
        style={{
          opacity: fieldViz,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          stroke: theme === 'dark' ? '#ccc' : '#333',
          background: theme === 'dark' ? '#222' : '#ddd',
          overflow: 'hidden',
        }}
        preserveAspectRatio={getPreserveAspectRation(fieldAnchor)}
        viewBox="5 5 1130 1130"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="bounds">
            <rect x="5" y="5" width="1130" height="1130" />
          </clipPath>
          <path
            id="ln"
            style={{
              strokeWidth: 0.75,
              fill: 'none',
              strokeLinejoin: 'round',
              overflow: 'none',
            }}
            d="M0,4 L5,8 L7,8 L5,0 L17,0 L15,8 L27,8 L25,0 L37,0 L35,8 L47,8 L45,0 L57,0 L55,8 L67,8 L65,0 L77,0 L75,8 L87,8 L85,0 L93,0 L94.25,4"
          />
          <g id="corner">
            <use href="#ln" x="4" y="0" />
            <use href="#ln" x="-192.5" y="-8" transform="rotate(180)" />
            <use href="#ln" x="4" y="-8" transform="rotate(90)" />
            <use href="#ln" x="-192.5" y="0" transform="rotate(-90)" />
          </g>
          <g id="row">
            <use href="#corner" x="0" />
            <use href="#corner" x="188.5" />
            <use href="#corner" x="377" />
            <use href="#corner" x="565.5" />
            <use href="#corner" x="754" />
            <use href="#corner" x="942.5" />
            <use href="#corner" x="1131" />
          </g>
        </defs>
        <g clipPath="url(#bounds)">
          <use href="#row" />
          <use href="#row" y="188.5" />
          <use href="#row" y="377" />
          <use href="#row" y="565.5" />
          <use href="#row" y="754" />
          <use href="#row" y="942.5" />
          <use href="#row" y="1131" />
        </g>
      </svg>
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
