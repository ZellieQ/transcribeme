import React from 'react';
import { useAppContext } from '../context/AppContext';

const LanguageSelector: React.FC = () => {
  const { languages, selectedLanguage, setSelectedLanguage, transcriptionProgress } = useAppContext();
  
  const isProcessing = transcriptionProgress.status === 'processing' || 
                      transcriptionProgress.status === 'loading';
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };
  
  return (
    <div className="language-selector">
      <label htmlFor="language-select">Language:</label>
      <select
        id="language-select"
        value={selectedLanguage}
        onChange={handleChange}
        disabled={isProcessing}
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
