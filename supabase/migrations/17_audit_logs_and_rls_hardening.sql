-- Migration 17: Admin Activity Audit Logs + Query Performance Indexes
-- Safe, idempotent migration for IDEAL COACHING CENTRE

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name TEXT NOT NULL DEFAULT 'BADE SIR',
  actor_email TEXT DEFAULT 'icckeguruji@gmail.com',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON public.audit_logs (entity_type, entity_id);

-- Performance indexes for fast dashboard & student app queries
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_created_at
  ON public.courses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_classes_scheduled_at
  ON public.live_classes (scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_study_materials_created_at
  ON public.study_materials (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recorded_lectures_order
  ON public.recorded_lectures (lecture_order ASC);

-- Row Level Security for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_select_policy'
  ) THEN
    CREATE POLICY audit_logs_select_policy
      ON public.audit_logs FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_logs' AND policyname = 'audit_logs_insert_policy'
  ) THEN
    CREATE POLICY audit_logs_insert_policy
      ON public.audit_logs FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
