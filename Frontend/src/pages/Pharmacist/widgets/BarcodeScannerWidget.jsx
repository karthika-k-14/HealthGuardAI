import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ScanLine } from 'lucide-react';

/**
 * UI-only placeholder — real barcode scanning would use the device
 * camera (e.g. via a barcode-detection library). Demonstrates the
 * intended affordance for a future implementation.
 */
export default function BarcodeScannerWidget() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.success('Barcode scanned: Paracetamol 500mg (demo)');
    }, 1300);
  };

  return (
    <div className="surface-card flex items-center justify-between gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <ScanLine className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Barcode Scanner</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Scan a medicine to look it up · placeholder</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-60 dark:border-white/10 dark:text-slate-300"
      >
        <ScanLine className="h-3.5 w-3.5" />
        {scanning ? 'Scanning…' : 'Scan now'}
      </button>
    </div>
  );
}
