import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Preferences {
  language: string;
  currency: string;
  flag: string;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (newPrefs: Preferences) => Promise<void>;
}

const defaultPreferences: Preferences = {
  language: 'English (EN)',
  currency: 'USD',
  flag: 'us'
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : defaultPreferences;
  });

  useEffect(() => {
    const loadFromSupabase = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          const newPrefs = {
            language: data.language,
            currency: data.currency,
            flag: data.flag
          };
          setPreferences(newPrefs);
          localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
        }
      }
    };
    loadFromSupabase();
  }, []);

  const updatePreferences = async (newPrefs: Preferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id, 
          language: newPrefs.language, 
          currency: newPrefs.currency,
          flag: newPrefs.flag 
        });
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
  return context;
};
