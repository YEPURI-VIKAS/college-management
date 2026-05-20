import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvcxytbbtzdkeowtnlym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Y3h5dGJidHpka2Vvd3RubHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTYyNTUsImV4cCI6MjA5NDY3MjI1NX0.6VoAGQU7FjDH5YbmlMeITYlpxrz1Wr2TuzQhp_baiyQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
