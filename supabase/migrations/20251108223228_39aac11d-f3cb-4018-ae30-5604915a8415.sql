-- Create user_schedule table for tracking work availability
CREATE TABLE IF NOT EXISTS public.user_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, schedule_date)
);

-- Enable RLS
ALTER TABLE public.user_schedule ENABLE ROW LEVEL SECURITY;

-- Users can view their own schedule
CREATE POLICY "Users can view their own schedule"
ON public.user_schedule
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own schedule
CREATE POLICY "Users can insert their own schedule"
ON public.user_schedule
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own schedule
CREATE POLICY "Users can update their own schedule"
ON public.user_schedule
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own schedule
CREATE POLICY "Users can delete their own schedule"
ON public.user_schedule
FOR DELETE
USING (auth.uid() = user_id);

-- Supervisors can view all schedules
CREATE POLICY "Supervisors can view all schedules"
ON public.user_schedule
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.credentials = 'supervisor'
  )
);

-- Create index for performance
CREATE INDEX idx_user_schedule_user_date ON public.user_schedule(user_id, schedule_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_schedule_updated_at
BEFORE UPDATE ON public.user_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_user_schedule_updated_at();