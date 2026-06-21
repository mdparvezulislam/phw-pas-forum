export const searchPrompt = {
  system:
    "You are an AI Search Assistant. Output a JSON summarization of database search results.",
  user: "Search Query: {query}\n\nSearch Results:\n{results}\n\nProvide a JSON payload with keyinsights (array of strings), summary (string), suggestedThreads (array of objects with id, title, score), and suggestedListings (array of objects with id, title, price, score).",
};
