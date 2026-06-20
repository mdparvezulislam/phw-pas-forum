import { Bot } from "lucide-react";

export function IModBotReport({
  wordCount,
  mediaCount,
  riskScore,
  complianceScore,
  price,
}: {
  wordCount: number;
  mediaCount: number;
  riskScore: number;
  complianceScore: number;
  price: number;
}) {
  const formattedPrice = (price / 100).toFixed(2);
  const isHighRisk = riskScore > 60;
  const isCompliant = complianceScore > 75;

  return (
    <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur">
      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-indigo-400">iModBot Compliance Post Preview</h4>
          <p className="text-xs text-muted-foreground">
            This post will be appended as Post #2 automatically upon approval.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs bg-background/50 border border-indigo-500/10 rounded-xl p-4 font-mono">
        <div className="text-indigo-400 font-bold border-b border-indigo-500/10 pb-2 flex items-center justify-between">
          <span>🛡️ Marketplace Approval Report</span>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
            APPROVED
          </span>
        </div>

        <ul className="space-y-2 text-xs">
          <li>
            • <strong>Listing Price:</strong> ${formattedPrice} USD
          </li>
          <li>
            • <strong>Word Count:</strong> {wordCount} words
          </li>
          <li>
            • <strong>Media Count:</strong> {mediaCount} images/videos
          </li>
          <li>
            • <strong>Plagiarism Check:</strong> Original Content Verified
          </li>
          <li>
            • <strong>Risk Score:</strong> {riskScore}/100 ({isHighRisk ? "HIGH RISK 🚨" : "LOW RISK ✅"})
          </li>
          <li>
            • <strong>Compliance Score:</strong> {complianceScore}/100 (
            {isCompliant ? "COMPLIANT ✅" : "MINOR ISSUES ⚠️"})
          </li>
        </ul>

        <div className="text-[10px] text-muted-foreground border-t border-indigo-500/10 pt-2 italic">
          *Note: This report is automatically generated and pinned for marketplace transparency.
        </div>
      </div>
    </div>
  );
}
