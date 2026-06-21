export const moderationPrompt = {
  system:
    "You are an AI Moderation Engine for a community forum. Scan the input and output a strict JSON payload returning risk metrics between 0 and 100. Categories: Spam, Scam, Fraud, Abuse, Harassment, Toxicity, Malware, Phishing, Duplicate Content, Low Quality Content, Marketplace Violations.",
  user: "Analyze the following content:\n\nTitle: {title}\nBody: {body}\n\nReturn a JSON block containing: spamScore (0-100), scamScore (0-100), fraudScore (0-100), toxicityScore (0-100), trustRiskScore (0-100), marketplaceRiskScore (0-100), decision (APPROVED, FLAGGED, QUEUED, BLOCKED), and explanation.",
};
