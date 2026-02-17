
export enum PrinterModel {
  ARGOX = 'Argox (PPLA/PPLB)',
  BEMATECH = 'Bematech',
  ZEBRA = 'Zebra (ZPL)',
  ELGIN = 'Elgin',
  GENERIC = 'Genérica / Térmica USB'
}

export enum LabelStyle {
  CLASSIC = 'Clássico Profissional',
  MODERN = 'Moderno & Negrito',
  MINIMAL = 'Minimalista Limpo',
  COMPACT = 'Compacto Vertical'
}

export interface NutritionItem {
  name: string;
  amount: string;
  dailyValue: string;
}

export interface GithubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  provider: 'google' | 'github' | 'email';
}

export interface LabelConfig {
  width: number; // mm
  height: number; // mm
  printer: PrinterModel;
  layoutStyle: LabelStyle;
  productName: string;
  ingredients: string;
  preparation: string;
  batch: string;
  expiry: string;
  companyName: string;
  companyContact: string;
  whatsapp: string;
  email: string;
  barcode: string;
  qrCode: string;
  logoUrl: string;
  logoWidth: number; // px
  logoHeight: number; // px
  logoDisplaySize: number; // px - tamanho de exibição da logo
  qrCodeSize: number; // px
  paddingTop: number; // px
  paddingBottom: number; // px
  paddingLeft: number; // px
  paddingRight: number; // px
  internalSpacing: number; // px
  productNameFontSize: number; // px
  globalFontSize: number; // px
  companyFontSize: number; // px
  nutrition: NutritionItem[];
}

export interface SavedTemplate {
  id: string;
  name: string;
  date: string;
  config: LabelConfig;
}

export const DEFAULT_CONFIG: LabelConfig = {
  width: 100,
  height: 150,
  printer: PrinterModel.GENERIC,
  layoutStyle: LabelStyle.CLASSIC,
  productName: 'Nome do Seu Produto',
  ingredients: 'Farinha de trigo, água, sal, fermento biológico...',
  preparation: 'Aquecer em forno pré-aquecido por 10 minutos a 180°C.',
  batch: 'LOT-2024-001',
  expiry: '2025-12-31',
  companyName: 'Minha Empresa Ltda',
  companyContact: 'Rua das Flores, 123 - Centro',
  whatsapp: '(11) 99999-9999',
  email: 'contato@empresa.com.br',
  barcode: '7891234567890',
  qrCode: 'https://empresa.com.br',
  logoUrl: '',
  logoWidth: 80,
  logoHeight: 50,
  logoDisplaySize: 60,
  qrCodeSize: 42,
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 10,
  paddingRight: 10,
  internalSpacing: 8,
  productNameFontSize: 16,
  globalFontSize: 7,
  companyFontSize: 8,
  nutrition: [
    { name: 'Valor Energético', amount: '150 kcal', dailyValue: '8%' },
    { name: 'Carboidratos', amount: '30g', dailyValue: '10%' },
    { name: 'Proteínas', amount: '5g', dailyValue: '7%' },
    { name: 'Gorduras Totais', amount: '2g', dailyValue: '3%' },
  ]
};
