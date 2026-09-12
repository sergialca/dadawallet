import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { Design } from '@/constants/design';

type IconProps = {
  color?: string;
  size?: number;
};

export function HexLogo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Polygon
        points="16,2 28,9.2 28,22.8 16,30 4,22.8 4,9.2"
        fill={Design.colors.primaryContainer}
      />
      <Polygon
        points="16,8 22,11.6 22,18.4 16,22 10,18.4 10,11.6"
        fill={Design.colors.onPrimary}
      />
    </Svg>
  );
}

export function CopyIcon({ color = Design.colors.secondary, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
      />
      <Path
        d="M3.5 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5h6A1.5 1.5 0 0 1 10.5 3v.5"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
      />
    </Svg>
  );
}

export function BellIcon({ color = Design.colors.onSurface, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 9a6 6 0 1 1 12 0c0 3.2.86 5.1 1.8 6.4.4.54 0 1.6-.66 1.6H4.86c-.66 0-1.06-1.06-.66-1.6C5.14 14.1 6 12.2 6 9Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <Path d="M10 18.5a2 2 0 0 0 4 0" fill="none" stroke={color} strokeWidth="1.6" />
    </Svg>
  );
}

export function UserIcon({ color = Design.colors.onPrimary, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="3.2" fill="none" stroke={color} strokeWidth="1.8" />
      <Path
        d="M5.5 19c1.2-3.2 3.4-4.6 6.5-4.6S17.8 15.8 19 19"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ArrowDownIcon({ color = Design.colors.primaryContainer, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5v14M6 13l6 6 6-6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export function ArrowUpIcon({ color = Design.colors.primaryContainer, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 19V5M6 11l6-6 6 6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export function TrendUpIcon({ color = Design.colors.success, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path
        d="M2 11.5 6.2 7.2l2.4 2.3L14 4"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <Path d="M10 4h4v4" fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.6" />
    </Svg>
  );
}

export function GridIcon({ color = Design.colors.primaryContainer, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="4" width="6.5" height="6.5" rx="1.2" fill={color} />
      <Rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" fill={color} />
      <Rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" fill={color} />
      <Rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" fill={color} />
    </Svg>
  );
}

export function BankIcon({ color = Design.colors.onSurfaceVariant, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 10h16v1.5H4z" fill={color} />
      <Path d="M5.5 11.5h2.2V17H5.5zM10.9 11.5h2.2V17h-2.2zM16.3 11.5H18.5V17h-2.2z" fill={color} />
      <Path d="M3.5 17h17v1.6h-17z" fill={color} />
      <Path d="M12 4 4 9.2h16L12 4Z" fill={color} />
    </Svg>
  );
}

export function SwapIcon({ color = Design.colors.onPrimary, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 8h11M15 5l3 3-3 3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <Path
        d="M17 16H6M9 13l-3 3 3 3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export function ActivityIcon({ color = Design.colors.onSurfaceVariant, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 12h4l2.5-6 5 12L17 12h4"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

export function SettingsIcon({ color = Design.colors.onSurfaceVariant, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.6" />
      <Path
        d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </Svg>
  );
}

export function EthAssetIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="#001016" />
      <Path d="M20 8 12 20.2 20 16.4 28 20.2 20 8Z" fill={Design.colors.primaryContainer} />
      <Path d="M20 32 12 21.4 20 25.4 28 21.4 20 32Z" fill={Design.colors.secondary} />
    </Svg>
  );
}

export function UsdcAssetIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="#001f4a" />
      <Circle cx="20" cy="20" r="11" fill="none" stroke={Design.colors.tertiaryContainer} strokeWidth="2" />
      <SvgText
        fill={Design.colors.tertiaryContainer}
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
        x="20"
        y="25"
      >
        $
      </SvgText>
    </Svg>
  );
}

export function MsftAssetIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="20" fill="#1a2430" />
      <Polygon
        points="20,8 29,13.2 29,23.8 20,29 11,23.8 11,13.2"
        fill="none"
        stroke={Design.colors.onSurfaceVariant}
        strokeWidth="1.6"
      />
      <Polygon points="20,14 24.5,16.6 24.5,21.8 20,24.4 15.5,21.8 15.5,16.6" fill={Design.colors.outline} />
    </Svg>
  );
}

export function PortfolioSparkline() {
  return (
    <Svg height={108} viewBox="0 0 320 108" width="100%">
      <Defs>
        <LinearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={Design.colors.success} stopOpacity="0.28" />
          <Stop offset="1" stopColor={Design.colors.success} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Line
        x1="8"
        x2="312"
        y1="78"
        y2="78"
        stroke={Design.colors.outlineVariant}
        strokeDasharray="4 6"
        strokeWidth="1"
      />
      <Path
        d="M8 86 C 40 84, 58 70, 78 62 C 104 50, 118 78, 148 64 C 176 52, 198 34, 230 38 C 258 42, 278 22, 312 18 L 312 108 L 8 108 Z"
        fill="url(#sparkFill)"
      />
      <Path
        d="M8 86 C 40 84, 58 70, 78 62 C 104 50, 118 78, 148 64 C 176 52, 198 34, 230 38 C 258 42, 278 22, 312 18"
        fill="none"
        stroke={Design.colors.successDim}
        strokeWidth="2.2"
      />
      <SvgText fill={Design.colors.onSurfaceVariant} fontSize="10" fontWeight="700" x="286" y="48">
        BE
      </SvgText>
    </Svg>
  );
}
