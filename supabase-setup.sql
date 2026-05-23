-- eDoska Supabase Setup
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- After running, check: Storage -> bucket "classroom-files" should exist

-- 1. Classroom Sessions Table
CREATE TABLE IF NOT EXISTS classroom_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  class_name TEXT,
  subject TEXT,
  topic TEXT,
  teacher_name TEXT,
  teacher_id TEXT,
  is_authenticated BOOLEAN DEFAULT FALSE,
  authenticated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Materials Table (supports PDF, video, image, link)
CREATE TABLE IF NOT EXISTS materials (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'image', 'link')),
  url TEXT NOT NULL,
  subject TEXT DEFAULT 'General',
  session_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public access for classroom display)
CREATE POLICY "Allow all on classroom_sessions" ON classroom_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on materials" ON materials FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime Publications
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE classroom_sessions, students, materials;

-- Create Storage Bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('classroom-files', 'classroom-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to the storage bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'classroom-files');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'classroom-files');

CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'classroom-files')
WITH CHECK (bucket_id = 'classroom-files');

CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'classroom-files');
