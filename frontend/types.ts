export interface User {
  credits: number;
  isLoggedIn: boolean;
  isGuest?: boolean;
  username?: string;
  email?: string;
  user_id?: string;
}

export type Language = 'EN' | 'HI';

export enum AppState {
  LANDING = 'LANDING',
  APP = 'APP',
  PRICING = 'PRICING',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  REFUND = 'REFUND',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  BILLING = 'BILLING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  BLOG = 'BLOG',
  BLOG_ARTICLE = 'BLOG_ARTICLE'
}

export interface HistoryItem {
  id: string;
  url: string;
  timestamp: number;
  settings?: any;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GenerationResult {
  originalUrl: string;
  generatedUrl: string;
}

export interface GenerationConfig {
  gender: 'female' | 'male';
  age: string;
  mode: string;
  bodyType: string;
  breastSize: string;
  assSize: string;
  genitalType: string;
}


export const GOOGLE_CLIENT_ID = "";

// Port 8000: Authentication, User Data, Billing
export const API_URL = "http://10.0.0.194:8000";

// Port 8003: Dedicated Image Generation Pipeline
export const GENERATION_API_URL = "http://10.0.0.194:8003";
export const WS_URL = "ws://10.0.0.194:8000/ws";
export const CONFIG_OPTIONS = {
  age: ['automatic', '18', '25', '35', '45', '60'],
  modes: [
    { id: 'naked', label: 'Naked', image: 'https://storage.cloud.google.com/rcloths/athletic-294.jpg?authuser=1' },
    { id: 'bondage', label: 'Bondage', image: 'https://images.unsplash.com/photo-1596568359553-a56de6970068?q=80&w=200&auto=format&fit=crop' },
    { id: 'swimsuit', label: 'swimsuit', image: 'https://images.unsplash.com/photo-1622396636133-743013d5b11d?q=80&w=200&auto=format&fit=crop' },
    { id: 'latex', label: 'Latex', image: 'https://images.unsplash.com/photo-1596568359553-a56de6970068?q=80&w=200&auto=format&fit=crop' },
    { id: 'underwear', label: 'Underwear', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }
  ],
  bodyTypes: [
    { id: 'fit', label: 'fit', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&auto=format&fit=crop' },
    { id: 'curvy', label: 'Curvy', image: 'https://images.unsplash.com/photo-1563878696884-69792440375e?q=80&w=200&auto=format&fit=crop' },
    { id: 'skinny', label: 'Skinny', image: 'https://images.unsplash.com/photo-1625407004456-e925b0373dfd?q=80&w=200&auto=format&fit=crop' },
    { id: 'muscular', label: 'athletic', image: 'https://images.unsplash.com/photo-1522259160539-72f534e64f02?q=80&w=200&auto=format&fit=crop' }
  ],
  breastSizes: [
    { id: 'small', label: 'Small', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop' },
    { id: 'medium', label: 'Medium', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
    { id: 'large', label: 'Large', image: 'https://images.unsplash.com/photo-1630595304192-1277a063162b?q=80&w=200&auto=format&fit=crop' },
  ],
  assSizes: [
    { id: 'small', label: 'Small', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop' },
    { id: 'medium', label: 'Medium', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
    { id: 'large', label: 'Large', image: 'https://images.unsplash.com/photo-1630595304192-1277a063162b?q=80&w=200&auto=format&fit=crop' },
  ],
  genitals: [
    { id: 'shaved', label: 'Shaved', image: 'https://images.unsplash.com/photo-1563878696884-69792440375e?q=80&w=200&auto=format&fit=crop' },
    { id: 'normal', label: 'Normal', image: 'https://images.unsplash.com/photo-1596568359553-a56de6970068?q=80&w=200&auto=format&fit=crop' },
    { id: 'hairy', label: 'Hairy', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }
  ]
  ,
  GENDER_OPTIONS: [
    { id: 'female', label: 'female', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800' },
    { id: 'male', label: 'male', image: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=800' },
  ]
};
