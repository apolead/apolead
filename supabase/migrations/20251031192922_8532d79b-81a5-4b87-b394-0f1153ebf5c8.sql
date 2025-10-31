-- Drop the unique constraint on row_hash to allow all rows to be imported
DROP INDEX IF EXISTS public.idx_calls_with_did_unique_row;

-- Keep the row_hash column and trigger for reference/analysis purposes
-- but don't enforce uniqueness