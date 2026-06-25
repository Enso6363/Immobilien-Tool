import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Home } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function PropertySwitcher() {
  const properties = useAppStore((s) => s.properties);
  const activePropertyId = useAppStore((s) => s.activePropertyId);
  const setActiveProperty = useAppStore((s) => s.setActiveProperty);

  if (properties.length === 0) return null;

  return (
    <Select.Root value={activePropertyId ?? undefined} onValueChange={setActiveProperty}>
      <Select.Trigger
        className="flex min-w-56 items-center justify-between gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none"
        aria-label="Immobilie wählen"
      >
        <span className="flex items-center gap-2 truncate">
          <Home size={16} className="text-ink-soft" aria-hidden />
          <Select.Value />
        </span>
        <Select.Icon>
          <ChevronDown size={16} className="text-ink-soft" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 overflow-hidden rounded-md border border-line bg-surface shadow-md">
          <Select.Viewport className="p-1">
            {properties.map((p) => (
              <Select.Item
                key={p.id}
                value={p.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-surface-2',
                )}
              >
                <Select.ItemText>{p.name}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={14} className="text-accent" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
