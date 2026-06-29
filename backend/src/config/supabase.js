const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Una pequeña validación para avisarnos si olvidamos algo
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Error: Faltan las variables de entorno de Supabase en el archivo .env");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;