import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages, Language } from '@/lib/languages';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (languageId: string) => void;
}

const LanguageSelector = ({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedLanguage.id} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.id} 
              value={lang.id}
              className="text-foreground hover:bg-secondary focus:bg-secondary"
            >
              <div className="flex items-center gap-2">
                <span>{lang.name}</span>
                {!lang.canExecuteInBrowser && (
                  <span className="text-xs text-muted-foreground">(backend)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LanguageSelector;
