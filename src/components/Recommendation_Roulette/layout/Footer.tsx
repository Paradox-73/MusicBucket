import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Flame, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 py-6">
      <div className="container grid grid-cols-3 gap-8">
        <Card className="p-4 bg-gradient-to-br from-[#800080]/10 to-[#00cccc]/10 border-[#800080]/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-[#800080]" />
            <h3 className="font-semibold text-[#800080]">Roast My Taste</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Ready for some musical tough love? Let our AI critic judge your taste!
          </p>
          <Button variant="outline" className="w-full border-[#800080]/50 hover:border-[#800080]">
            Roast Me
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#00cccc]/10 to-[#800080]/10 border-[#00cccc]/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-[#00cccc]" />
            <h3 className="font-semibold text-[#00cccc]">Premium Features</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Unlock advanced filters, AI insights, and more with Premium!
          </p>
          <Button variant="outline" className="w-full border-[#00cccc]/50 hover:border-[#00cccc]">
            Go Premium
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#800080]/10 to-[#00cccc]/10 border-[#800080]/20">
          <h3 className="font-semibold text-[#800080] mb-2">Music Fun Fact</h3>
          <p className="text-sm text-gray-400">
            The first music was created around 35,000 years ago! Ancient flutes made of bird bone
            and mammoth ivory have been found in European caves.
          </p>
        </Card>
      </div>
    </footer>
  );
}