import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { getRecommendation } from "../../../lib/Recommendation_Roulette/spotifyApi";
import { useState } from "react";
import { RecommendationDisplay } from "./RecommendationDisplay";
import { useTheme } from '../../../hooks/useTheme';

const categories = ["Artist", "Album", "Genre", "Track", "Podcast", "Playlist"];

export function SpinWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Track");
  const [useHistory, setUseHistory] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const { theme } = useTheme();

  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      // Get token from localStorage (set during OAuth callback)
      const token = localStorage.getItem('spotify_token');
      if (!token) {
        alert('Please login with Spotify first');
        return;
      }

      const result = await getRecommendation(token, selectedCategory, useHistory);
      setTimeout(() => {
        setIsSpinning(false);
        setRecommendation(result);
      }, 3000);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] border-blue-400/50 dark:border-[#00cccc]/50">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            checked={useHistory}
            onCheckedChange={setUseHistory}
            className="data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-[#800080]"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">Use listening history</span>
        </div>
      </div>

      <div className="relative w-80 h-80">
        <div
          className={`absolute inset-0 rounded-full border-4 border-blue-500 dark:border-[#00cccc] 
            ${isSpinning ? "animate-spin" : ""}`}
          style={{
            background: theme === 'dark' ? "conic-gradient(from 0deg, #800080, #00cccc, #800080)" : "conic-gradient(from 0deg, #990099, #33ffff, #990099)",
          }}
        />
        <div className="absolute inset-4 rounded-full bg-white dark:bg-black flex items-center justify-center">
          <Button
            onClick={handleSpin}
            disabled={isSpinning}
            className="bg-gradient-to-r from-purple-600 to-blue-500 dark:from-[#800080] dark:to-[#00cccc] hover:opacity-90"
          >
            {isSpinning ? "Spinning..." : "Spin"}
          </Button>
        </div>
      </div>

      <RecommendationDisplay recommendation={recommendation} />
    </div>
  );
}