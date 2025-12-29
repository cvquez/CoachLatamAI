"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma guardado del localStorage
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'es' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Traducciones
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Marca
    'brand.name': 'CoachLatamAI',
    'brand.tagline': 'Coaching Potenciado por IA',
    
    // Marketplace
    'marketplace.title': 'Encuentra Tu Coach Perfecto',
    'marketplace.subtitle': 'Conéctate con coaches de clase mundial potenciados por IA que te ayudarán a alcanzar tus metas y desbloquear tu máximo potencial',
    'marketplace.expert_coaches': 'Coaches Expertos',
    'marketplace.available_now': 'Disponibles Ahora',
    'marketplace.average_rating': 'Calificación Promedio',
    'marketplace.avg_per_session': 'Promedio por Sesión',
    'marketplace.get_started_client': 'Comenzar como Cliente',
    'marketplace.become_coach': 'Convertirse en Coach',
    'marketplace.coaches_available': 'Coaches Disponibles',
    'marketplace.browse_coaches': 'Navega y conéctate con coaches expertos',
    'marketplace.no_coaches': 'No se encontraron coaches',
    'marketplace.adjust_filters': 'Intenta ajustar tus filtros para ver más resultados',
    'marketplace.reset_filters': 'Restablecer Filtros',
    
    // Filtros
    'filters.title': 'Filtros',
    'filters.clear': 'Limpiar',
    'filters.search': 'Buscar',
    'filters.search_placeholder': 'Buscar coaches...',
    'filters.specializations': 'Especializaciones',
    'filters.minimum_rating': 'Calificación Mínima',
    'filters.any': 'Cualquiera',
    'filters.any_rating': 'Cualquier calificación',
    'filters.stars': 'estrellas',
    'filters.maximum_price': 'Precio Máximo por Sesión',
    'filters.any_price': 'Cualquier precio',
    'filters.up_to': 'Hasta',
    'filters.years_experience': 'Años de Experiencia',
    'filters.any_experience': 'Cualquier experiencia',
    'filters.years': 'años',
    'filters.languages': 'Idiomas',
    'filters.availability': 'Disponibilidad',
    'filters.available_now': 'Disponible Ahora',
    'filters.limited_availability': 'Disponibilidad Limitada',
    'filters.verified_only': 'Solo Coaches Verificados',
    
    // Ordenamiento
    'sort.featured_first': 'Destacados Primero',
    'sort.highest_rated': 'Mejor Calificados',
    'sort.most_reviews': 'Más Reseñas',
    'sort.price_low_high': 'Precio: Menor a Mayor',
    'sort.price_high_low': 'Precio: Mayor a Menor',
    'sort.most_experience': 'Más Experiencia',
    
    // Especializaciones
    'spec.executive': 'Coaching Ejecutivo',
    'spec.life': 'Coaching de Vida',
    'spec.career': 'Coaching de Carrera',
    'spec.health': 'Salud y Bienestar',
    'spec.business': 'Coaching de Negocios',
    'spec.leadership': 'Desarrollo de Liderazgo',
    'spec.mindfulness': 'Mindfulness',
    'spec.relationship': 'Coaching de Relaciones',
    'spec.financial': 'Coaching Financiero',
    'spec.performance': 'Coaching de Desempeño',
    
    // Idiomas
    'lang.english': 'Inglés',
    'lang.spanish': 'Español',
    'lang.french': 'Francés',
    'lang.german': 'Alemán',
    'lang.portuguese': 'Portugués',
    'lang.italian': 'Italiano',
    'lang.mandarin': 'Mandarín',
    
    // Disponibilidad
    'availability.available': 'Disponible',
    'availability.busy': 'Disponibilidad Limitada',
    'availability.not_accepting': 'No Acepta Clientes',
    
    // Coach Card
    'coach.years': 'años',
    'coach.per_session': 'por sesión',
    'coach.view_profile': 'Ver Perfil',
    'coach.featured': 'Coach Destacado',
    'coach.reviews': 'reseñas',
    
    // Navbar
    'nav.change_language': 'Cambiar Idioma',
  },
  en: {
    // Marketplace
    'marketplace.title': 'Find Your Perfect Coach',
    'marketplace.subtitle': 'Connect with world-class coaches who will help you achieve your goals and unlock your full potential',
    'marketplace.expert_coaches': 'Expert Coaches',
    'marketplace.available_now': 'Available Now',
    'marketplace.average_rating': 'Average Rating',
    'marketplace.avg_per_session': 'Avg. per Session',
    'marketplace.get_started_client': 'Get Started as Client',
    'marketplace.become_coach': 'Become a Coach',
    'marketplace.coaches_available': 'Coaches Available',
    'marketplace.browse_coaches': 'Browse and connect with expert coaches',
    'marketplace.no_coaches': 'No coaches found',
    'marketplace.adjust_filters': 'Try adjusting your filters to see more results',
    'marketplace.reset_filters': 'Reset Filters',
    
    // Filtros
    'filters.title': 'Filters',
    'filters.clear': 'Clear',
    'filters.search': 'Search',
    'filters.search_placeholder': 'Search coaches...',
    'filters.specializations': 'Specializations',
    'filters.minimum_rating': 'Minimum Rating',
    'filters.any': 'Any',
    'filters.any_rating': 'Any rating',
    'filters.stars': 'stars',
    'filters.maximum_price': 'Maximum Price per Session',
    'filters.any_price': 'Any price',
    'filters.up_to': 'Up to',
    'filters.years_experience': 'Years of Experience',
    'filters.any_experience': 'Any experience',
    'filters.years': 'years',
    'filters.languages': 'Languages',
    'filters.availability': 'Availability',
    'filters.available_now': 'Available Now',
    'filters.limited_availability': 'Limited Availability',
    'filters.verified_only': 'Verified Coaches Only',
    
    // Ordenamiento
    'sort.featured_first': 'Featured First',
    'sort.highest_rated': 'Highest Rated',
    'sort.most_reviews': 'Most Reviews',
    'sort.price_low_high': 'Price: Low to High',
    'sort.price_high_low': 'Price: High to Low',
    'sort.most_experience': 'Most Experience',
    
    // Especializaciones
    'spec.executive': 'Executive Coaching',
    'spec.life': 'Life Coaching',
    'spec.career': 'Career Coaching',
    'spec.health': 'Health & Wellness',
    'spec.business': 'Business Coaching',
    'spec.leadership': 'Leadership Development',
    'spec.mindfulness': 'Mindfulness',
    'spec.relationship': 'Relationship Coaching',
    'spec.financial': 'Financial Coaching',
    'spec.performance': 'Performance Coaching',
    
    // Idiomas
    'lang.english': 'English',
    'lang.spanish': 'Spanish',
    'lang.french': 'French',
    'lang.german': 'German',
    'lang.portuguese': 'Portuguese',
    'lang.italian': 'Italian',
    'lang.mandarin': 'Mandarin',
    
    // Disponibilidad
    'availability.available': 'Available',
    'availability.busy': 'Limited Availability',
    'availability.not_accepting': 'Not Accepting Clients',
    
    // Coach Card
    'coach.years': 'years',
    'coach.per_session': 'per session',
    'coach.view_profile': 'View Profile',
    'coach.featured': 'Featured Coach',
    'coach.reviews': 'reviews',
    
    // Navbar
    'nav.change_language': 'Change Language',
  }
};
