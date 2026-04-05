import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "@/locales/en";
import { fr } from "@/locales/fr";

const STORAGE_KEY = "filmvault-locale";

function getInitialLanguage(): string {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved === "fr" || saved === "en") return saved;
	} catch {
		// ignore
	}
	return "fr";
}

i18n.use(initReactI18next).init({
	resources: {
		fr: { translation: fr },
		en: { translation: en },
	},
	lng: getInitialLanguage(),
	fallbackLng: "fr",
	interpolation: {
		escapeValue: false,
	},
});

i18n.on("languageChanged", (lng) => {
	try {
		localStorage.setItem(STORAGE_KEY, lng);
		document.documentElement.lang = lng;
	} catch {
		// ignore
	}
});

export default i18n;
