import { useState, useCallback } from 'react';
import { AutomataCanvas } from '@/components/AutomataCanvas';
import { Toolbar } from '@/components/Toolbar';
import { ConversionView } from '@/components/ConversionView';
import { State, Transition, Position, Tool, Automaton } from '@/types/automata';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [automaton, setAutomaton] = useState<Automaton>({
    states: [],
    transitions: [],
    alphabet: [],
    type: 'NFA',
  });
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [nextStateId, setNextStateId] = useState(0);
  const [nextTransitionId, setNextTransitionId] = useState(0);
  const [showConversion, setShowConversion] = useState(false);

  const handleStateAdd = useCallback((position: Position) => {
    const newState: State = {
      id: `q${nextStateId}`,
      label: `q${nextStateId}`,
      position,
      isInitial: automaton.states.length === 0, // First state is initial
      isAccepting: false,
      isSelected: false,
    };

    setAutomaton(prev => ({
      ...prev,
      states: [...prev.states, newState],
    }));
    setNextStateId(prev => prev + 1);
    toast.success(`Added state ${newState.label}`);
  }, [nextStateId, automaton.states.length]);

  const handleStateSelect = useCallback((id: string) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(state => ({
        ...state,
        isSelected: state.id === id,
      })),
      transitions: prev.transitions.map(transition => ({
        ...transition,
        isSelected: false,
      })),
    }));
  }, []);

  const handleStateMove = useCallback((id: string, position: Position) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(state =>
        state.id === id ? { ...state, position } : state
      ),
    }));
  }, []);

  const handleTransitionAdd = useCallback((from: string, to: string) => {
    const symbol = prompt('Enter transition symbol:') || 'ε';
    
    const newTransition: Transition = {
      id: `t${nextTransitionId}`,
      from,
      to,
      symbol,
      isSelected: false,
    };

    setAutomaton(prev => ({
      ...prev,
      transitions: [...prev.transitions, newTransition],
      alphabet: prev.alphabet.includes(symbol) 
        ? prev.alphabet 
        : [...prev.alphabet, symbol],
    }));
    setNextTransitionId(prev => prev + 1);
    toast.success(`Added transition: ${from} → ${to} (${symbol})`);
  }, [nextTransitionId]);

  const handleDelete = useCallback((id: string, type: 'state' | 'transition') => {
    if (type === 'state') {
      setAutomaton(prev => ({
        ...prev,
        states: prev.states.filter(state => state.id !== id),
        transitions: prev.transitions.filter(
          transition => transition.from !== id && transition.to !== id
        ),
      }));
      toast.success(`Deleted state ${id}`);
    } else {
      setAutomaton(prev => ({
        ...prev,
        transitions: prev.transitions.filter(transition => transition.id !== id),
      }));
      toast.success(`Deleted transition`);
    }
  }, []);

  const handleConvert = useCallback(() => {
    if (automaton.states.length === 0) {
      toast.error('Add some states first!');
      return;
    }
    
    if (automaton.type === 'NFA') {
      setShowConversion(true);
    } else {
      // Simple toggle for now
      setAutomaton(prev => ({ ...prev, type: 'NFA' }));
      toast.success('Converted to NFA');
    }
  }, [automaton.type, automaton.states.length]);

  const handleValidate = useCallback(() => {
    if (automaton.states.length === 0) {
      toast.error('No automaton to validate!');
      return;
    }

    const initialStates = automaton.states.filter(s => s.isInitial);
    const acceptingStates = automaton.states.filter(s => s.isAccepting);
    
    let isValid = true;
    const issues = [];

    if (initialStates.length === 0) {
      issues.push('No initial state defined');
      isValid = false;
    }

    if (automaton.type === 'DFA' && initialStates.length > 1) {
      issues.push('DFA cannot have multiple initial states');
      isValid = false;
    }

    if (acceptingStates.length === 0) {
      issues.push('No accepting states defined');
    }

    if (isValid && issues.length === 0) {
      toast.success('Automaton is valid!');
    } else {
      toast.error(`Issues found: ${issues.join(', ')}`);
    }
  }, [automaton]);

  const handleClear = useCallback(() => {
    setAutomaton({
      states: [],
      transitions: [],
      alphabet: [],
      type: 'NFA',
    });
    setNextStateId(0);
    setNextTransitionId(0);
    toast.success('Canvas cleared');
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(automaton, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'automaton.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Automaton exported');
  }, [automaton]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setAutomaton(data);
          toast.success('Automaton imported');
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const toggleStateProperty = useCallback((id: string, property: 'isInitial' | 'isAccepting') => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(state =>
        state.id === id
          ? { ...state, [property]: !state[property] }
          : property === 'isInitial' && !state[property]
          ? state // Only one initial state for DFA
          : state
      ),
    }));
  }, []);

  if (showConversion) {
    return (
      <ConversionView 
        nfa={automaton} 
        onBack={() => setShowConversion(false)} 
      />
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 p-4 border-r border-border bg-background/50 backdrop-blur-sm">
        <Toolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onConvert={handleConvert}
          onValidate={handleValidate}
          onClear={handleClear}
          onExport={handleExport}
          onImport={handleImport}
        />
        
        {/* Automaton Info */}
        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-2 text-sm">Automaton Info</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-mono bg-accent/20 px-1 rounded">
                {automaton.type}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">States:</span>
              <span>{automaton.states.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transitions:</span>
              <span>{automaton.transitions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alphabet:</span>
              <span className="font-mono text-xs">
                {automaton.alphabet.length > 0 ? `{${automaton.alphabet.join(', ')}}` : '∅'}
              </span>
            </div>
          </div>
        </div>

        {/* Final States Panel */}
        <div className="mt-4 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-2 text-sm">Final States</h3>
          <div className="space-y-2">
            {automaton.states.length === 0 ? (
              <p className="text-xs text-muted-foreground">No states available</p>
            ) : (
              automaton.states.map(state => (
                <div key={state.id} className="flex items-center justify-between">
                  <span className="text-xs font-mono">{state.label}</span>
                  <Button
                    size="sm"
                    variant={state.isAccepting ? "default" : "outline"}
                    className="h-6 px-2 text-xs"
                    onClick={() => toggleStateProperty(state.id, 'isAccepting')}
                  >
                    {state.isAccepting ? "Final" : "Set Final"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <AutomataCanvas
        states={automaton.states}
        transitions={automaton.transitions}
        activeTool={activeTool}
        onStateAdd={handleStateAdd}
        onStateSelect={(id) => handleStateSelect(id)}
        onStateMove={handleStateMove}
        onTransitionAdd={handleTransitionAdd}
        onDelete={handleDelete}
        onStateDoubleClick={(id) => toggleStateProperty(id, 'isAccepting')}
        onStateRightClick={(id) => toggleStateProperty(id, 'isInitial')}
      />

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border max-w-sm">
        <h4 className="font-semibold text-sm mb-2">Quick Guide</h4>
        <div className="text-xs space-y-1 text-muted-foreground">
          <div><strong>Select:</strong> Click to select, drag to move</div>
          <div><strong>Add State:</strong> Click on canvas</div>
          <div><strong>Add Transition:</strong> Click source, then target</div>
          <div><strong>Delete:</strong> Click elements to remove</div>
          <div><strong>Double-click state:</strong> Toggle accepting</div>
          <div><strong>Right-click state:</strong> Toggle initial</div>
        </div>
      </div>
    </div>
  );
};

export default Index;