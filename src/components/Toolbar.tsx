import { MousePointer, Circle, ArrowRight, Trash2, Play, FileDown, FileUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tool } from '@/types/automata';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  onConvert: () => void;
  onValidate: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const Toolbar = ({
  activeTool,
  onToolChange,
  onConvert,
  onValidate,
  onClear,
  onExport,
  onImport,
}: ToolbarProps) => {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select' },
    { id: 'state' as Tool, icon: Circle, label: 'Add State' },
    { id: 'transition' as Tool, icon: ArrowRight, label: 'Add Transition' },
    { id: 'delete' as Tool, icon: Trash2, label: 'Delete' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            Automata Builder
          </h2>
          <p className="text-sm text-muted-foreground">
            NFA/DFA Constructor & Converter
          </p>
        </div>

        <Separator />

        {/* Tools */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Tools
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => onToolChange(tool.id)}
                  className={cn(
                    "flex items-center gap-2 justify-start",
                    activeTool === tool.id && "shadow-glow"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Actions
          </h3>
          <div className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onValidate}
              className="w-full flex items-center gap-2 justify-start"
            >
              <Play className="w-4 h-4" />
              <span className="text-xs">Validate</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onConvert}
              className="w-full flex items-center gap-2 justify-start"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs">Convert NFA↔DFA</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* File Operations */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            File
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onImport}
              className="flex items-center gap-1 justify-center"
            >
              <FileUp className="w-4 h-4" />
              <span className="text-xs">Import</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              className="flex items-center gap-1 justify-center"
            >
              <FileDown className="w-4 h-4" />
              <span className="text-xs">Export</span>
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="w-full flex items-center gap-2 justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Clear All</span>
          </Button>
        </div>
      </div>
    </div>
  );
};