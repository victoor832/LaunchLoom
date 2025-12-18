// Supabase Email Service
// This service handles storing user emails without authentication

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

interface EmailRecord {
  email: string;
  tier: string;
  product_name: string;
  created_at?: string;
}

/**
 * Save email to Supabase without authentication
 * Uses anon key for public inserts
 */
export const saveEmailToSupabase = async (
  email: string,
  tier: string,
  productName: string
): Promise<boolean> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Skipping email save.');
    return false;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        email,
        tier,
        product_name: productName,
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to save email:', response.statusText);
      return false;
    }

    console.log('Email saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving email to Supabase:', error);
    return false;
  }
};

/**
 * Alternative: Save to a simple backend endpoint
 * (if Supabase is not available)
 */
export const saveEmailToBackend = async (
  email: string,
  tier: string,
  productName: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tier,
        productName,
      }),
    });

    if (!response.ok) {
      console.error('Failed to save email:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving email:', error);
    return false;
  }
};
