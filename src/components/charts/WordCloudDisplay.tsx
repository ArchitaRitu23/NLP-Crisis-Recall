import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WordCloudDisplayProps {
  words: { text: string; count: number }[];
  title?: string;
}

// Simplified word cloud using CSS - no external library needed
export function WordCloudDisplay({ words, title = "Keyword Word Cloud" }: WordCloudDisplayProps) {
  const processedWords = useMemo(() => {
    if (words.length === 0) return [];
    
    const maxCount = Math.max(...words.map(w => w.count));
    const minCount = Math.min(...words.map(w => w.count));
    const range = maxCount - minCount || 1;

    return words.map(word => ({
      ...word,
      // Scale font size between 0.75rem and 2rem based on frequency
      size: 0.75 + ((word.count - minCount) / range) * 1.25,
      // Vary opacity based on frequency
      opacity: 0.6 + ((word.count - minCount) / range) * 0.4
    })).sort(() => Math.random() - 0.5); // Shuffle for visual variety
  }, [words]);

  if (words.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] flex items-center justify-center text-muted-foreground">
            No keywords available
          </div>
        </CardContent>
      </Card>
    );
  }

  const colorClasses = [
    "text-primary",
    "text-risk-high",
    "text-risk-medium",
    "text-chart-3",
    "text-chart-4",
    "text-chart-5"
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[150px] flex flex-wrap items-center justify-center gap-2 p-4">
          {processedWords.slice(0, 30).map((word, index) => (
            <span
              key={word.text}
              className={`inline-block px-2 py-1 rounded transition-transform hover:scale-110 cursor-default ${colorClasses[index % colorClasses.length]}`}
              style={{
                fontSize: `${word.size}rem`,
                opacity: word.opacity,
                fontWeight: word.count > (words[0]?.count || 0) * 0.7 ? 600 : 400
              }}
              title={`${word.text}: ${word.count} occurrences`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
