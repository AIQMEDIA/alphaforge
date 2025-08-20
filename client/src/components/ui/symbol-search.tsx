import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SymbolSearchProps {
  value: string[];
  onChange: (symbols: string[]) => void;
  placeholder?: string;
  className?: string;
  maxSelections?: number;
}

// Popular symbols for quick selection
const popularSymbols = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'SQ', name: 'Block Inc.' },
  { symbol: 'ZM', name: 'Zoom Video Communications' },
  { symbol: 'DOCU', name: 'DocuSign Inc.' }
];

export function SymbolSearch({ 
  value, 
  onChange, 
  placeholder = "Search symbols...", 
  className,
  maxSelections 
}: SymbolSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSymbols = popularSymbols.filter(item =>
    item.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const addSymbol = (symbol: string) => {
    if (!value.includes(symbol) && (!maxSelections || value.length < maxSelections)) {
      onChange([...value, symbol]);
    }
    setSearchValue('');
    setOpen(false);
  };

  const removeSymbol = (symbolToRemove: string) => {
    onChange(value.filter(symbol => symbol !== symbolToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      e.preventDefault();
      const upperSymbol = searchValue.trim().toUpperCase();
      if (!value.includes(upperSymbol) && (!maxSelections || value.length < maxSelections)) {
        onChange([...value, upperSymbol]);
        setSearchValue('');
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            data-testid="symbol-search-trigger"
          >
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search stocks..." 
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p>No symbols found.</p>
                  {searchValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSymbol(searchValue.toUpperCase())}
                      className="mt-2"
                    >
                      Add "{searchValue.toUpperCase()}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup heading="Popular Symbols">
                {filteredSymbols.map((item) => (
                  <CommandItem
                    key={item.symbol}
                    value={item.symbol}
                    onSelect={() => addSymbol(item.symbol)}
                    className="cursor-pointer"
                    data-testid={`symbol-option-${item.symbol}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(item.symbol) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-xs text-muted-foreground">{item.name}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected symbols */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((symbol) => (
            <Badge 
              key={symbol} 
              variant="secondary" 
              className="flex items-center gap-1 pl-2 pr-1"
              data-testid={`selected-symbol-${symbol}`}
            >
              {symbol}
              <button
                type="button"
                onClick={() => removeSymbol(symbol)}
                className="ml-1 rounded-full hover:bg-muted"
                data-testid={`remove-symbol-${symbol}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {maxSelections && (
        <p className="text-xs text-muted-foreground">
          {value.length}/{maxSelections} symbols selected
        </p>
      )}
    </div>
  );
}