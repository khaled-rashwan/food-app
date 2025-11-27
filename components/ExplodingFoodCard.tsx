"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

// --- Types ---
type Layer = {
  id: string;
  label: string;
  image: string;
  color: string;
};

// --- Mock Data for the Proof of Concept ---
// In production, you will use real transparent PNGs of (Bun, Lettuce, Meat, Bun)
const BURGER_LAYERS: Layer[] = [
  { id: "top-bun", label: "Brioche Sesame Bun", image: "https://img.icons8.com/fluency/96/hamburger.png", color: "bg-amber-300" },
  { id: "cheese", label: "Aged Cheddar", image: "", color: "bg-yellow-400" },
  { id: "patty", label: "Wagyu Beef Patty", image: "", color: "bg-red-900" },
  { id: "lettuce", label: "Fresh Romaine", image: "", color: "bg-green-500" },
  { id: "bottom-bun", label: "Toasted Base", image: "", color: "bg-amber-300" },
];

export default function ExplodingFoodCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center p-8 min-h-[400px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="text-2xl font-bold mb-8 text-white">Deconstructed Burger</h2>
      
      <div className="relative flex flex-col items-center">
        {BURGER_LAYERS.map((layer, index) => {
          const offset = isHovered ? (index - 2) * 60 : (index - 2) * 10;
          
          return (
            <motion.div
              key={layer.id}
              className="relative flex items-center"
              initial={{ y: 0, opacity: 1 }}
              animate={{
                y: offset,
                opacity: 1,
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: isHovered ? index * 0.05 : (BURGER_LAYERS.length - index) * 0.05,
              }}
            >
              {/* Layer visual */}
              <div
                className={cn(
                  "w-24 h-6 rounded-full shadow-md flex items-center justify-center",
                  layer.color
                )}
              >
                {layer.image && (
                  <img
                    src={layer.image}
                    alt={layer.label}
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              
              {/* Label that appears on hover */}
              <motion.div
                className="absolute left-full ml-4 whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  x: isHovered ? 0 : -10,
                }}
                transition={{
                  delay: isHovered ? index * 0.1 : 0,
                }}
              >
                <span className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded">
                  {layer.label}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      <p className="mt-8 text-sm text-white/80">
        Hover to see the layers
      </p>
    </div>
  );
}
