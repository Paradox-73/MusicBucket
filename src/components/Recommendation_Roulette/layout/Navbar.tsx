import { Button } from "../ui/button";
import { SpotifyAuthButton } from "../spotify/SpotifyAuthButton";
import { Music2Icon } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "BucketList", path: "/bucket-list" },
  { name: "RecommendationRoulette", path: "/recommendation-roulette" },
  { name: "ArtistDepth", path: "/artist-depth" },
  { name: "MusicPersonality", path: "/music-personality" },
  { name: "Culture Clash", path: "/culture-clash" },
  { name: "About", path: "/about" },
];

export function Navbar() {
  return (
    <nav className="border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 mr-6">
          <Music2Icon className="h-6 w-6 text-[#00cccc]" />
          <span className="font-bold text-[#00cccc]">MusicBucket</span>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="transition-colors hover:text-[#00cccc]"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <SpotifyAuthButton />
        </div>
      </div>
    </nav>
  );
}