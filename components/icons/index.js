import { useId } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function GlobeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z" />
    </svg>
  );
}

export function TelegramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="M21 4 3 11.2l6.2 2.1" />
      <path d="M9.2 13.3 20 4l-3.1 16-6.9-5.1-3.5 3.2v-4.8" />
    </svg>
  );
}

export function ExternalLinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="M14 5h5v5" />
      <path d="M19 5 10 14" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function SwapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
    </svg>
  );
}

export function RocketIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <path d="M13.5 3.5c3 1 5 3 6 6-2.5 1-5 3-7 6.5-1.7 0-3.2-.5-4-1.3-.8-.8-1.3-2.3-1.3-4C10.7 7 12.7 4.7 13.5 3.5Z" />
      <path d="M9 15l-3.5 3.5" />
      <path d="M8.5 10.5C6.7 10.8 5 12 4.3 14" />
      <path d="M13.5 15.5c.3-1.8 1.5-3.5 3.5-4.3" />
      <circle cx="14.3" cy="9.7" r="1.1" />
    </svg>
  );
}

export function DropletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  );
}

export function WalletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PieChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 3v9l7.5 4.3" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function UserPlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19c.7-3 3-4.8 5.5-4.8s4.8 1.8 5.5 4.8" />
      <line x1="18" y1="9" x2="18" y2="15" />
      <line x1="15" y1="12" x2="21" y2="12" />
    </svg>
  );
}

export function GiftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1.5" />
      <path d="M4 9.5h16" />
      <path d="M12 9.5V20" />
      <path d="M12 9.5C10.5 9.5 8.5 8.7 8.5 6.7A2.2 2.2 0 0 1 12 4.9c0 1-.5 2.4-1.7 3.2" />
      <path d="M12 9.5c1.5 0 3.5-.8 3.5-2.8A2.2 2.2 0 0 0 12 4.9c0 1 .5 2.4 1.7 3.2" />
    </svg>
  );
}

export function VoteIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 3v10" />
      <path d="M8 8l4-5 4 5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
    </svg>
  );
}

export function DocsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <line x1="8.5" y1="12" x2="15" y2="12" />
      <line x1="8.5" y1="15.5" x2="15" y2="15.5" />
    </svg>
  );
}

export function ShieldCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12 3.5 19 6.5v5c0 5-3 8.2-7 9.5-4-1.3-7-4.5-7-9.5v-5Z" />
      <path d="M9 12.2l2 2 4-4.2" />
    </svg>
  );
}

export function HeadsetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.3" />
      <rect x="17" y="13" width="4" height="6" rx="1.3" />
      <path d="M19 19v.5a3.5 3.5 0 0 1-3.5 3.5H13" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H11a1.7 1.7 0 0 0 1-1.5V5a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V11a1.7 1.7 0 0 0 1.5 1H19a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function FlameIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M12 3c1.5 2.5-1 3.5-1 6.5A3.5 3.5 0 0 0 15 13c0-1.2-.4-1.8-.8-2.4 1.8 1 3.3 3 3.3 5.4A5.5 5.5 0 0 1 12 21.5 5.5 5.5 0 0 1 6.5 16c0-4.5 4-6 5.5-13Z" />
    </svg>
  );
}

export function LockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function BarChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <line x1="5" y1="20" x2="5" y2="13" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="19" y1="20" x2="19" y2="4" />
    </svg>
  );
}

export function StarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8Z" />
    </svg>
  );
}

export function DiamondIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="M12 2.5 5 10l7 11.5L19 10Z" />
      <path d="M5 10h14" />
    </svg>
  );
}

export function FilterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M4 5h16" />
      <path d="M7 12h10" />
      <path d="M10 19h4" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </svg>
  );
}

export function ArrowDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <line x1="12" y1="4" x2="12" y2="19" />
      <polyline points="6 13 12 19 18 13" />
    </svg>
  );
}

export function EditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...props}>
      <path d="M4 20l.9-4L16.5 4.4a1.5 1.5 0 0 1 2.1 0l1 1a1.5 1.5 0 0 1 0 2.1L8 19l-4 1Z" />
      <line x1="14.5" y1="6.5" x2="17.5" y2="9.5" />
    </svg>
  );
}

