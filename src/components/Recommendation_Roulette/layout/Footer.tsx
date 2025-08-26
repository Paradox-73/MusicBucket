import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Flame, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60 py-6">
      <div className="container grid grid-cols-3 gap-8">
        <Card className="p-4 bg-gradient-to-br from-purple-200/10 to-blue-200/10 dark:from-[#800080]/10 dark:to-[#00cccc]/10 border-purple-300/20 dark:border-[#800080]/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-purple-600 dark:text-[#800080]" />
            <h3 className="font-semibold text-purple-600 dark:text-[#800080]">Roast My Taste</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Ready for some musical tough love? Let our AI critic judge your taste!
          </p>
          <Button variant="outline" className="w-full border-purple-400/50 hover:border-purple-500 dark:border-[#800080]/50 dark:hover:border-[#800080]">
            Roast Me
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-200/10 to-purple-200/10 dark:from-[#00cccc]/10 dark:to-[#800080]/10 border-blue-300/20 dark:border-[#00cccc]/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-500 dark:text-[#00cccc]" />
            <h3 className="font-semibold text-blue-500 dark:text-[#00cccc]">Premium Features</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Unlock advanced filters, AI insights, and more with Premium!
          </p>
          <Button variant="outline" className="w-full border-blue-400/50 hover:border-blue-500 dark:border-[#00cccc]/50 dark:hover:border-[#00cccc]">
            Go Premium
          </Button>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-200/10 to-blue-200/10 dark:from-[#800080]/10 dark:to-[#00cccc]/10 border-purple-300/20 dark:border-[#800080]/20">
          <h3 className="font-semibold text-purple-600 dark:text-[#800080] mb-2">Music Fun Fact</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The first music was created around 35,000 years ago! Ancient flutes made of bird bone
            and mammoth ivory have been found in European caves.
          </p>
        </Card>
      </div>
    </footer>
  );
}