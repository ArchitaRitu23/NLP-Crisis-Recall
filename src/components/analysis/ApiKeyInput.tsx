import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
}

const STORAGE_KEY = "openai_api_key";

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="openai-key" className="flex items-center gap-2 text-sm">
        <KeyRound className="h-4 w-4 text-muted-foreground" />
        OpenAI API Key (stored locally)
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Input
            id="openai-key"
            type={showKey ? "text" : "password"}
            placeholder="sk-..."
            value={value}
            onChange={(e) => {
              const next = e.target.value;
              onChange(next);
              localStorage.setItem(STORAGE_KEY, next.trim());
            }}
          />
          <button
            type="button"
            onClick={() => setShowKey((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="button" variant="secondary" onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </div>
  );
}
