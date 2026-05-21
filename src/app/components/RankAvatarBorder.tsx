import { memo } from "react";
import { Image } from "expo-image";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path, Polygon } from "react-native-svg";

interface Props {
  rank: 1 | 2 | 3 | 4;
  avatarUrl: string | null;
  initials: string;
  size?: number;
}

const RANK_COLORS: Record<number, string> = {
  1: "#A78BFA",
  2: "#34D399",
  3: "#FBBF24",
  4: "#F87171",
};

function WanderingLaurel({ c }: { c: string }) {
  return (
    <>
      <Circle
        cx="45"
        cy="45"
        r="42"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <Path d="M18,52 Q12,44 16,36 Q20,42 18,52Z" fill={c} fillOpacity="0.5" />
      <Path d="M21,43 Q13,38 14,28 Q22,33 21,43Z" fill={c} fillOpacity="0.75" />
      <Path d="M72,52 Q78,44 74,36 Q70,42 72,52Z" fill={c} fillOpacity="0.5" />
      <Path d="M69,43 Q77,38 76,28 Q68,33 69,43Z" fill={c} fillOpacity="0.75" />
      <Path
        d="M26,60 Q45,68 64,60"
        fill="none"
        stroke={c}
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
    </>
  );
}

function SacredLaurel({ c }: { c: string }) {
  return (
    <>
      <Circle
        cx="45"
        cy="45"
        r="42"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeOpacity="0.55"
      />
      <Path d="M18,55 Q10,46 15,36 Q21,44 18,55Z" fill={c} fillOpacity="0.45" />
      <Path d="M20,44 Q11,37 13,26 Q22,32 20,44Z" fill={c} fillOpacity="0.65" />
      <Path d="M24,34 Q17,24 22,15 Q29,22 24,34Z" fill={c} fillOpacity="0.9" />
      <Path d="M72,55 Q80,46 75,36 Q69,44 72,55Z" fill={c} fillOpacity="0.45" />
      <Path d="M70,44 Q79,37 77,26 Q68,32 70,44Z" fill={c} fillOpacity="0.65" />
      <Path d="M66,34 Q73,24 68,15 Q61,22 66,34Z" fill={c} fillOpacity="0.9" />
      <Path
        d="M24,62 Q45,72 66,62"
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
    </>
  );
}

function AncientLaurel({ c }: { c: string }) {
  return (
    <>
      <Circle cx="45" cy="45" r="42" fill="none" stroke={c} strokeWidth="2.5" />
      <Path d="M17,58 Q8,47 13,35 Q21,45 17,58Z" fill={c} fillOpacity="0.4" />
      <Path d="M19,46 Q9,38 11,25 Q22,33 19,46Z" fill={c} fillOpacity="0.6" />
      <Path d="M23,35 Q15,23 19,12 Q28,20 23,35Z" fill={c} fillOpacity="0.8" />
      <Path d="M29,26 Q25,12 32,4 Q37,14 29,26Z" fill={c} />
      <Path d="M73,58 Q82,47 77,35 Q69,45 73,58Z" fill={c} fillOpacity="0.4" />
      <Path d="M71,46 Q81,38 79,25 Q68,33 71,46Z" fill={c} fillOpacity="0.6" />
      <Path d="M67,35 Q75,23 71,12 Q62,20 67,35Z" fill={c} fillOpacity="0.8" />
      <Path d="M61,26 Q65,12 58,4 Q53,14 61,26Z" fill={c} />
      <Path
        d="M22,65 Q45,76 68,65"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      <Polygon
        points="45,6 47,12 53,12 48,16 50,22 45,18 40,22 42,16 37,12 43,12"
        fill={c}
        fillOpacity="0.9"
      />
    </>
  );
}

function RoyalLaurel({ c }: { c: string }) {
  return (
    <>
      <Circle cx="45" cy="45" r="42" fill="none" stroke={c} strokeWidth="3" />
      <Circle
        cx="45"
        cy="45"
        r="38"
        fill="none"
        stroke={c}
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="3 3"
      />
      <Path d="M16,60 Q6,48 11,33 Q21,44 16,60Z" fill={c} fillOpacity="0.35" />
      <Path d="M18,47 Q7,38 9,23 Q22,31 18,47Z" fill={c} fillOpacity="0.55" />
      <Path d="M22,35 Q13,21 17,8 Q28,18 22,35Z" fill={c} fillOpacity="0.75" />
      <Path d="M29,24 Q24,9 31,1 Q38,11 29,24Z" fill={c} fillOpacity="0.9" />
      <Path d="M38,18 Q37,3 45,0 Q47,11 38,18Z" fill={c} />
      <Path d="M74,60 Q84,48 79,33 Q69,44 74,60Z" fill={c} fillOpacity="0.35" />
      <Path d="M72,47 Q83,38 81,23 Q68,31 72,47Z" fill={c} fillOpacity="0.55" />
      <Path d="M68,35 Q77,21 73,8 Q62,18 68,35Z" fill={c} fillOpacity="0.75" />
      <Path d="M61,24 Q66,9 59,1 Q52,11 61,24Z" fill={c} fillOpacity="0.9" />
      <Path d="M52,18 Q53,3 45,0 Q43,11 52,18Z" fill={c} />
      <Path d="M20,67 Q45,80 70,67" fill="none" stroke={c} strokeWidth="2.5" />
      <Path
        d="M34,14 L34,4 L45,10 L56,4 L56,14"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <Circle cx="34" cy="4" r="2.5" fill={c} />
      <Circle cx="45" cy="10" r="2.5" fill={c} />
      <Circle cx="56" cy="4" r="2.5" fill={c} />
    </>
  );
}

const RankAvatarBorder = memo(
  ({ rank, avatarUrl, initials, size = 90 }: Props) => {
    const color = RANK_COLORS[rank];
    const avatarSize = Math.round(size * 0.64);
    const offset = (size - avatarSize) / 2;

    return (
      <View style={{ width: size, height: size }}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 90 90"
          style={StyleSheet.absoluteFillObject}
        >
          {rank === 1 && <WanderingLaurel c={color} />}
          {rank === 2 && <SacredLaurel c={color} />}
          {rank === 3 && <AncientLaurel c={color} />}
          {rank === 4 && <RoyalLaurel c={color} />}
        </Svg>

        <View
          style={{
            position: "absolute",
            top: offset,
            left: offset,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            overflow: "hidden",
            backgroundColor: color + "22",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <Text
              style={{
                fontSize: avatarSize * 0.32,
                fontWeight: "700",
                color,
              }}
            >
              {initials}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

export default RankAvatarBorder;
