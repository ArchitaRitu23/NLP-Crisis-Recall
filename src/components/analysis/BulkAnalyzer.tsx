import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { Upload, FileSpreadsheet, Loader2, X, AlertCircle, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { runAnalysis } from "@/lib/analysis";
import { createId, db } from "@/lib/db";
import { getPriorityStatus } from "@/lib/priority";
import type { AnalysisResult } from "@/types";

interface ParsedRow {
  [key: string]: string;
}

interface AnalyzedRow {
  text: string;
  product?: string;
  analysis?: AnalysisResult;
  originalData: ParsedRow;
}

interface BulkAnalyzerProps {
  apiKey?: string;
}

export function BulkAnalyzer({ apiKey }: BulkAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [productColumn, setProductColumn] = useState<string>("none");
  const [sampleSize, setSampleSize] = useState([100]);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [analyzedData, setAnalyzedData] = useState<AnalyzedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const splitLine = (line: string) =>
      line
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((value) => value.trim().replace(/^"|"$/g, ""));

    const headers = splitLine(lines[0]);

    return lines.slice(1).map((line) => {
      const values = splitLine(line);
      const row: ParsedRow = {};
      headers.forEach((header, i) => {
        row[header] = values[i] ?? "";
      });
      return row;
    });
  };

  const handleFile = async (uploadedFile: File) => {
    if (!uploadedFile.name.match(/\.csv$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    setProgress(0);
    setAnalyzedData([]);

    try {
      const text = await uploadedFile.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast({
          title: "Empty file",
          description: "The file appears to be empty or improperly formatted.",
          variant: "destructive",
        });
        return;
      }

      const cols = Object.keys(rows[0] ?? {});
      setColumns(cols);
      setParsedData(rows);

      const textColumn =
        cols.find(
          (c) =>
            c.toLowerCase().includes("text") ||
            c.toLowerCase().includes("feedback") ||
            c.toLowerCase().includes("comment") ||
            c.toLowerCase().includes("review"),
        ) || cols[0];

      setSelectedColumn(textColumn || "");
      setProductColumn("none");
      const defaultRows = Math.min(1000, rows.length);
      setSampleSize([defaultRows]);

      toast({
        title: "File loaded",
        description: `Found ${rows.length} rows with ${cols.length} columns.`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse the file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const processData = async () => {
    if (!selectedColumn || parsedData.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    const sampleCount = Math.min(sampleSize[0], parsedData.length);
    const sampled = parsedData.slice(0, sampleCount);
    const results: AnalyzedRow[] = [];

    const feedbackRecords = [];
    const analysisRecords = [];

    const storedKey = apiKey ?? localStorage.getItem("openai_api_key") ?? "";
    if (!storedKey) {
      toast({
        title: "API key missing",
        description: "No OpenAI API key found. Using rules-only analysis.",
      });
    }

    for (let i = 0; i < sampled.length; i++) {
      const row = sampled[i];
      const text = row[selectedColumn];
      const product = productColumn !== "none" ? row[productColumn] : undefined;

      if (text && text.trim()) {
        const analysis = await runAnalysis(text.trim(), { apiKey: storedKey, useLLM: true });
        results.push({ text, product, analysis, originalData: row });

        const feedbackId = createId();
        const createdAt = new Date().toISOString();

        feedbackRecords.push({
          id: feedbackId,
          original_text: text.trim(),
          product_name: product,
          created_at: createdAt,
          updated_at: createdAt,
        });

        analysisRecords.push({
          id: createId(),
          feedback_id: feedbackId,
          sentiment: analysis.sentiment,
          sentiment_confidence: analysis.sentiment_confidence,
          defect_present: analysis.defect_present,
          defect_confidence: analysis.defect_confidence,
          safety_risk: analysis.safety_risk,
          safety_confidence: analysis.safety_confidence,
          components: analysis.components,
          risk_score: analysis.risk_score,
          rationale: analysis.rationale,
          ai_confidence: analysis.ai_confidence,
          matched_keywords: analysis.matched_keywords,
          analysis_method: analysis.analysis_method,
          status: getPriorityStatus(analysis.risk_score, analysis.ai_confidence),
          created_at: createdAt,
        });
      } else {
        results.push({ text: text || "", product, originalData: row });
      }

      setProgress(((i + 1) / sampled.length) * 100);

      if (i % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (feedbackRecords.length > 0) {
      await db.transaction("rw", db.feedback_items, db.analyses, async () => {
        await db.feedback_items.bulkAdd(feedbackRecords);
        await db.analyses.bulkAdd(analysisRecords);
      });
    }

    setAnalyzedData(results);
    setIsProcessing(false);

    const highRiskCount = results.filter((r) => r.analysis?.risk_score >= 3).length;
    toast({
      title: "Analysis complete",
      description: `Analyzed ${results.length} items. ${highRiskCount} high-risk items found.`,
      variant: highRiskCount > 0 ? "destructive" : "default",
    });
  };

  const clearFile = () => {
    setFile(null);
    setColumns([]);
    setSelectedColumn("");
    setProductColumn("none");
    setParsedData([]);
    setAnalyzedData([]);
    setProgress(0);
  };

  const summary = useMemo(() => {
    if (analyzedData.length === 0) return null;
    const analyzed = analyzedData.filter((row) => row.analysis);
    const highRisk = analyzed.filter((row) => row.analysis!.risk_score >= 3).length;
    return {
      total: analyzed.length,
      highRisk,
    };
  }, [analyzedData]);

  const maxRows = Math.min(1000, parsedData.length);
  const minRows = maxRows > 0 ? Math.min(10, maxRows) : 0;
  const rowStep = maxRows < 20 ? 1 : 10;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk CSV Analysis
          </CardTitle>
          <CardDescription>
            Upload a CSV of product reviews. Results are saved to local storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {parsedData.length} rows • {columns.length} columns
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Text Column</Label>
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select column with feedback text" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product/Model Column (optional)</Label>
                  <Select value={productColumn} onValueChange={setProductColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {columns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rows to Analyze: {sampleSize[0]}</Label>
                  <Slider
                    value={sampleSize}
                    onValueChange={setSampleSize}
                    min={minRows}
                    max={maxRows}
                    step={rowStep}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max: {maxRows} rows
                  </p>
                </div>
              </div>

              <Button
                onClick={processData}
                disabled={!selectedColumn || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Analyze {Math.min(sampleSize[0], parsedData.length)} Items</>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Last Run Summary
            </CardTitle>
            <CardDescription>
              Saved {summary.total} analyses to IndexedDB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="rounded-lg bg-muted/40 px-3 py-2">
                Total analyzed: <span className="font-semibold">{summary.total}</span>
              </div>
              <div className="rounded-lg bg-risk-high/10 px-3 py-2">
                High risk: <span className="font-semibold">{summary.highRisk}</span>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[260px]">Feedback</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyzedData.slice(0, 100).map((row, i) => (
                      <TableRow key={`${row.text}-${i}`}>
                        <TableCell className="max-w-[260px] truncate">
                          {row.text.slice(0, 80)}
                          {row.text.length > 80 ? "..." : ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.analysis?.components?.join(", ") || row.product || "—"}
                        </TableCell>
                        <TableCell>
                          {row.analysis && (
                            <SentimentBadge sentiment={row.analysis.sentiment} size="sm" />
                          )}
                        </TableCell>
                        <TableCell>
                          {row.analysis && (
                            <RiskBadge level={row.analysis.safety_risk} size="sm" />
                          )}
                        </TableCell>
                        <TableCell>
                          {row.analysis?.risk_score ?? "-"} /4
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {analyzedData.length > 100 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Showing 100 of {analyzedData.length} results.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!summary && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          No bulk analysis run yet.
        </div>
      )}
    </div>
  );
}
