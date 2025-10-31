-- First, delete duplicate rows keeping only the oldest one of each duplicate set
DELETE FROM public.calls_with_did a
USING public.calls_with_did b
WHERE a.id > b.id
  AND a."CID_name" = b."CID_name"
  AND a."CID_num" = b."CID_num"
  AND a."DID_num" = b."DID_num"
  AND a.start = b.start
  AND a.duration = b.duration
  AND a."lastStatus" = b."lastStatus";

-- Now create the unique constraint to prevent future duplicates
CREATE UNIQUE INDEX idx_calls_with_did_no_exact_duplicates 
ON public.calls_with_did ("CID_name", "CID_num", "DID_num", start, duration, "lastStatus");