export function ConstructionIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" {...base} {...props}>
      <path d="M4 20 12 5l8 15Z" />
      <line x1="9.3" y1="14.5" x2="14.7" y2="14.5" />
      <line x1="12" y1="9.5" x2="12" y2="11.7" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlusCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function CompassIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5Z" />
    </svg>
  );
}

export function BountyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <path d="M9 7h6l2.5 3.5c.8 1.1 1.2 2.4 1.2 3.8 0 3.6-3.9 6.2-8.7 6.2S1.3 18 1.3 14.3c0-1.4.4-2.7 1.2-3.8L5 7Z" />
      <path d="M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3" />
      <circle cx="12" cy="13.5" r="2" />
    </svg>
  );
}

export function BroadcastIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M8.5 15.5a5 5 0 0 1 0-7" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.5 18.5a9.5 9.5 0 0 1 0-13" />
      <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
    </svg>
  );
}

export function CoinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...props}>
      <circle cx="12" cy="9" r="6.5" />
      <path d="M12 6.2v5.6" />
      <path d="M9.8 10.6c0 1 .9 1.6 2.2 1.6s2.2-.6 2.2-1.6-.9-1.4-2.2-1.6c-1.3-.2-2.2-.6-2.2-1.6s.9-1.6 2.2-1.6 2.2.6 2.2 1.6" />
      <path d="M4.5 14c-1 .6-1.6 1.4-1.6 2.2 0 2.2 4 4 9 4s9-1.8 9-4c0-.8-.6-1.6-1.6-2.2" />
    </svg>
  );
}

export function ZapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M12.5 3 5 14h5.5L11 21l7.5-11H13Z" />
    </svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.5 2.5L16 9.5" />
    </svg>
  );
}

export function UploadImageIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10.5" r="1.6" />
      <path d="M3.5 16l5-4.5 3.5 3 3-2.5 5.5 4" />
    </svg>
  );
}

export function DexScreenerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" {...base} {...props}>
      <line x1="5" y1="4" x2="5" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="19" y1="4" x2="19" y2="20" />
      <rect x="3.3" y="8.5" width="3.4" height="5" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="10.3" y="6" width="3.4" height="8" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="17.3" y="11" width="3.4" height="6" rx="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <path d="M4 4l16 16" />
      <path d="M9.5 6.2A10.6 10.6 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a15.5 15.5 0 0 1-3.6 4.3M6.6 7.6C4 9.4 2 12 2 12s3.6 6.5 10 6.5c1.3 0 2.5-.2 3.6-.7" />
      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

export function ReceiveIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <path d="M6 13l6 6 6-6" />
    </svg>
  );
}

export function BridgeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...props}>
      <path d="M3 16v-2c0-3.3 4-6 9-6s9 2.7 9 6v2" />
      <line x1="3" y1="19" x2="21" y2="19" />
      <line x1="6.5" y1="16" x2="6.5" y2="19" />
      <line x1="12" y1="16" x2="12" y2="19" />
      <line x1="17.5" y1="16" x2="17.5" y2="19" />
    </svg>
  );
}

export function MoreVerticalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrendingUpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M3 16l6-6 4 4 8-9" />
      <path d="M15 5h6v6" />
    </svg>
  );
}

export function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 6.2c1.4.4 2.4 1.7 2.4 3.2s-1 2.8-2.4 3.2" />
      <path d="M18.5 14.3c2 .7 3.5 2.6 3.5 5" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <line x1="3.5" y1="10" x2="20.5" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function EthIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path d="M12 1.5 12 10.2 5 12.6Z" fill="#9AA0AC" />
      <path d="M12 1.5 19 12.6 12 10.2Z" fill="#5C6270" />
      <path d="M12 10.2 5 12.6 12 14.6 19 12.6Z" fill="#14151A" />
      <path d="M12 16.3 5 14.1 12 22.5Z" fill="#9AA0AC" />
      <path d="M12 16.3 19 14.1 12 22.5Z" fill="#5C6270" />
    </svg>
  );
}


