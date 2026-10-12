-- Create enum for risk levels
CREATE TYPE public.safety_risk_level AS ENUM ('none', 'low', 'medium', 'high');

-- Create enum for sentiment
CREATE TYPE public.sentiment_type AS ENUM ('positive', 'neutral', 'negative');

-- Create enum for analysis method
CREATE TYPE public.analysis_method AS ENUM ('rules', 'llm', 'hybrid');

-- Create feedback_items table
CREATE TABLE public.feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_text TEXT NOT NULL,
    source VARCHAR(100),
    product_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID REFERENCES public.feedback_items(id) ON DELETE CASCADE,
    sentiment public.sentiment_type NOT NULL,
    sentiment_confidence DECIMAL(3,2) CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
    defect_present BOOLEAN DEFAULT FALSE,
    defect_confidence DECIMAL(3,2) CHECK (defect_confidence >= 0 AND defect_confidence <= 1),
    safety_risk public.safety_risk_level DEFAULT 'none',
    safety_confidence DECIMAL(3,2) CHECK (safety_confidence >= 0 AND safety_confidence <= 1),
    components JSONB DEFAULT '[]'::jsonb,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 4),
    rationale TEXT,
    matched_keywords JSONB DEFAULT '[]'::jsonb,
    analysis_method public.analysis_method DEFAULT 'hybrid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table for bulk analyses
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    total_items INTEGER DEFAULT 0,
    high_risk_count INTEGER DEFAULT 0,
    average_risk_score DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create report_items junction table
CREATE TABLE public.report_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (this is a demo app without auth)
CREATE POLICY "Allow public read on feedback_items" ON public.feedback_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on feedback_items" ON public.feedback_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on analyses" ON public.analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on analyses" ON public.analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Allow public read on report_items" ON public.report_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on report_items" ON public.report_items FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to feedback_items
CREATE TRIGGER update_feedback_items_updated_at
    BEFORE UPDATE ON public.feedback_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_analyses_risk_score ON public.analyses(risk_score);
CREATE INDEX idx_analyses_safety_risk ON public.analyses(safety_risk);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at);
CREATE INDEX idx_report_items_report_id ON public.report_items(report_id);