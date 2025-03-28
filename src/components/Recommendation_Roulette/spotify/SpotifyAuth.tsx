import { Button } from "../ui/button";
import { getAuthUrl } from "../../../lib/Recommendation_Roulette/spotify";
import { UserCircle } from "lucide-react";

export function SpotifyAuth() {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-[#00cccc]"
      onClick={handleLogin}
    >
      <UserCircle className="h-5 w-5" />
    </Button>
  );
}