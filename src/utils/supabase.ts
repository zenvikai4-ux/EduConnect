import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nkhafddwarlulgpkgksw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raGFmZGR3YXJsdWxncGtna3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDg1MDgsImV4cCI6MjA5MzI4NDUwOH0.Dc9Ue_vVHlc8BvURbgXF9ETa4qEA4uRM-wXjZYOszrU';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raGFmZGR3YXJsdWxncGtna3N3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwODUwOCwiZXhwIjoyMDkzMjg0NTA4fQ.youGjw5NifIwg6eczgINdsnzvaicn9npjn0Rn5hRhzw';

// Regular client for data queries
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Admin client for auth bypass - uses service role key
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type UserRole =
  | 'student' | 'parent' | 'teacher' | 'class_teacher'
  | 'admin' | 'principal' | 'driver' | 'super_admin';
