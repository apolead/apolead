
-- First, delete duplicate rows, keeping only the oldest one for each row_hash
DELETE FROM public.conversion_data
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      row_hash,
      ROW_NUMBER() OVER (PARTITION BY row_hash ORDER BY created_at ASC, id ASC) as rn
    FROM public.conversion_data
    WHERE row_hash IS NOT NULL
  ) t
  WHERE rn > 1
);

-- Now recreate the unique constraint to prevent future duplicates
CREATE UNIQUE INDEX idx_conversion_data_unique_row ON public.conversion_data (row_hash);
