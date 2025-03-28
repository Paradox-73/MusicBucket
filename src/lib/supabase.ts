import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yaszlvumzolahcbxeqeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhc3psdnVtem9sYWhjYnhlcWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczOTA5MjEsImV4cCI6MjA1Mjk2NjkyMX0.uKXPglJGQcvT27ohbNzmUbgoIgLY0yEuWp-_ASpWMnE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);