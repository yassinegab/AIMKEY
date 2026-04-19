/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";

export function PollutionHeatmap() {
  const [hoveredNode, setHoveredNode] = useState<{ x: number; y: number; value: number } | null>(null);
  const rows = 8;
  const cols = 12;
  const data = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    const centerX = 8;
    const centerY = 4;
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const value = Math.max(0, 100 - dist * 15 + Math.random() * 20);
    return { x, y, value };
  });

  const getColor = (value: number) => {
    if (value < 30) return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
    if (value < 60) return "bg-warning/20 text-warning border-warning/30";
    return "bg-danger/20 text-danger border-danger/30";
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 overflow-hidden flex flex-col h-full shadow-xl shadow-emerald-900/5">
      <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/20">
        <div>
          <h3 className="font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
            <BarChart3 size={18} className="text-emerald-500" />
            POLLUTION_LIVE
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5 uppercase tracking-widest italic">Gabès Gulf Sector Z1</p>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-emerald-50/30 overflow-hidden min-h-[400px]">
        <div className="grid gap-2 relative z-10" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {data.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 rounded-xl cursor-crosshair transition-all duration-200 relative group border",
                getColor(node.value),
              )}
            />
          ))}
        </div>

        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-2xl p-5 rounded-[2rem] border border-white shadow-2xl z-50 pointer-events-none"
            >
              <div className="flex flex-col gap-1 font-mono text-[11px]">
                <div className="flex justify-between gap-6 mb-2 border-b border-zinc-100 pb-2">
                  <span className="text-zinc-400 uppercase font-black">Air_Telemetry</span>
                  <span className="text-emerald-500 font-black">ACTIVE</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>LAT_GBS</span>
                  <span className="text-zinc-900 font-black">{(33.88 + hoveredNode.y * 0.01).toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>LNG_GBS</span>
                  <span className="text-zinc-900 font-black">{(10.1 + hoveredNode.x * 0.01).toFixed(4)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-100 flex justify-between items-center">
                  <span className="uppercase text-zinc-400 font-black">AQI_VAL</span>
                  <span className="text-base font-black text-zinc-900">{Math.round(hoveredNode.value)} µg/m³</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
