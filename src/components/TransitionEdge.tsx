import { Transition, Position } from '@/types/automata';
import { cn } from '@/lib/utils';

interface TransitionEdgeProps {
  transition: Transition;
  fromPosition: Position;
  toPosition: Position;
  onSelect: () => void;
  onDelete: () => void;
  canDelete: boolean;
  isCurved?: boolean;
  curveOffset?: number;
}

export const TransitionEdge = ({
  transition,
  fromPosition,
  toPosition,
  onSelect,
  onDelete,
  canDelete,
  isCurved = false,
  curveOffset = 0,
}: TransitionEdgeProps) => {
  // Calculate the angle and distance between states
  const dx = toPosition.x - fromPosition.x;
  const dy = toPosition.y - fromPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Offset positions to edge of circles (radius = 24px)
  const startX = fromPosition.x + Math.cos(angle) * 24;
  const startY = fromPosition.y + Math.sin(angle) * 24;
  const endX = toPosition.x - Math.cos(angle) * 24;
  const endY = toPosition.y - Math.sin(angle) * 24;

  // Calculate midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Handle self-loops
  const isSelfLoop = transition.from === transition.to;

  if (isSelfLoop) {
    const loopRadius = 20;
    const loopX = fromPosition.x;
    const loopY = fromPosition.y - 24 - loopRadius;

    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {/* Self-loop circle */}
          <circle
            cx={loopX}
            cy={loopY}
            r={loopRadius}
            fill="none"
            stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
            strokeWidth={transition.isSelected ? "3" : "2"}
            className="pointer-events-auto cursor-pointer"
            onClick={canDelete ? onDelete : onSelect}
          />
          
          {/* Arrow for self-loop */}
          <path
            d={`M ${loopX + loopRadius * 0.7} ${loopY - loopRadius * 0.7} L ${loopX + loopRadius} ${loopY} L ${loopX + loopRadius * 0.7} ${loopY + loopRadius * 0.7}`}
            fill="none"
            stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
            strokeWidth={transition.isSelected ? "3" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Label for self-loop */}
          <text
            x={loopX}
            y={loopY - loopRadius - 8}
            textAnchor="middle"
            className="text-sm font-semibold fill-transition pointer-events-auto cursor-pointer"
            onClick={canDelete ? onDelete : onSelect}
          >
            {transition.symbol}
          </text>
        </svg>
      </div>
    );
  }

  if (isCurved) {
    // Create curved path for overlapping transitions
    const controlOffset = curveOffset || 40;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Calculate perpendicular offset
    const perpAngle = angle + Math.PI / 2;
    const controlX = midX + Math.cos(perpAngle) * controlOffset;
    const controlY = midY + Math.sin(perpAngle) * controlOffset;
    
    // Calculate curve midpoint for label
    const curveMidX = (startX + 2 * controlX + endX) / 4;
    const curveMidY = (startY + 2 * controlY + endY) / 4;
    
    // Calculate arrow angle at end of curve
    const arrowAngle = Math.atan2(endY - controlY, endX - controlX);
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          {/* Curved transition path */}
          <path
            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
            fill="none"
            stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
            strokeWidth={transition.isSelected ? "3" : "2"}
            className="pointer-events-auto cursor-pointer"
            onClick={canDelete ? onDelete : onSelect}
          />
          
          {/* Arrow head */}
          <path
            d={`M ${endX - Math.cos(arrowAngle - 0.3) * 10} ${endY - Math.sin(arrowAngle - 0.3) * 10} 
                L ${endX} ${endY} 
                L ${endX - Math.cos(arrowAngle + 0.3) * 10} ${endY - Math.sin(arrowAngle + 0.3) * 10}`}
            fill="none"
            stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
            strokeWidth={transition.isSelected ? "3" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Transition label */}
          <text
            x={curveMidX}
            y={curveMidY - 8}
            textAnchor="middle"
            className={cn(
              "text-sm font-semibold pointer-events-auto cursor-pointer",
              "fill-transition",
              transition.isSelected && "fill-state-selected"
            )}
            onClick={canDelete ? onDelete : onSelect}
          >
            {transition.symbol}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        {/* Transition line */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
          strokeWidth={transition.isSelected ? "3" : "2"}
          className="pointer-events-auto cursor-pointer"
          onClick={canDelete ? onDelete : onSelect}
        />
        
        {/* Arrow head */}
        <path
          d={`M ${endX - Math.cos(angle - 0.3) * 10} ${endY - Math.sin(angle - 0.3) * 10} 
              L ${endX} ${endY} 
              L ${endX - Math.cos(angle + 0.3) * 10} ${endY - Math.sin(angle + 0.3) * 10}`}
          fill="none"
          stroke={transition.isSelected ? "hsl(var(--state-selected))" : "hsl(var(--transition))"}
          strokeWidth={transition.isSelected ? "3" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Transition label */}
        <text
          x={midX}
          y={midY - 8}
          textAnchor="middle"
          className={cn(
            "text-sm font-semibold pointer-events-auto cursor-pointer",
            "fill-transition",
            transition.isSelected && "fill-state-selected"
          )}
          onClick={canDelete ? onDelete : onSelect}
        >
          {transition.symbol}
        </text>
      </svg>
    </div>
  );
};