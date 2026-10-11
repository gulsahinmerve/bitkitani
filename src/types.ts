export type PlantStatus = 'healthy' | 'monitor' | 'inspect';

export interface HealthScoreBreakdown {
  leafAppearance: number;
  colorCondition: number;
  vitality: number;
  drynessControl: number;
  stressResistance: number;
}

export interface PossibleCause {
  factor: string;
  explanation: string;
}

export interface ScienceConnections {
  photosynthesis: string;
  growthAndDevelopment: string;
  waterAndMineralTransport: string;
  ecosystem: string;
}

export interface LeafStemColorAnalysis {
  leafCondition: string;
  stemCondition: string;
  colorChanges: string;
  pestOrDiseaseRisk?: string;
  wateringNeed?: string;
  sunlightStatus?: string;
  growthStatus?: string;
}

export interface SmartRecommendations {
  watering: string;
  locationChange: string;
  soilCare: string;
  pruning: string;
  nutrientSupport: string;
}

export interface LeafDamageReport {
  hasDamage: boolean;
  damageSeverity: 'Yok / Sağlıklı' | 'Hafif' | 'Orta' | 'Yoğun';
  detectedIssues: string[]; // Örn: ["Yaprak uçlarında hafif kuruma", "Alt yapraklarda sararma"]
  diseaseOrPestSimilarity: string; // Kesin teşhis olmadan benzerlik açıklaması
  immediateActionPlan: string; // Hasara özel öğrenci müdahale önerisi
}

export interface CareVerificationReport {
  isCareEffective: boolean;
  verificationSummary: string; // Örn: "Geçen hafta önerilen düzenli sulama ve budama uygulamasının doğru yapıldığı ve yaprak canlılığını artırdığı görülmektedir."
  observedImprovementDetails: string; // Yapraklardaki iyileşme veya devam eden belirtiler
  nextWeekGoal: string; // Gelecek hafta kontrol edilecek hedef
}

export interface AIAnalysisResult {
  plantName: string;
  scientificName: string;
  identificationConfidence?: number; // 0-100 arası tahmin güven oranı
  similarityStatement: string;
  advisorReport?: string;
  leafDamageReport?: LeafDamageReport;
  careVerificationReport?: CareVerificationReport;
  visualFindings: string[];
  leafStemColorAnalysis: LeafStemColorAnalysis;
  smartRecommendations?: SmartRecommendations;
  possibleCauses: PossibleCause[];
  careRecommendations: string[];
  scienceConnections: ScienceConnections;
  healthScore: number;
  healthScoreBreakdown: HealthScoreBreakdown;
  healthScoreExplanation: string;
  timeComparisonVerdict: string;
}

export type CareActionType =
  | 'watering'
  | 'location_change'
  | 'soil_care'
  | 'pruning'
  | 'nutrient_support';

export interface CareActionRecord {
  id: string;
  plantId: string;
  date: string; // YYYY-MM-DD
  actionType: CareActionType;
  actionLabel: string; // Örn: "Sulama yapıldı", "Budama yapıldı", "Yer değiştirme"
  description: string; // Örn: "12 Eylül: Sulama yapıldı."
  studentGroup: string;
  photoUrl?: string;
}

export interface ObservationRecord {
  id: string;
  plantId: string;
  plantNumber: string;
  plantName: string;
  scientificName: string;
  date: string;
  nextCheckupDate?: string; // 1 hafta sonraki kontrol tarihi (YYYY-MM-DD)
  weekNumber?: number;
  location: string;
  imageUrl: string;
  healthScore: number;
  studentNote: string;
  observerGroup: string;
  performedCareAction?: string;
  analysis: AIAnalysisResult;
}

export interface PlantEncyclopediaInfo {
  family: string; // Botanik ailesi (Örn: Oleaceae - Zeytingiller)
  originAndHabitat: string; // Doğal yayılış ve yaşam alanı
  generalInfo: string; // Genel tanıtım ve ortaokul seviyesinde açıklama
  botanicalTraits: {
    leafType: string; // Yaprak yapısı ve dizilişi
    stemAndRoot: string; // Gövde ve kök sistemi
    floweringSeason: string; // Çiçeklenme ve meyve dönemi
    maxHeight: string; // Ortalama boylanma
    sunAndSoil: string; // İdeal ışık ve toprak isteği
  };
  yildizkentCareTips: string[]; // Yıldızkent Ortaokulu bahçesine özgü bakım ipuçları
  scienceDidYouKnow: string; // Fen Bilimleri "Biliyor muydunuz?" kutusu
}

export interface GardenPlant {
  id: string;
  plantNumber: string;
  plantName: string;
  scientificName: string;
  location: string;
  campusZone?: string;
  mapX: number; // 0-100 percentage on school garden blueprint
  mapY: number; // 0-100 percentage on school garden blueprint
  latestImageUrl: string;
  latestHealthScore: number;
  lastAnalysisDate: string;
  nextCheckupDate?: string; // 1 hafta sonraki fotoğraf kontrol tarihi
  status: PlantStatus;
  encyclopedia?: PlantEncyclopediaInfo;
  observations: ObservationRecord[];
  careActions?: CareActionRecord[];
}

export type AppTab =
  | 'home'
  | 'analyze'
  | 'encyclopedia'
  | 'journal'
  | 'timeline'
  | 'calendar'
  | 'map'
  | 'teacher'
  | 'fair';

export interface SamplePlantPhoto {
  id: string;
  title: string;
  location: string;
  linkedPlantId: string;
  imageUrl: string;
  description: string;
}
