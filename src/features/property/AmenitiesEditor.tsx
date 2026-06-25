import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AmenitiesEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  function addFromDraft() {
    const next = draft.trim();
    if (!next || value.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...value, next]);
    setDraft('');
  }

  function remove(item: string) {
    onChange(value.filter((a) => a !== item));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((a) => (
          <span
            key={a}
            className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-soft"
          >
            {a}
            <button
              type="button"
              onClick={() => remove(a)}
              aria-label={`${a} entfernen`}
              className="text-ink-soft hover:text-ink"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-ink-soft">Keine Ausstattung hinzugefügt.</span>}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addFromDraft();
          }
        }}
        onBlur={addFromDraft}
        placeholder="Ausstattung eingeben und Enter drücken (z.B. WLAN)"
      />
    </div>
  );
}
