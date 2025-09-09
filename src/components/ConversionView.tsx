import { useState } from 'react';
import { Automaton, State, Transition } from '@/types/automata';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ConversionStep {
  step: number;
  description: string;
  currentStates: string[];
  newState?: string;
  transitions: { from: string; symbol: string; to: string[] }[];
  resultAutomaton: {
    states: State[];
    transitions: Transition[];
  };
}

interface ConversionViewProps {
  nfa: Automaton;
  onBack: () => void;
}

export const ConversionView = ({ nfa, onBack }: ConversionViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [conversionSteps, setConversionSteps] = useState<ConversionStep[]>([]);
  const [isConverted, setIsConverted] = useState(false);

  const convertNFAToDFA = () => {
    if (nfa.states.length === 0) return;

    const steps: ConversionStep[] = [];
    const dfaStates: State[] = [];
    const dfaTransitions: Transition[] = [];
    let stateCounter = 0;

    // Helper function to get epsilon closure
    const getEpsilonClosure = (stateIds: string[]): string[] => {
      const closure = new Set(stateIds);
      const stack = [...stateIds];
      
      while (stack.length > 0) {
        const current = stack.pop()!;
        const epsilonTransitions = nfa.transitions.filter(
          t => t.from === current && (t.symbol === 'ε' || t.symbol === 'epsilon')
        );
        
        for (const trans of epsilonTransitions) {
          if (!closure.has(trans.to)) {
            closure.add(trans.to);
            stack.push(trans.to);
          }
        }
      }
      
      return Array.from(closure).sort();
    };

    // Step 1: Find initial state
    const initialStates = nfa.states.filter(s => s.isInitial).map(s => s.id);
    const initialClosure = getEpsilonClosure(initialStates);
    
    const initialDFAState: State = {
      id: `q${stateCounter++}`,
      label: `{${initialClosure.join(', ')}}`,
      position: { x: 100, y: 100 },
      isInitial: true,
      isAccepting: initialClosure.some(id => nfa.states.find(s => s.id === id)?.isAccepting),
      isSelected: false,
    };
    
    dfaStates.push(initialDFAState);
    
    steps.push({
      step: 1,
      description: `Initial state: ε-closure({${initialStates.join(', ')}}) = {${initialClosure.join(', ')}}`,
      currentStates: initialClosure,
      newState: initialDFAState.id,
      transitions: [],
      resultAutomaton: { states: [initialDFAState], transitions: [] }
    });

    // Process queue for subset construction
    const unprocessed = [{ states: initialClosure, dfaStateId: initialDFAState.id }];
    const processed = new Map<string, string>(); // stateset -> dfa state id
    processed.set(initialClosure.join(','), initialDFAState.id);

    let stepNumber = 2;

    while (unprocessed.length > 0) {
      const current = unprocessed.shift()!;
      const alphabet = nfa.alphabet.filter(symbol => symbol !== 'ε' && symbol !== 'epsilon');
      
      for (const symbol of alphabet) {
        // Find all states reachable on this symbol
        const reachableStates = new Set<string>();
        
        for (const stateId of current.states) {
          const transitions = nfa.transitions.filter(
            t => t.from === stateId && t.symbol === symbol
          );
          transitions.forEach(t => reachableStates.add(t.to));
        }
        
        if (reachableStates.size === 0) continue;
        
        // Get epsilon closure
        const closure = getEpsilonClosure(Array.from(reachableStates));
        const closureKey = closure.join(',');
        
        let targetStateId = processed.get(closureKey);
        
        if (!targetStateId) {
          // Create new DFA state
          const newDFAState: State = {
            id: `q${stateCounter++}`,
            label: `{${closure.join(', ')}}`,
            position: { x: 100 + (dfaStates.length * 150), y: 100 },
            isInitial: false,
            isAccepting: closure.some(id => nfa.states.find(s => s.id === id)?.isAccepting),
            isSelected: false,
          };
          
          dfaStates.push(newDFAState);
          processed.set(closureKey, newDFAState.id);
          targetStateId = newDFAState.id;
          
          unprocessed.push({ states: closure, dfaStateId: newDFAState.id });
        }
        
        // Add transition
        const transition: Transition = {
          id: `t${dfaTransitions.length}`,
          from: current.dfaStateId,
          to: targetStateId,
          symbol,
          isSelected: false,
        };
        
        dfaTransitions.push(transition);
        
        steps.push({
          step: stepNumber++,
          description: `From {${current.states.join(', ')}} on '${symbol}' → ε-closure({${Array.from(reachableStates).join(', ')}}) = {${closure.join(', ')}}`,
          currentStates: closure,
          newState: processed.get(closureKey) === targetStateId ? targetStateId : undefined,
          transitions: [{
            from: current.dfaStateId,
            symbol,
            to: Array.from(reachableStates)
          }],
          resultAutomaton: { 
            states: [...dfaStates], 
            transitions: [...dfaTransitions] 
          }
        });
      }
    }

    setConversionSteps(steps);
    setIsConverted(true);
  };

  const nextStep = () => {
    if (currentStep < conversionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Canvas
            </Button>
            <h2 className="text-lg font-semibold">NFA to DFA Conversion</h2>
          </div>
          
          {!isConverted && (
            <Button onClick={convertNFAToDFA} className="bg-gradient-primary">
              Start Conversion
            </Button>
          )}
        </div>
      </div>

      {!isConverted ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h3 className="text-xl font-semibold mb-4">Ready to Convert</h3>
            <p className="text-muted-foreground mb-6">
              Click "Start Conversion" to see the step-by-step process of converting your NFA to DFA using the subset construction algorithm.
            </p>
            <Button onClick={convertNFAToDFA} className="bg-gradient-primary">
              Start Conversion
            </Button>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Steps Navigation */}
          <div className="w-80 border-r border-border bg-card/30 p-4">
            <h3 className="font-semibold mb-4">Conversion Steps</h3>
            <div className="space-y-2">
              {conversionSteps.map((step, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'bg-accent/50 text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="font-medium">Step {step.step}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {step.description.length > 60 
                      ? step.description.substring(0, 60) + '...' 
                      : step.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Details */}
          <div className="flex-1 p-6">
            {conversionSteps[currentStep] && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Step {conversionSteps[currentStep].step}
                  </h3>
                  <p className="text-muted-foreground">
                    {conversionSteps[currentStep].description}
                  </p>
                </div>

                {/* Transition Table */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Transition Table</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 font-medium">State</th>
                          {nfa.alphabet.filter(s => s !== 'ε' && s !== 'epsilon').map(symbol => (
                            <th key={symbol} className="text-left p-2 font-medium">{symbol}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {conversionSteps[currentStep].resultAutomaton.states.map(state => (
                          <tr key={state.id} className="border-b border-border/50">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {state.isInitial && <span className="text-state-initial">→</span>}
                                {state.isAccepting && <span className="text-state-accepting">*</span>}
                                <span className="font-mono">{state.label}</span>
                              </div>
                            </td>
                            {nfa.alphabet.filter(s => s !== 'ε' && s !== 'epsilon').map(symbol => {
                              const transition = conversionSteps[currentStep].resultAutomaton.transitions.find(
                                t => t.from === state.id && t.symbol === symbol
                              );
                              const targetState = transition 
                                ? conversionSteps[currentStep].resultAutomaton.states.find(s => s.id === transition.to)
                                : null;
                              
                              return (
                                <td key={symbol} className="p-2 font-mono text-sm">
                                  {targetState ? targetState.label : '∅'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={nextStep}
                    disabled={currentStep === conversionSteps.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};