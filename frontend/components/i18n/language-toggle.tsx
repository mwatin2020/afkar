"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/language-provider";

export function LanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <Button variant="outline" onClick={toggleLanguage}>
      <Languages className="me-2 h-4 w-4" />
      {language === "en" ? t.language.switchToArabic : t.language.switchToEnglish}
    </Button>
  );
}
