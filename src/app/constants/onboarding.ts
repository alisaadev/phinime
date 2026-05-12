import { ImageProps } from "react-native";

export interface OnBoardingData {
  id: number;
  image: ImageProps;
  text: string;
  text2: string;
  textColor: string;
  backgroundColor: string;
}

const OnBoarding: OnBoardingData[] = [
  {
    id: 1,
    image: require("@/images/image_3.png"),
    text: "Dunia Lain Menantimu",
    text2:
      "Ada semesta yang tak terjangkau mata, namun bisa dirasakan jiwa. PhiNime membawamu ke sana — gratis, tanpa batas, tanpa gangguan.",
    textColor: "#F2C4CE",
    backgroundColor: "#2C1F2E",
  },
  {
    id: 2,
    image: require("@/images/image_4.png"),
    text: "Waktu Tak Pernah Jadi Penghalang",
    text2:
      "Seperti bintang yang selalu ada meski siang menutupinya, anime favoritmu selalu menunggu — kapan pun kamu siap untuk pulang.",
    textColor: "#C9B8D4",
    backgroundColor: "#1E2535",
  },
  {
    id: 3,
    image: require("@/images/image_2.png"),
    text: "Setiap Hari, Sebuah Babak Baru",
    text2:
      "Cerita yang baik tidak pernah benar-benar berakhir. PhiNime memastikan perjalananmu terus berlanjut, satu episode demi satu episode.",
    textColor: "#A8C8D8",
    backgroundColor: "#2A1E2A",
  },
  {
    id: 4,
    image: require("@/images/image_1.png"),
    text: "Miliki, Bukan Sekadar Melihat",
    text2:
      "Ada perbedaan antara melewati dan benar-benar hadir. Simpan momen itu, bawa ke mana pun kamu pergi — karena beberapa cerita layak untuk diulang.",
    textColor: "#EDE8F0",
    backgroundColor: "#1A1A29",
  },
];

export default OnBoarding;