export function BnbIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" {...props}>
      <path
        fill="#F0B90B"
        d="M7.792 6.647L12 4.286l4.209 2.361l-1.543.874L12 6.03L9.34 7.52zm8.417 2.983l-1.543-.874L12 10.247L9.34 8.756l-1.547.874v1.744l2.657 1.492v2.978l1.551.874l1.547-.874v-2.978l2.662-1.492zm0 4.727V12.61l-1.543.874v1.744zm1.101.617l-2.661 1.487v1.749l4.208-2.366v-4.723l-1.547.87zM15.763 8.14l1.543.874v1.744l1.551-.87V8.14l-1.547-.875l-1.547.879zm-5.314 8.957v1.744l1.551.874l1.547-.874V17.1L12 17.97l-1.547-.874zm-2.657-2.743l1.543.874v-1.744l-1.543-.875v1.75zm2.657-6.214L12 9.013l1.547-.874L12 7.264l-1.547.879zm-3.759.874l1.547-.874l-1.543-.875l-1.55.879V9.89l1.546.87zm0 2.978l-1.547-.87v4.723l4.209 2.366v-1.753L6.694 14.97v-2.983z"
      />
    </svg>
  );
}

export function TronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}>
      <path
        d="M2.4 2.2 19.4 3.9 21.6 8 12.2 21.8 2.4 8.2Z"
        stroke="#FF060A"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M2.4 2.2 9.6 5.1 19.4 3.9" stroke="#FF060A" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M9.6 5.1 21.6 8" stroke="#FF060A" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M9.6 5.1 12.2 21.8" stroke="#FF060A" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function SolanaIcon(props) {
  const gradientId = `solana-gradient-${useId()}`;
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <defs>
        <linearGradient id={gradientId} x1="2" y1="19" x2="22" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path d="M5.5 6.3 20 6.3 17.2 9.2 3 9.2Z" fill={`url(#${gradientId})`} />
      <path d="M3 11.4 17.2 11.4 20 14.3 5.5 14.3Z" fill={`url(#${gradientId})`} />
      <path d="M5.5 16.5 20 16.5 17.2 19.4 3 19.4Z" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function InfoIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const CHAIN_ICON_MAP = {
  EthIcon,
  BnbIcon,
  TronIcon,
  SolanaIcon,
};


export function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.2 1.1-3.6 1.1-2.8 0-5.2-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.8c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.5 15 1.5 12 1.5A11 11 0 0 0 2.3 7.4l3.7 2.8c.8-2.5 3.2-4.4 6-4.4Z"
      />
    </svg>
  );
}

export function MetaMaskIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path fill="#E17726" d="M20.9 2.5 12.9 8.3l1.5-3.5Z" />
      <path fill="#E27625" d="M3.1 2.5 11 8.4 9.6 4.8Z" />
      <path fill="#E27625" d="M18 16.2l-2.2 3.3 4.6 1.3 1.3-4.5Z" />
      <path fill="#E27625" d="M2.3 16.3l1.3 4.5 4.6-1.3-2.2-3.3Z" />
      <path fill="#E27625" d="m7.9 10.5-1.3 1.9 4.5.2-.2-4.8Z" />
      <path fill="#E27625" d="m16.1 10.5-3.1-2.8-.1 4.9 4.5-.2Z" />
      <path fill="#E27625" d="M8.2 19.5l2.7-1.3-2.4-1.9Z" />
      <path fill="#E27625" d="m13.1 18.2 2.7 1.3-.3-3.2Z" />
    </svg>
  );
}

export function PhantomIcon(props) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <defs>
        <linearGradient id={`ph-${id}`} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#AB9FF2" />
          <stop offset="100%" stopColor="#6C5DD3" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#ph-${id})`}
        d="M12 2C6.9 2 3 6.2 3 11.6V19a3 3 0 0 0 3 3h1.2c.7 0 1.3-.6 1.3-1.3v-2.4c0-.6.5-1 1-1s1 .4 1 1v2.4c0 .7.6 1.3 1.3 1.3H14.5c.7 0 1.3-.6 1.3-1.3v-2.4c0-.6.5-1 1-1s1 .4 1 1v2.4c0 .7.6 1.3 1.3 1.3H21a3 3 0 0 0 0-6h-.1C20.6 6.6 16.8 2 12 2Z"
      />
      <circle cx="9" cy="12" r="1.4" fill="#FFFFFF" />
      <circle cx="14.5" cy="12" r="1.4" fill="#FFFFFF" />
    </svg>
  );
}

