import { supabase } from '../lib/supabase';

export const ReminderService = {
  async getReminderStatus(userId: string) {
    const { data, error } = await supabase
      .from('bucket_list_reminders')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching reminder status:', error);
      return null;
    }
    return data;
  },

  async subscribeToReminders(userId: string, frequency: 'weekly' | 'monthly') {
    const { data, error } = await supabase
      .from('bucket_list_reminders')
      .upsert({
        user_id: userId,
        frequency: frequency,
        is_active: true,
        last_sent_at: null, // Reset last sent date on new subscription
      }, { onConflict: 'user_id' }) // Upsert based on user_id
      .select();

    if (error) {
      console.error('Error subscribing to reminders:', error);
      throw error;
    }
    return data;
  },

  async unsubscribeFromReminders(userId: string) {
    const { data, error } = await supabase
      .from('bucket_list_reminders')
      .update({ frequency: 'none', is_active: false })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error unsubscribing from reminders:', error);
      throw error;
    }
    return data;
  },

  async updateReminderFrequency(userId: string, frequency: 'weekly' | 'monthly' | 'none') {
    const { data, error } = await supabase
      .from('bucket_list_reminders')
      .upsert({
        user_id: userId,
        frequency: frequency,
        is_active: frequency !== 'none',
      }, { onConflict: 'user_id' }) // Upsert based on user_id
      .select();

    if (error) {
      console.error('Error updating reminder frequency:', error);
      throw error;
    }
    return data;
  },

  // NEW: Function for "Remind me now" button (for development/testing)
  async sendTestReminder(userId: string) {
    console.log(`Simulating reminder for user: ${userId}`);
    // In a real scenario, this would trigger an email/notification service.
    // For now, we'll just update the last_sent_at to simulate a reminder being sent.
    const { data, error } = await supabase
      .from('bucket_list_reminders')
      .update({ last_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Error simulating test reminder:', error);
      throw error;
    }
    console.log('Test reminder simulated successfully. Check last_sent_at in Supabase.');
    return data;
  },
};