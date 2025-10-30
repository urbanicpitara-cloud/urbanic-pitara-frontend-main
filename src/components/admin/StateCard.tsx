import {
  LucideIcon,
  User,
  Package,
  ShoppingBag,
  Wallet,
  XCircle,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: "user" | "package" | "shopping-bag" | "wallet" | "xcircle";
  accent?: "beige" | "gold" | "brown" | "green" | "red";
  currency?: boolean; // 💰 optional currency formatting
};

export default function StatCard({
  title,
  value,
  icon = "package",
  accent = "beige",
  currency = false,
}: StatCardProps) {
  const IconComponent: Record<string, LucideIcon> = {
    user: User,
    package: Package,
    "shopping-bag": ShoppingBag,
    wallet: Wallet,
    xcircle: XCircle,
  };

  const AccentColors: Record<string, string> = {
    beige: "bg-[#F5F1E6] text-[#5A4A2B]",
    gold: "bg-[#FDE68A] text-[#7A5D00]",
    brown: "bg-[#E9D8A6] text-[#4B3621]",
    green: "bg-[#D1FAE5] text-[#065F46]",
    red: "bg-[#FEE2E2] text-[#991B1B]",
  };

  const Icon = IconComponent[icon];
  const accentClasses = AccentColors[accent] || AccentColors.beige;

  // ✅ Number formatter for large values
  const formatValue = (val: string | number): string => {
    if (typeof val === "string") return val;

    const absVal = Math.abs(val);
    if (absVal >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
    if (absVal >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (absVal >= 1_000) return `${(val / 1_000).toFixed(2)}K`;

    return val.toString();
  };

  const displayValue = currency
    ? `₹${formatValue(value)}`
    : formatValue(value);

  return (
    <div
      className="flex items-center justify-between bg-white p-6 rounded-2xl 
                 shadow-sm border border-gray-200 transition-all 
                 hover:shadow-md hover:-translate-y-0.5 duration-200"
    >
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-sm text-gray-500 font-medium tracking-wide truncate">
          {title}
        </p>
        <p
          className="text-2xl font-semibold text-gray-900 mt-2 truncate"
          title={displayValue} // hover tooltip for full value
        >
          {displayValue}
        </p>
      </div>

      <div
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${accentClasses}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
