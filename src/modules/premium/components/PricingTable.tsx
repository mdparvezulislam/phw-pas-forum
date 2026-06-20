"use client";

import React from "react";
import { Check, Minus, HelpCircle } from "lucide-react";

interface FeatureRow {
  name: string;
  description: string;
  member: string | boolean;
  vip: string | boolean;
  vipplus: string | boolean;
  elite: string | boolean;
  lifetime: string | boolean;
}

const COMPARISON_ROWS: FeatureRow[] = [
  {
    name: "Access to VIP Forums",
    description: "Read & reply to threads in exclusive private forums",
    member: false,
    vip: true,
    vipplus: true,
    elite: true,
    lifetime: true,
  },
  {
    name: "Premium Downloads",
    description: "Access curated guides, software, templates and case studies",
    member: false,
    vip: "Standard",
    vipplus: "All",
    elite: "All + Alpha Tools",
    lifetime: "All + Alpha Tools",
  },
  {
    name: "Conversation PM Limits",
    description: "Maximum parallel private messaging threads",
    member: "50 conversations",
    vip: "200 conversations",
    vipplus: "500 conversations",
    elite: "Unlimited",
    lifetime: "Unlimited",
  },
  {
    name: "File Attachment limits in PMs",
    description: "Maximum file upload size per message",
    member: "5 MB",
    vip: "25 MB",
    vipplus: "100 MB",
    elite: "500 MB",
    lifetime: "500 MB",
  },
  {
    name: "Marketplace Listing Boosts",
    description: "Free featured boosts assigned every month",
    member: false,
    vip: "1 boost/mo",
    vipplus: "3 boosts/mo",
    elite: "10 boosts/mo",
    lifetime: "10 boosts/mo",
  },
  {
    name: "Custom Profile Themes & Cover",
    description: "Customize cover banner background and profile colors",
    member: false,
    vip: "Colors Only",
    vipplus: true,
    elite: true,
    lifetime: true,
  },
  {
    name: "Username styling & Custom Signature",
    description: "Add links and custom animations to your posts footer",
    member: false,
    vip: "Text Signature",
    vipplus: "HTML/Image Signature",
    elite: "Custom Color Username + Signature",
    lifetime: "Custom Glow Username + Signature",
  },
  {
    name: "Advanced Search Filters",
    description: "Unlock filters for searching market volume insights",
    member: false,
    vip: true,
    vipplus: true,
    elite: true,
    lifetime: true,
  },
];

export function PricingTable() {
  const renderCell = (val: string | boolean) => {
    if (typeof val === "boolean") {
      return val ? (
        <div className="flex justify-center">
          <span className="rounded-full bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20">
            <Check className="h-4 w-4" />
          </span>
        </div>
      ) : (
        <div className="flex justify-center">
          <Minus className="h-4 w-4 text-zinc-700" />
        </div>
      );
    }
    return <span className="text-sm text-zinc-300 font-medium">{val}</span>;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-md">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/60">
            <th className="p-5 text-sm font-semibold text-zinc-400">Benefit Description</th>
            <th className="p-5 text-center text-sm font-semibold text-zinc-400">Member</th>
            <th className="p-5 text-center text-sm font-semibold text-indigo-400">VIP</th>
            <th className="p-5 text-center text-sm font-semibold text-violet-400">VIP+</th>
            <th className="p-5 text-center text-sm font-semibold text-amber-400">Elite</th>
            <th className="p-5 text-center text-sm font-semibold text-emerald-400">Lifetime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {COMPARISON_ROWS.map((row, idx) => (
            <tr key={idx} className="hover:bg-zinc-900/20 transition-colors duration-150">
              <td className="p-5">
                <div className="font-semibold text-zinc-200 text-sm">{row.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{row.description}</div>
              </td>
              <td className="p-5 text-center">{renderCell(row.member)}</td>
              <td className="p-5 text-center bg-indigo-500/5">{renderCell(row.vip)}</td>
              <td className="p-5 text-center bg-violet-500/5">{renderCell(row.vipplus)}</td>
              <td className="p-5 text-center bg-amber-500/5">{renderCell(row.elite)}</td>
              <td className="p-5 text-center bg-emerald-500/5">{renderCell(row.lifetime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
