
-- Drop the unique constraint on calls_with_did to allow duplicate uploads
-- Duplicates will still be tracked via the hash, but won't block uploads
DROP INDEX IF EXISTS public.idx_calls_with_did_no_exact_duplicates;

-- Recreate as a regular (non-unique) index for query performance
CREATE INDEX IF NOT EXISTS idx_calls_with_did_row_hash ON public.calls_with_did USING btree (row_hash);
