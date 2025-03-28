import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getAuthUrl, getUserProfile } from "../../../lib/Recommendation_Roulette/spotify";
import { LogOut, Music2, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface UserProfile {
  display_name: string;
  images: { url: string }[];
}

export function SpotifyAuthButton() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spotify_token');
    if (token) {
      getUserProfile(token)
        .then(setProfile)
        .catch(() => {
          localStorage.removeItem('spotify_token');
          setProfile(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    setProfile(null);
  };

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="text-[#00cccc] opacity-50">
        <UserCircle className="h-5 w-5" />
      </Button>
    );
  }

  if (!profile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-[#00cccc] hover:text-[#800080]"
        onClick={handleLogin}
      >
        <Music2 className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#00cccc] hover:text-[#800080]"
        >
          {profile.images?.[0]?.url ? (
            <img
              src={profile.images[0].url}
              alt={profile.display_name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <UserCircle className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="font-medium">
          {profile.display_name}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}