import React from "react";
import {
  capitalize,
  outcomeVariant,
  pickHeadlineAndBullets,
  toPercentage,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import CopyButton from "@/components/ai-review/CopyButton";
import NextStepsDialog from "@/components/ai-review/next-steps-dialogue";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/api/ai-analysis/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Analysis not found</h1>
        <p className="text-muted-foreground mt-2">
          This analysis may have been deleted or the ID is invalid.
        </p>
      </main>
    );
  }

  const { analysis } = await response.json();
  const { result } = analysis;

  const { headline, bullets } = pickHeadlineAndBullets(result.summary);
  const hasSuggestedReplies = result.suggestedReplies?.length > 0;

  const topSignalsCount = 2;
  const topBreakdownCount = 3;
  const topRepliesCount = 4;

  const getCopySnippet = (text: string) => {
    const match = text.match(/“([^”]+)”|"([^"]+)"/);
    return match?.[1] ?? match?.[2] ?? text;
  };

  const sections = {
    positive: result.attractionSignals?.positive ?? [],
    negative: result.attractionSignals?.negative ?? [],
    uncertain: result.attractionSignals?.uncertain ?? [],
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* ================= HERO HEADER ================= */}
      <section className="mb-10">
        <div className="rounded-2xl border bg-muted/20 px-6 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold leading-tight">
                {capitalize(analysis.type)} Analysis
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <Badge variant="outline">{capitalize(analysis.status)}</Badge>
                <span>Confidence: {toPercentage(result.rating.confidence)}</span>
                <Badge variant={outcomeVariant(result.rating.overall)}>
                  Outcome: {capitalize(result.rating.overall)}
                </Badge>
              </div>
            </div>

            {/* Optional quick action on header */}
            {hasSuggestedReplies && (
              <div className="flex gap-2 md:pt-1">
                <CopyButton
                  value={result.suggestedReplies![0]?.text ?? ""}
                  size="sm"
                  variant="outline"
                >
                  Copy top reply
                </CopyButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= MAIN (LEFT) ================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* ===== Overall diagnosis (hero) ===== */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold">Overall diagnosis</h2>
              <span className="text-xs text-muted-foreground">
                Read time: ~30s
              </span>
            </div>

            <div className="rounded-2xl border bg-muted/30 p-6 space-y-4">
              <p className="text-lg font-medium leading-relaxed">{headline}</p>

              {bullets.length > 0 && (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {bullets.map((s: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-0.5">•</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ===== Attraction signals (compact + expand) ===== */}
          <section className="space-y-3">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-semibold">Attraction signals</h2>
              <span className="text-xs text-muted-foreground">
                Scan first, expand if needed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {([
                { key: "positive", title: "🟢 Positive" },
                { key: "negative", title: "🔴 Negative" },
                { key: "uncertain", title: "🟡 Uncertain" },
              ] as const).map(({ key, title }) => {
                const signals = sections[key] ?? [];
                const top = signals.slice(0, topSignalsCount);
                const rest = signals.slice(topSignalsCount);

                return (
                  <div
                    key={key}
                    className="rounded-2xl border p-5 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium">{title}</h3>
                      <Badge variant="outline">{signals.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {top.map((signal: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border bg-background/40 p-3"
                        >
                          <p className="text-sm leading-relaxed">{signal}</p>
                        </div>
                      ))}

                      {signals.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No signals detected.
                        </p>
                      )}
                    </div>

                    {rest.length > 0 && (
                      <Accordion type="single" collapsible className="pt-1">
                        <AccordionItem value="more" className="border-none">
                          <AccordionTrigger className="py-2 text-sm">
                            Show {rest.length} more
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pt-2">
                              {rest.map((signal: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border bg-background/40 p-3"
                                >
                                  <p className="text-sm leading-relaxed">
                                    {signal}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ===== Breakdown (compact + expand) ===== */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Breakdown</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* What worked */}
              <div className="rounded-2xl border p-5 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">What worked</h3>
                  <Badge variant="outline">{result.strengths.length}</Badge>
                </div>

                <div className="space-y-2">
                  {result.strengths.slice(0, topBreakdownCount).map((x: string, i: number) => (
                    <div key={i} className="rounded-lg border bg-background/40 p-4">
                      <p className="text-sm leading-relaxed">
                        <span className="mr-2">✓</span>
                        {x}
                      </p>
                    </div>
                  ))}
                </div>

                {result.strengths.length > topBreakdownCount && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="more" className="border-none">
                      <AccordionTrigger className="py-2 text-sm">
                        Show {result.strengths.length - topBreakdownCount} more
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {result.strengths.slice(topBreakdownCount).map((x: string, i: number) => (
                            <div key={i} className="rounded-lg border bg-background/40 p-4">
                              <p className="text-sm leading-relaxed">
                                <span className="mr-2">✓</span>
                                {x}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>

              {/* What hurt momentum */}
              <div className="rounded-2xl border p-5 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">What hurt momentum</h3>
                  <Badge variant="outline">{result.weaknesses.length}</Badge>
                </div>

                <div className="space-y-2">
                  {result.weaknesses.slice(0, topBreakdownCount).map((x: string, i: number) => (
                    <div key={i} className="rounded-lg border bg-background/40 p-4">
                      <p className="text-sm leading-relaxed">
                        <span className="mr-2">⚠</span>
                        {x}
                      </p>
                    </div>
                  ))}
                </div>

                {result.weaknesses.length > topBreakdownCount && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="more" className="border-none">
                      <AccordionTrigger className="py-2 text-sm">
                        Show {result.weaknesses.length - topBreakdownCount} more
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {result.weaknesses.slice(topBreakdownCount).map((x: string, i: number) => (
                            <div key={i} className="rounded-lg border bg-background/40 p-4">
                              <p className="text-sm leading-relaxed">
                                <span className="mr-2">⚠</span>
                                {x}
                              </p>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          </section>

          {/* ===== Supporting context ===== */}
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">Supporting context</h2>
            <p className="text-sm text-muted-foreground">
              {analysis.type === "photo"
                ? "View the analyzed photo and its placement context below."
                : "View the original conversation transcript below."}
            </p>
          </section>
        </div>

        {/* ================= SIDEBAR (RIGHT) ================= */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Next steps */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">What to do next</h2>
              <Badge variant="outline">
                {Math.min(result.nextSteps.length, 3)}/{result.nextSteps.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {result.nextSteps.slice(0, 3).map((step: string, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border bg-background/40 p-4 space-y-3"
                >
                  <p className="text-sm leading-relaxed">{step}</p>

                  <CopyButton
                    value={getCopySnippet(step)}
                    size="sm"
                    variant="outline"
                  >
                    Copy
                  </CopyButton>
                </div>
              ))}
            </div>

            {result.nextSteps.length > 3 && (
              <NextStepsDialog nextSteps={result.nextSteps} />
            )}
          </div>

          {/* Suggested replies */}
          {hasSuggestedReplies && (
            <div className="rounded-2xl border p-5 bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Suggested replies</h2>
                <Badge variant="outline">{result.suggestedReplies.length}</Badge>
              </div>

              {/* Top replies */}
              <div className="space-y-3">
                {result.suggestedReplies
                  .slice(0, topRepliesCount)
                  .map((reply: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border bg-background/40 p-4 space-y-3"
                    >
                      <p className="text-sm leading-relaxed">“{reply.text}”</p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{capitalize(reply.intent)}</Badge>
                        <Badge variant="outline">{capitalize(reply.tone)}</Badge>
                      </div>

                      <CopyButton value={reply.text} size="sm" variant="outline">
                        Copy
                      </CopyButton>
                    </div>
                  ))}
              </div>

              {/* Accordion for the rest */}
              {result.suggestedReplies.length > topRepliesCount && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="more" className="border-none">
                    <AccordionTrigger className="py-2 text-sm">
                      Show {result.suggestedReplies.length - topRepliesCount} more
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {result.suggestedReplies
                          .slice(topRepliesCount)
                          .map((reply: any, idx: number) => (
                            <div
                              key={idx}
                              className="rounded-lg border bg-background/40 p-4 space-y-3"
                            >
                              <p className="text-sm leading-relaxed">“{reply.text}”</p>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">
                                  {capitalize(reply.intent)}
                                </Badge>
                                <Badge variant="outline">{capitalize(reply.tone)}</Badge>
                              </div>

                              <CopyButton value={reply.text} size="sm" variant="outline">
                                Copy
                              </CopyButton>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}


          {/* Meta */}
          <div className="rounded-2xl border p-5 bg-muted/20 space-y-2">
            <h2 className="text-lg font-semibold">Details</h2>
            <p className="text-sm text-muted-foreground">
              Analysis ID: <span className="font-mono">{analysis._id}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Page;
