import { Button } from "../ui/button";
import { SpotifyAuth as SpotifyAuthClass } from '../../../lib/spotify/auth';
import { UserCircle } from "lucide-react";

export function SpotifyAuthButton() {
    const handleLogin = async () => {
        const auth = SpotifyAuthClass.getInstance();
        await auth.authenticate();

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
