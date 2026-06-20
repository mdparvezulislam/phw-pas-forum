export interface BillingProvider {
  createCheckoutSession(
    userId: string,
    planId: string,
    cycle: "MONTHLY" | "YEARLY" | "LIFETIME"
  ): Promise<{ checkoutUrl: string; sessionId: string }>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  handleWebhook(
    payload: any,
    signature: string
  ): Promise<{ success: boolean; eventType: string; data: any }>;
}

export class MockBillingProvider implements BillingProvider {
  async createCheckoutSession(
    userId: string,
    planId: string,
    cycle: "MONTHLY" | "YEARLY" | "LIFETIME"
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    // Generate a mock checkout session ID
    const sessionId = `mock_sess_${crypto.randomUUID().replace(/-/g, "")}`;
    // Construct a mock checkout URL redirecting to /membership/checkout-success?session_id=...
    const checkoutUrl = `/membership/checkout-success?session_id=${sessionId}&plan_id=${planId}&cycle=${cycle}`;
    return { checkoutUrl, sessionId };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    // Simulate canceling a subscription at the provider level
    return true;
  }

  async handleWebhook(
    payload: any,
    signature: string
  ): Promise<{ success: boolean; eventType: string; data: any }> {
    // Simulate webhook handling
    return {
      success: true,
      eventType: "checkout.completed",
      data: payload,
    };
  }
}
