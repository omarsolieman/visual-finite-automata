import { State } from '@/types/automata';
import { cn } from '@/lib/utils';

interface StateNodeProps {
  state: State;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: (stateId: string) => void;
  onRightClick?: (stateId: string) => void;
  isTransitionSource?: boolean;
}

export const StateNode = ({ state, onMouseDown, onDoubleClick, onRightClick, isTransitionSource }: StateNodeProps) => {
  const getStateColor = () => {
    if (state.isSelected) return 'bg-state-selected border-state-selected';
    if (state.isInitial) return 'bg-state-initial border-state-initial';
    if (state.isAccepting) return 'bg-state-accepting border-state-accepting';
    return 'bg-state-regular border-state-regular';
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.(state.id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRightClick?.(state.id);
  };

  return (
    <div
      className={cn(
        "absolute w-12 h-12 rounded-full border-2 flex items-center justify-center",
        "cursor-pointer select-none font-semibold text-sm",
        "transition-all duration-200 hover:scale-110",
        "shadow-state",
        getStateColor(),
        isTransitionSource && "animate-pulse ring-4 ring-accent/50",
        state.isAccepting && "ring-2 ring-offset-2 ring-offset-canvas-bg ring-current"
      )}
      style={{
        left: state.position.x - 24,
        top: state.position.y - 24,
        transform: state.isSelected ? 'scale(1.1)' : 'scale(1)',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
    >
      <span className="text-background font-bold">
        {state.label}
      </span>
      
      {/* Initial state arrow */}
      {state.isInitial && (
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
          <svg width="20" height="8" viewBox="0 0 20 8">
            <path
              d="M0 4 L16 4 M12 1 L16 4 L12 7"
              stroke="hsl(var(--state-initial))"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};