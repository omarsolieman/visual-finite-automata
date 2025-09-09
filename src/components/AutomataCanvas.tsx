import { useRef, useEffect, useState, useCallback } from 'react';
import { State, Transition, Position, Tool } from '@/types/automata';
import { StateNode } from './StateNode';
import { TransitionEdge } from './TransitionEdge';

interface AutomataCanvasProps {
  states: State[];
  transitions: Transition[];
  activeTool: Tool;
  onStateAdd: (position: Position) => void;
  onStateSelect: (id: string) => void;
  onStateMove: (id: string, position: Position) => void;
  onTransitionAdd: (from: string, to: string) => void;
  onDelete: (id: string, type: 'state' | 'transition') => void;
  onStateDoubleClick: (id: string) => void;
  onStateRightClick: (id: string) => void;
}

export const AutomataCanvas = ({
  states,
  transitions,
  activeTool,
  onStateAdd,
  onStateSelect,
  onStateMove,
  onTransitionAdd,
  onDelete,
  onStateDoubleClick,
  onStateRightClick,
}: AutomataCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedState, setDraggedState] = useState<string | null>(null);
  const [transitionStart, setTransitionStart] = useState<string | null>(null);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'state') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    onStateAdd(position);
  }, [activeTool, onStateAdd]);

  const handleStateMouseDown = useCallback((stateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeTool === 'select') {
      setDraggedState(stateId);
      onStateSelect(stateId);
    } else if (activeTool === 'transition') {
      if (!transitionStart) {
        setTransitionStart(stateId);
      } else {
        onTransitionAdd(transitionStart, stateId);
        setTransitionStart(null);
      }
    } else if (activeTool === 'delete') {
      onDelete(stateId, 'state');
    }
  }, [activeTool, transitionStart, onStateSelect, onTransitionAdd, onDelete]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedState || activeTool !== 'select') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    onStateMove(draggedState, position);
  }, [draggedState, activeTool, onStateMove]);

  const handleMouseUp = useCallback(() => {
    setDraggedState(null);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggedState(null);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full bg-canvas-bg relative cursor-crosshair overflow-hidden"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: `
            radial-gradient(circle, hsl(var(--canvas-grid)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Render transitions first (behind states) */}
        {transitions.map((transition, index) => {
          const fromState = states.find(s => s.id === transition.from);
          const toState = states.find(s => s.id === transition.to);
          
          if (!fromState || !toState) return null;
          
          // Find all transitions in the same direction (from->to)
          const sameDirection = transitions.filter(t => t.from === transition.from && t.to === transition.to);
          // Find all transitions in the reverse direction (to->from)
          const reverseDirection = transitions.filter(t => t.from === transition.to && t.to === transition.from);

          // If there are multiple transitions in the same direction, offset each one
          let isCurved = false;
          let curveOffset = 0;
          if (sameDirection.length > 1 || reverseDirection.length > 0) {
            isCurved = true;
            // Offset each transition in the same direction by its index
            const idx = sameDirection.findIndex(t => t.id === transition.id);
            // Spread out curves: e.g. -40, 0, +40 for 3 transitions
            const spread = 40;
            const total = sameDirection.length;
            curveOffset = (idx - (total - 1) / 2) * spread;
            // For reverse direction, flip the sign
            if (reverseDirection.length > 0 && transition.from > transition.to) {
              curveOffset = -curveOffset;
            }
          }
          return (
            <TransitionEdge
              key={transition.id}
              transition={transition}
              fromPosition={fromState.position}
              toPosition={toState.position}
              onSelect={() => onStateSelect(transition.id)}
              onDelete={() => onDelete(transition.id, 'transition')}
              canDelete={activeTool === 'delete'}
              isCurved={isCurved}
              curveOffset={curveOffset}
            />
          );
        })}

        {/* Render states */}
        {states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            onMouseDown={(e) => handleStateMouseDown(state.id, e)}
            onDoubleClick={onStateDoubleClick}
            onRightClick={onStateRightClick}
            isTransitionSource={transitionStart === state.id}
          />
        ))}

        {/* Transition preview line */}
        {transitionStart && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <line
                x1={states.find(s => s.id === transitionStart)?.position.x}
                y1={states.find(s => s.id === transitionStart)?.position.y}
                x2={states.find(s => s.id === transitionStart)?.position.x}
                y2={states.find(s => s.id === transitionStart)?.position.y}
                stroke="hsl(var(--transition))"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};