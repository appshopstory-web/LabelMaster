
import { createClient } from '@supabase/supabase-js';

/**
 * Configurações de conexão com o Supabase.
 * Projeto: xhgwxesktuuzfogzojmc
 */
const supabaseUrl = 'https://xhgwxesktuuzfogzojmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ3d4ZXNrdHV1emZvZ3pvam1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODcxNjQsImV4cCI6MjA4Njg2MzE2NH0.7lD4o1f_79KVS0XZQKewmQlK_9TgLzHdpy8We--wKyU';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
