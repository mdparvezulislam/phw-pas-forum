export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { diag, DiagConsoleLogger, DiagLogLevel } = await import(
      "@opentelemetry/api"
    );
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

    try {
      const { NodeTracerProvider } = await import(
        "@opentelemetry/sdk-trace-node"
      );
      const { BatchSpanProcessor } = await import(
        "@opentelemetry/sdk-trace-base"
      );
      const { OTLPTraceExporter } = await import(
        "@opentelemetry/exporter-trace-otlp-http"
      );
      const { resourceFromAttributes } = await import(
        "@opentelemetry/resources"
      );
      const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = await import(
        "@opentelemetry/semantic-conventions"
      );

      const exporter = new OTLPTraceExporter({
        url:
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
          "http://localhost:4318/v1/traces",
      });

      const provider = new NodeTracerProvider({
        resource: resourceFromAttributes({
          [ATTR_SERVICE_NAME]: "bhw-pas",
          [ATTR_SERVICE_VERSION]: "0.1.0",
        }),
        spanProcessors: [new BatchSpanProcessor(exporter)],
      });

      provider.register();

      const { getNodeAutoInstrumentations } = await import(
        "@opentelemetry/auto-instrumentations-node"
      );
      const { registerInstrumentations } = await import(
        "@opentelemetry/instrumentation"
      );

      registerInstrumentations({
        tracerProvider: provider,
        instrumentations: [getNodeAutoInstrumentations()],
      });
    } catch (error) {
      console.warn("[OpenTelemetry] Failed to initialize:", error);
    }
  }
}
