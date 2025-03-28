import React from 'react';
import { Mail, Music } from 'lucide-react';

const funFacts = [
  "The longest recorded pop song is 'In The Garden' by PC III, lasting 24 hours",
  "The shortest song ever recorded is 'You Suffer' by Napalm Death, at 1.316 seconds",
  "The most expensive musical instrument is the 'Lady Blunt' Stradivarius violin, sold for $15.9 million",
  "The first music was recorded in 1860 on a phonautograph",
  "The loudest band in the world is KISS, reaching 136 dB in 2009"
];

export default function Footer() {
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Fun Fact Section */}
          <div className="space-y-2">
            <h3 className="text-[#00CCCC] font-bold flex items-center gap-2">
              <Music /> Music Fun Fact
            </h3>
            <p className="text-sm">{randomFact}</p>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="text-[#00CCCC] font-bold flex items-center gap-2">
              <Mail /> Monthly Newsletter
            </h3>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 rounded px-3 py-2 flex-1"
              />
              <button className="bg-[#800080] hover:bg-[#900090] px-4 py-2 rounded transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          {/* Roast Section */}
          <div className="space-y-2">
            <h3 className="text-[#00CCCC] font-bold">Roast Our Music Taste!</h3>
            <textarea
              placeholder="Tell us why your music taste is superior..."
              className="bg-white/10 rounded p-2 w-full h-20 resize-none"
            />
            <button className="bg-[#800080] hover:bg-[#900090] px-4 py-2 rounded transition-colors">
              Send Roast
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}