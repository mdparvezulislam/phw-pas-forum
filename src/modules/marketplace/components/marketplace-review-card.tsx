"use client";

import { Calendar, DollarSign, FileText, Globe, Tag, User } from "lucide-react";
import { ApprovalPanel } from "./approval-panel";
import { ComplianceCard } from "./compliance-card";
import { IModBotReport } from "./imodbot-report";
import { RiskScoreCard } from "./risk-score-card";

interface MarketplaceReviewCardProps {
  submission: {
    id: string;
    status: string;
    price: number;
    paymentDetails?: string | null;
    submittedAt: Date;
    sellerId: string;
    thread: {
      id: string;
      title: string;
      slug: string;
      content: string;
      author: {
        username: string | null;
        displayName: string | null;
        image: string | null;
      };
    };
    reviews: Array<{
      wordCount: number;
      mediaCount: number;
      linkCount: number;
      externalUrlCount: number;
      plagiarismScore: number;
      riskScore: number;
      complianceScore: number;
    }>;
  };
  onActionSuccess?: () => void;
}

export function MarketplaceReviewCard({
  submission,
  onActionSuccess,
}: MarketplaceReviewCardProps) {
  const latestReview = submission.reviews?.[0] || {
    wordCount: 0,
    mediaCount: 0,
    linkCount: 0,
    externalUrlCount: 0,
    plagiarismScore: 0,
    riskScore: 0,
    complianceScore: 0,
  };

  const sellerName =
    submission.thread.author.displayName ??
    submission.thread.author.username ??
    "Unknown";

  return (
    <div className="border rounded-3xl bg-card/10 hover:bg-card/20 backdrop-blur shadow-md hover:shadow-lg transition-all duration-300 p-6 md:p-8 space-y-8 border-muted/20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-muted/20">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            Sales Thread Submission
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mt-2 hover:text-primary transition-colors">
            {submission.thread.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Seller: <strong className="text-foreground">{sellerName}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Submitted: {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-2xl">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-lg font-bold text-emerald-400">
            {(submission.price / 100).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Pricing / Payment specifics */}
      {submission.paymentDetails && (
        <div className="bg-secondary/20 border rounded-2xl p-4 text-xs space-y-1">
          <h4 className="font-semibold text-muted-foreground">
            Payment Details Provided:
          </h4>
          <p className="font-mono text-foreground break-all">
            {submission.paymentDetails}
          </p>
        </div>
      )}

      {/* Automated metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskScoreCard score={latestReview.riskScore} />
        <ComplianceCard score={latestReview.complianceScore} />
      </div>

      {/* Detailed statistics metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-secondary/10 border rounded-2xl p-5 text-center">
        <div>
          <span className="text-muted-foreground text-xs block mb-1">
            Words
          </span>
          <strong className="text-base font-bold flex items-center justify-center gap-1">
            <FileText className="w-4 h-4 text-sky-400" />
            {latestReview.wordCount}
          </strong>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block mb-1">
            Media Assets
          </span>
          <strong className="text-base font-bold flex items-center justify-center gap-1">
            <Tag className="w-4 h-4 text-indigo-400" />
            {latestReview.mediaCount}
          </strong>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block mb-1">
            Links Count
          </span>
          <strong className="text-base font-bold flex items-center justify-center gap-1">
            <Globe className="w-4 h-4 text-teal-400" />
            {latestReview.linkCount}
          </strong>
        </div>
        <div>
          <span className="text-muted-foreground text-xs block mb-1">
            External URLs
          </span>
          <strong className="text-base font-bold flex items-center justify-center gap-1 text-amber-400">
            {latestReview.externalUrlCount}
          </strong>
        </div>
      </div>

      {/* Original Thread Content Snippet */}
      <div className="border rounded-2xl p-5 bg-card/25 max-h-[220px] overflow-y-auto space-y-2">
        <h4 className="text-xs font-bold text-muted-foreground sticky top-0 bg-background/95 py-1 backdrop-blur-sm border-b">
          Submitted Content Draft
        </h4>
        <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-serif">
          {submission.thread.content || "No textual content draft provided."}
        </div>
      </div>

      {/* iModBot compliance review preview */}
      <IModBotReport
        wordCount={latestReview.wordCount}
        mediaCount={latestReview.mediaCount}
        riskScore={latestReview.riskScore}
        complianceScore={latestReview.complianceScore}
        price={submission.price}
      />

      {/* Approval interaction panel */}
      <ApprovalPanel submissionId={submission.id} onSuccess={onActionSuccess} />
    </div>
  );
}
