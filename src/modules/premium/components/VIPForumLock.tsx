"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VIPForumLockProps {
  requiredPlan?: string;
  title?: string;
  description?: string;
}

export function VIPForumLock({
  requiredPlan = "VIP",
  title = "Exclusive VIP Area",
  description = "This community section is restricted to premium members. Upgrade your account to unlock private methods, resources, and expert discussions.",
}: VIPForumLockProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-zinc-950 p-8 text-center shadow-2xl md:p-16">
      {/* Decorative ambient glowing lights */}
      <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-[80px]" />
      <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-lg">
        {/* Animated Lock Icon */}
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 4,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
        >
          <Lock className="h-7 w-7" />
        </motion.div>

        {/* Upgrade Header */}
        <h2 className="mt-8 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>

        {/* Badge of required level */}
        <div className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
          <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          Requires {requiredPlan} Membership or higher
        </div>

        {/* Description */}
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>

        {/* Perks overview */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-left border-y border-zinc-800/80 py-6">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Private SEO & Case Studies
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Premium Downloads Center
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Search Insights & PM Boost
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> Exclusive Marketplace Deals
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/membership" passHref>
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 sm:w-auto px-8">
              Upgrade Now
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="ghost" className="w-full border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