export function WalletConnectIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <rect width="24" height="24" rx="6" fill="#3396FF" />
      <path
        fill="#FFFFFF"
        d="M7.1 9.5c2.7-2.6 7.1-2.6 9.8 0l.3.3c.1.1.1.4 0 .5l-1.1 1.1c-.1.1-.2.1-.3 0l-.5-.4c-1.9-1.8-4.9-1.8-6.8 0l-.5.5c-.1.1-.2.1-.3 0L6.6 10.4c-.1-.1-.1-.4 0-.5Zm12.1 2.3 1 1c.1.1.1.4 0 .5l-4.4 4.4c-.1.1-.4.1-.5 0l-3.2-3.1a.1.1 0 0 0-.2 0l-3.2 3.1c-.1.1-.4.1-.5 0L3.8 13.3c-.1-.1-.1-.4 0-.5l1-1c.1-.1.4-.1.5 0l3.2 3.1a.1.1 0 0 0 .2 0l3.2-3.1c.1-.1.4-.1.5 0l3.2 3.1a.1.1 0 0 0 .2 0l3.2-3.1c.1-.1.3-.1.4 0Z"
      />
    </svg>
  );
}

export function CoinbaseWalletIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <circle cx="12" cy="12" r="10.5" fill="#0052FF" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#FFFFFF" />
    </svg>
  );
}

export function OkxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <rect width="24" height="24" rx="5" fill="#000000" />
      <rect x="9.75" y="9.75" width="4.5" height="4.5" fill="#FFFFFF" />
      <rect x="3.5" y="3.5" width="4.5" height="4.5" fill="#FFFFFF" />
      <rect x="16" y="3.5" width="4.5" height="4.5" fill="#FFFFFF" />
      <rect x="3.5" y="16" width="4.5" height="4.5" fill="#FFFFFF" />
      <rect x="16" y="16" width="4.5" height="4.5" fill="#FFFFFF" />
    </svg>
  );
}

export function RabbyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path
        fill="#7084FF"
        d="M6 10.5c-1.4-2-1.7-4.3-1.2-5.8.2-.6 1-.7 1.4-.2l2.4 3c1-.3 2.2-.5 3.4-.5s2.4.2 3.4.5l2.4-3c.4-.5 1.2-.4 1.4.2.5 1.5.2 3.8-1.2 5.8 1 1.2 1.6 2.7 1.6 4.4 0 4-3.6 6.6-8 6.6s-8-2.6-8-6.6c0-1.7.6-3.2 1.4-4.4Z"
      />
      <circle cx="9.3" cy="14" r="1.3" fill="#FFFFFF" />
      <circle cx="14.7" cy="14" r="1.3" fill="#FFFFFF" />
    </svg>
  );
}

export function AppleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF" {...props}>
      <path d="M16.4 12.5c0-2.4 2-3.6 2-3.6-1.1-1.6-2.9-1.9-3.5-1.9-1.5-.1-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1.9-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.7c1.3 0 2.2-1.2 3-2.4.6-.9.9-1.4 1.4-2.4-.1-.1-2.6-1-2.6-4.2Zm-2.5-7.7c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </svg>
  );
}

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10Z"
      />
    </svg>
  );
}

export function XSocialIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF" {...props}>
      <path d="M13.9 10.4 21 2.5h-2.6l-6.1 6.9-4.9-6.9H2l7.4 10.5L2 21.5h2.6l6.5-7.3 5.2 7.3H22l-8.1-11.1Zm-2.3 2.6-.8-1.1L5 4.3h2.4l4.9 6.8.8 1.1 6.3 8.9h-2.4l-5.2-7.1Z" />
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

export function ShareIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...props}>
      <circle cx="18" cy="5" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="19" r="2.3" />
      <line x1="8.1" y1="10.8" x2="15.9" y2="6.2" />
      <line x1="8.1" y1="13.2" x2="15.9" y2="17.8" />
    </svg>
  );
}

export function ArrowDownToLineIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M12 4v11" />
      <polyline points="7.5 11 12 15.5 16.5 11" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </svg>
  );
}

export function ArrowUpFromLineIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...props}>
      <path d="M12 20V9" />
      <polyline points="7.5 13 12 8.5 16.5 13" />
      <line x1="5" y1="4" x2="19" y2="4" />
    </svg>
  );
}

export function DefaultAvatarIcon(props) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <defs>
        <linearGradient id={`avatar-${id}`} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#avatar-${id})`} />
      <circle cx="12" cy="9.8" r="3.4" fill="#FFFFFF" fillOpacity="0.9" />
      <path d="M4.8 19.5c1.1-3.3 3.8-5 7.2-5s6.1 1.7 7.2 5" fill="#FFFFFF" fillOpacity="0.9" />
    </svg>
  );
}
