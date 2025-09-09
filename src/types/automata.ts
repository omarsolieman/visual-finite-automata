export interface Position {
  x: number;
  y: number;
}

export interface State {
  id: string;
  label: string;
  position: Position;
  isInitial: boolean;
  isAccepting: boolean;
  isSelected: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string;
  isSelected: boolean;
}

export interface Automaton {
  states: State[];
  transitions: Transition[];
  alphabet: string[];
  type: 'NFA' | 'DFA';
}

export type Tool = 'select' | 'state' | 'transition' | 'delete';