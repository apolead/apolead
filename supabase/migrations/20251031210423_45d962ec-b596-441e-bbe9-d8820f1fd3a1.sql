
-- Drop the unique constraint on row_hash to allow duplicate uploads
-- Duplicates will still be tracked via the hash, but won't block uploads
DROP INDEX IF EXISTS public.idx_conversion_data_unique_row;

-- Recreate as a regular (non-unique) index for query performance
CREATE INDEX IF NOT EXISTS idx_conversion_data_row_hash ON public.conversion_data USING btree (row_hash);
