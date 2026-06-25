import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccessField({ label, value }: { label: string; value: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="text-sm text-ink-soft">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-ink">{visible ? value : '••••••••'}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `${label} ausblenden` : `${label} anzeigen`}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </Button>
      </div>
    </div>
  );
}
