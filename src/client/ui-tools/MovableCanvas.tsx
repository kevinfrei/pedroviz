import React, { ReactElement, useCallback, useRef, useState } from 'react';

import { Button, makeStyles, tokens } from '@fluentui/react-components';
import {
  LayoutColumnTwoFocusRightFilled,
  WindowMultipleRegular,
} from '@fluentui/react-icons';

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

export function MovableCanvas(): ReactElement {
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
