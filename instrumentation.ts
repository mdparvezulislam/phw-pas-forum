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

      // Initialize Performance Infrastructure
      const { queueService } = await import(
        "@/modules/performance/queue"
      );
      const { queueWorkerManager } = await import(
        "@/modules/performance/queue/workers"
      );
      const { cacheInvalidator } = await import(
        "@/modules/performance/cache/cache-invalidation"
      );
      const { registerEventHandler } = await import(
        "@/lib/event-bus"
      );
      const { sentryService } = await import(
        "@/modules/performance/monitoring/sentry"
      );
      const { alertingService } = await import(
        "@/modules/performance/monitoring/alerting"
      );

      // Initialize queue system
      queueService.initialize();
      queueWorkerManager.initialize();
      queueWorkerManager.warmup().catch(() => {});

      // Register cache invalidation for events
      registerEventHandler((event) => cacheInvalidator.handleEvent(event));

      // Initialize monitoring
      sentryService.initialize();

      // Register alerting rules
      alertingService.registerDefaultRules();

      console.log("[Instrumentation] Performance infrastructure initialized.");
    } catch (error) {
      console.warn("[Instrumentation] Initialization error:", error);
    }
  }
}
