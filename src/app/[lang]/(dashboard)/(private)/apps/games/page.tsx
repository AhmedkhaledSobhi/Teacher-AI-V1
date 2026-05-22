import type { Metadata } from "next";
import GamePage from "@/views/apps/games";

export const metadata: Metadata = {
  title: "Teacher AI - ساحة الألعاب",
  description: "Educational games to enhance learning through fun challenges",
};

const GamesPage = async () => {
  return <GamePage />;
};

export default GamesPage;
