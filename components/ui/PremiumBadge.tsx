import { Lock } from "lucide-react";

export default function PremiumBadge({ showLock = false, children }: { showLock?: boolean; children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f3e8ff] text-[#c084fc] text-xs font-semibold shadow-sm">
      {showLock && <Lock className="w-3 h-3 mr-1" />}
      {children || 'Premium'}
    </span>
  );
} 