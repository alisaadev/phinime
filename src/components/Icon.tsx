import * as icons from "lucide-react-native/icons";

interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  fill?: string;
}

export default function Icon({ name, color, size, fill="rgba(0,0,0,0)" }: IconProps) {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} fill={fill} />;
}
