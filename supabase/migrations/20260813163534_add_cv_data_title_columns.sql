/*
# Add cv_data and title columns to cvs table

1. Modified Tables
- `cvs`
- `cv_data` (jsonb, nullable) — structured CV data matching the CVPreview component shape
  (personal, summary, experience, education, skills, extras). Populated by the editor.
- `title` (text, nullable) — editable display title for the CV (shown in dashboard and editor top bar)

2. Security
- No new policies needed — existing owner-scoped CRUD policies already cover these columns.
- The edge function inserts with the service role key (bypasses RLS).

3. Notes
- Both columns are nullable so existing rows and the interview-generated CVs remain valid.
- The editor page reads cv_data if present; otherwise it falls back to the flat columns
  (name, target_role, recent_role, etc.) to build the initial CVPreviewData.
*/

ALTER TABLE cvs
  ADD COLUMN IF NOT EXISTS cv_data jsonb,
  ADD COLUMN IF NOT EXISTS title text;
