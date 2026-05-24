import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nkhafddwarlulgpkgksw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5raGFmZGR3YXJsdWxncGtna3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDg1MDgsImV4cCI6MjA5MzI4NDUwOH0.Dc9Ue_vVHlc8BvURbgXF9ETa4qEA4uRM-wXjZYOszrU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export type UserRole =
  | 'student' | 'parent' | 'teacher' | 'class_teacher'
  | 'admin' | 'principal' | 'driver' | 'super_admin';
