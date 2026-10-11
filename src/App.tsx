/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Camera,
  BookOpen,
  TrendingUp,
  Map,
  BarChart3,
  Calendar,
  Library,
} from 'lucide-react';
import {
  AIAnalysisResult,
  AppTab,
  CareActionRecord,
  CareActionType,
  GardenPlant,
  ObservationRecord,
} from './types';
import {
  INITIAL_GARDEN_PLANTS,
  SAMPLE_GARDEN_PHOTOS,
  formatTurkishShortDate,
  getStatusFromScore,
} from './data/initialGardenData';
import { HomeView } from './components/HomeView';
import { AnalysisView } from './components/AnalysisView';
import { ObservationJournalView } from './components/ObservationJournalView';
import { TimeTrackingView } from './components/TimeTrackingView';
import { CareCalendarView } from './components/CareCalendarView';
import { GardenMapView } from './components/GardenMapView';
import { TeacherPanelView } from './components/TeacherPanelView';
import { ScienceFairView } from './components/ScienceFairView';
import {
  PlantEncyclopediaModal,
  PlantEncyclopediaView,
} from './components/PlantEncyclopediaModal';

const STORAGE_KEY = 'yildizkent_4006b_garden_plants_v3';
const GUIDE_STORAGE_KEY = 'yildizkent_4006b_guide_visible_v3';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [plants, setPlants] = useState<GardenPlant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial Yıldızkent Ortaokulu dataset
    }
    return INITIAL_GARDEN_PLANTS;
  });

  const [showGuide, setShowGuide] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(GUIDE_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [preselectedPlantId, setPreselectedPlantId] = useState<string | null>(
    null
  );
  const [timelinePlantId, setTimelinePlantId] = useState<string | null>(null);
  const [initialCaptureMode, setInitialCaptureMode] = useState<
    'camera' | 'gallery' | null
  >(null);
  const [encyclopediaModalPlant, setEncyclopediaModalPlant] =
    useState<GardenPlant | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch {
      // Ignore storage quota errors
    }
  }, [plants]);

  const handleRestoreBackup = (restoredPlants: GardenPlant[]) => {
    setPlants(restoredPlants);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredPlants));
    } catch {
      // Ignore
    }
  };

  const handleResetToDefaults = () => {
    setPlants(INITIAL_GARDEN_PLANTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GARDEN_PLANTS));
    } catch {
      // Ignore
    }
  };

  const handleDeletePlant = (plantId: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== plantId));
  };

  const handleClearAllPlants = () => {
    setPlants([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore
    }
  };

  const handleToggleGuide = (visible: boolean) => {
    setShowGuide(visible);
    try {
      localStorage.setItem(GUIDE_STORAGE_KEY, String(visible));
    } catch {
      // Ignore
    }
  };

  const handleQuickAnalyzeMode = (mode: 'camera' | 'gallery' | null) => {
    setInitialCaptureMode(mode);
    setActiveTab('analyze');
  };

  const handleReanalyzePlant = (plantId: string) => {
    setPreselectedPlantId(plantId);
    setInitialCaptureMode(null);
    setActiveTab('analyze');
  };

  const handleOpenTimelineForPlant = (plantId: string) => {
    setTimelinePlantId(plantId);
    setActiveTab('timeline');
  };

  const handleAddCareAction = (payload: {
    plantId: string;
    date: string;
    actionType: CareActionType;
    actionLabel: string;
    description: string;
    studentGroup: string;
  }) => {
    setPlants((prev) =>
      prev.map((plant) => {
        if (plant.id !== payload.plantId) return plant;
        const newCareRecord: CareActionRecord = {
          id: `care-${Date.now()}`,
          plantId: plant.id,
          date: payload.date,
          actionType: payload.actionType,
          actionLabel: payload.actionLabel,
          description: payload.description,
          studentGroup: payload.studentGroup,
        };
        return {
          ...plant,
          careActions: [...(plant.careActions || []), newCareRecord],
        };
      })
    );
  };

  const handleSaveObservation = (payload: {
    targetPlantId: string | 'new';
    confirmedPlantName: string;
    confirmedScientificName: string;
    newPlantLocation: string;
    mapX: number;
    mapY: number;
    studentNote: string;
    observerGroup: string;
    performedCareAction: string;
    nextCheckupDate: string;
    imageUrl: string;
    analysis: AIAnalysisResult;
  }): string => {
    const todayStr = new Date().toISOString().slice(0, 10);

    if (payload.targetPlantId !== 'new') {
      const targetId = payload.targetPlantId;
      setPlants((prev) =>
        prev.map((plant) => {
          if (plant.id !== targetId) return plant;
          const nextWeekNum = plant.observations.length + 1;
          const newObs: ObservationRecord = {
            id: `obs-${Date.now()}`,
            plantId: plant.id,
            plantNumber: plant.plantNumber,
            plantName: payload.confirmedPlantName || plant.plantName,
            scientificName:
              payload.confirmedScientificName ||
              payload.analysis.scientificName ||
              plant.scientificName,
            date: todayStr,
            nextCheckupDate: payload.nextCheckupDate,
            weekNumber: nextWeekNum,
            location: payload.newPlantLocation || plant.location,
            imageUrl: payload.imageUrl,
            healthScore: payload.analysis.healthScore,
            studentNote: payload.studentNote,
            observerGroup: payload.observerGroup,
            performedCareAction: payload.performedCareAction,
            analysis: payload.analysis,
          };

          const autoCareRecord: CareActionRecord = {
            id: `care-${Date.now() + 1}`,
            plantId: plant.id,
            date: todayStr,
            actionType: 'watering',
            actionLabel: payload.performedCareAction,
            description: `${formatTurkishShortDate(todayStr)}: ${payload.performedCareAction}`,
            studentGroup: payload.observerGroup,
            photoUrl: payload.imageUrl,
          };

          return {
            ...plant,
            plantName: payload.confirmedPlantName || plant.plantName,
            scientificName:
              payload.confirmedScientificName || plant.scientificName,
            location: payload.newPlantLocation || plant.location,
            mapX: payload.mapX ?? plant.mapX,
            mapY: payload.mapY ?? plant.mapY,
            latestImageUrl: payload.imageUrl,
            latestHealthScore: payload.analysis.healthScore,
            lastAnalysisDate: todayStr,
            nextCheckupDate: payload.nextCheckupDate,
            status: getStatusFromScore(payload.analysis.healthScore),
            observations: [...plant.observations, newObs],
            careActions: [...(plant.careActions || []), autoCareRecord],
          };
        })
      );
      return targetId;
    } else {
      const nextNum = plants.length + 1;
      const plantNumber = `B-0${nextNum}`;
      const newPlantId = `plant-${Date.now()}`;
      const newObs: ObservationRecord = {
        id: `obs-${Date.now()}`,
        plantId: newPlantId,
        plantNumber,
        plantName: payload.confirmedPlantName || payload.analysis.plantName,
        scientificName:
          payload.confirmedScientificName || payload.analysis.scientificName,
        date: todayStr,
        nextCheckupDate: payload.nextCheckupDate,
        weekNumber: 1,
        location: payload.newPlantLocation,
        imageUrl: payload.imageUrl,
        healthScore: payload.analysis.healthScore,
        studentNote: payload.studentNote,
        observerGroup: payload.observerGroup,
        performedCareAction: payload.performedCareAction,
        analysis: payload.analysis,
      };
      const initialCare: CareActionRecord = {
        id: `care-${Date.now() + 1}`,
        plantId: newPlantId,
        date: todayStr,
        actionType: 'watering',
        actionLabel: payload.performedCareAction,
        description: `${formatTurkishShortDate(todayStr)}: ${payload.performedCareAction}`,
        studentGroup: payload.observerGroup,
        photoUrl: payload.imageUrl,
      };
      const newPlant: GardenPlant = {
        id: newPlantId,
        plantNumber,
        plantName: payload.confirmedPlantName || payload.analysis.plantName,
        scientificName:
          payload.confirmedScientificName || payload.analysis.scientificName,
        location: payload.newPlantLocation,
        mapX: payload.mapX,
        mapY: payload.mapY,
        latestImageUrl: payload.imageUrl,
        latestHealthScore: payload.analysis.healthScore,
        lastAnalysisDate: todayStr,
        nextCheckupDate: payload.nextCheckupDate,
        status: getStatusFromScore(payload.analysis.healthScore),
        observations: [newObs],
        careActions: [initialCare],
      };
      setPlants((prev) => [...prev, newPlant]);
      return newPlantId;
    }
  };

  const handleUpdateStudentNote = (observationId: string, newNote: string) => {
    setPlants((prev) =>
      prev.map((plant) => ({
        ...plant,
        observations: plant.observations.map((obs) =>
          obs.id === observationId ? { ...obs, studentNote: newNote } : obs
        ),
      }))
    );
  };

  const handleAddQuickPlantOnMap = (newPlantData: {
    plantName: string;
    scientificName: string;
    location: string;
    mapX: number;
    mapY: number;
    healthScore: number;
    studentNote: string;
  }) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextNum = plants.length + 1;
    const plantNumber = `B-0${nextNum}`;
    const newPlantId = `plant-${Date.now()}`;

    const defaultObservation: ObservationRecord = {
      id: `obs-${Date.now()}`,
      plantId: newPlantId,
      plantNumber,
      plantName: newPlantData.plantName,
      scientificName: newPlantData.scientificName,
      date: todayStr,
      weekNumber: 1,
      location: newPlantData.location,
      imageUrl: SAMPLE_GARDEN_PHOTOS[0].imageUrl,
      healthScore: newPlantData.healthScore,
      studentNote: newPlantData.studentNote,
      observerGroup: 'Yıldızkent Bahçe Harita Ekibi',
      performedCareAction: 'Kroki kaydı ve ilk sulama kontrolü yapıldı.',
      analysis: {
        plantName: newPlantData.plantName,
        scientificName: newPlantData.scientificName,
        similarityStatement:
          'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Yıldızkent Ortaokulu bahçe krokisi üzerinden yeni gözlem noktası olarak kaydedilen bitki.',
        advisorReport:
          'Yıldızkent Ortaokulu bahçe haritasına yeni bitki eklendi. Haftalık fotoğraf yükleyerek gelişimini takip edebilirsiniz.',
        visualFindings: [
          'Kroki üzerinde ilk saha gözlemi gerçekleştirilmiştir.',
          'Yaprak ve gövde gelişimi haftalık olarak takip edilecektir.',
        ],
        leafStemColorAnalysis: {
          leafCondition: 'Saha gözleminde incelendi.',
          stemCondition: 'Normal gelişim evresinde.',
          colorChanges: 'Doğal yaprak rengi.',
          pestOrDiseaseRisk: 'Düşük.',
          wateringNeed: 'Haftalık düzenli sulama.',
          sunlightStatus: 'Bahçe konumuna uygun.',
          growthStatus: 'Başlangıç kaydı.',
        },
        smartRecommendations: {
          watering: 'Toprak nemini kontrol ederek düzenli sulayın.',
          locationChange: 'Mevcut bahçe konumundaki ışık durumunu izleyin.',
          soilCare: 'Kök çevresindeki yabancı otları temizleyin.',
          pruning: 'Kuruyan yaprak olursa temizleyin.',
          nutrientSupport: 'Organik kompost ile toprağı destekleyin.',
        },
        possibleCauses: [
          {
            factor: 'Çevresel Faktörler',
            explanation: 'Yıldızkent Ortaokulu bahçesi mikroklima koşulları izlenmektedir.',
          },
        ],
        careRecommendations: [
          'Haftalık fotoğraf çekerek yapay zekâ analizi ile zaman grafiğini güncelleyin.',
        ],
        scienceConnections: {
          photosynthesis:
            'Yaprak yüzeyi güneş enerjisini kimyasal enerjiye dönüştürür.',
          growthAndDevelopment:
            'Düzenli gözlem ile büyüme hızı takip edilir.',
          waterAndMineralTransport:
            'Toprak neminin korunması su ve mineral iletimini destekler.',
          ecosystem:
            'Yıldızkent Ortaokulu bahçesi biyoçeşitliliğine katkı sağlar.',
        },
        healthScore: newPlantData.healthScore,
        healthScoreBreakdown: {
          leafAppearance: newPlantData.healthScore,
          colorCondition: newPlantData.healthScore,
          vitality: newPlantData.healthScore,
          drynessControl: newPlantData.healthScore,
          stressResistance: newPlantData.healthScore,
        },
        healthScoreExplanation:
          'Harita kaydı sırasında verilen ilk gözlem puanıdır; bilimsel laboratuvar ölçümü değildir.',
        timeComparisonVerdict: 'Bitki takip edilmeye devam edilmelidir.',
      },
    };

    const created: GardenPlant = {
      id: newPlantId,
      plantNumber,
      plantName: newPlantData.plantName,
      scientificName: newPlantData.scientificName,
      location: newPlantData.location,
      mapX: newPlantData.mapX,
      mapY: newPlantData.mapY,
      latestImageUrl: SAMPLE_GARDEN_PHOTOS[0].imageUrl,
      latestHealthScore: newPlantData.healthScore,
      lastAnalysisDate: todayStr,
      status: getStatusFromScore(newPlantData.healthScore),
      observations: [defaultObservation],
      careActions: [
        {
          id: `care-${Date.now() + 2}`,
          plantId: newPlantId,
          date: todayStr,
          actionType: 'soil_care',
          actionLabel: 'Yıldızkent Bahçe Haritası İlk Kayıt ve Toprak Kontrolü',
          description: `${formatTurkishShortDate(todayStr)}: Yeni bitki gözlem noktası oluşturuldu ve kök çevresi kontrol edildi.`,
          studentGroup: 'Yıldızkent Bahçe Harita Ekibi',
        },
      ],
    };

    setPlants((prev) => [...prev, created]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F5] text-[#14241B]">
      {/* Top Bar Contract: Strictly 1 row, 3 zones (Brand wordmark | Nav Links | 1 Primary Action) */}
      <header className="sticky top-0 z-30 h-[54px] bg-white/95 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-8 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('home');
          }}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-[#14241B] whitespace-nowrap"
        >
          Yıldızkent BitkiGözlem
        </a>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'home'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Ana Ekran
          </button>
          <button
            type="button"
            onClick={() => {
              setInitialCaptureMode(null);
              setActiveTab('analyze');
            }}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'analyze'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Analiz
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('encyclopedia')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'encyclopedia'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Ansiklopedi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Bakım Takvimi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Bahçe Haritası
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-1 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Gelişim Grafiği
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={`hidden lg:inline-block py-1 transition-colors whitespace-nowrap ${
              activeTab === 'journal'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Gözlem Günlüğü
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`hidden xl:inline-block py-1 transition-colors whitespace-nowrap ${
              activeTab === 'teacher'
                ? 'text-[#0F5338] font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-[#14241B]'
            }`}
          >
            Öğretmen & Yedekleme
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('fair')}
            className={`px-3.5 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'fair'
                ? 'bg-amber-600 text-white'
                : 'bg-[#0F5338] text-white hover:bg-[#0B3F2A]'
            }`}
          >
            TÜBİTAK 4006-B Modu
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-20 md:pb-10">
        {activeTab === 'home' && (
          <HomeView
            plants={plants}
            showGuide={showGuide}
            onToggleGuide={handleToggleGuide}
            onNavigate={(tab) => setActiveTab(tab)}
            onQuickAnalyzeMode={handleQuickAnalyzeMode}
            onSelectPlantForTimeline={handleOpenTimelineForPlant}
            onReanalyzePlant={handleReanalyzePlant}
            onDeletePlant={handleDeletePlant}
            onClearAllPlants={handleClearAllPlants}
            onOpenEncyclopediaForPlant={(plant) =>
              setEncyclopediaModalPlant(plant)
            }
            onRestoreBackup={handleRestoreBackup}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalysisView
            plants={plants}
            preselectedPlantId={preselectedPlantId}
            initialCaptureMode={initialCaptureMode}
            onClearPreselected={() => {
              setPreselectedPlantId(null);
              setInitialCaptureMode(null);
            }}
            onOpenTimelineForPlant={handleOpenTimelineForPlant}
            onSaveObservation={handleSaveObservation}
          />
        )}

        {activeTab === 'encyclopedia' && (
          <PlantEncyclopediaView
            plants={plants}
            onReanalyzePlant={handleReanalyzePlant}
            onOpenTimelineForPlant={handleOpenTimelineForPlant}
          />
        )}

        {activeTab === 'calendar' && (
          <CareCalendarView
            plants={plants}
            onAddCareAction={handleAddCareAction}
            onReanalyzePlant={handleReanalyzePlant}
          />
        )}

        {activeTab === 'journal' && (
          <ObservationJournalView
            plants={plants}
            onUpdateStudentNote={handleUpdateStudentNote}
            onReanalyzePlant={handleReanalyzePlant}
            onOpenTimelineForPlant={handleOpenTimelineForPlant}
            onOpenCalendar={() => setActiveTab('calendar')}
            onOpenEncyclopediaForPlant={(plant) =>
              setEncyclopediaModalPlant(plant)
            }
          />
        )}

        {activeTab === 'timeline' && (
          <TimeTrackingView
            plants={plants}
            initialSelectedPlantId={timelinePlantId}
            onReanalyzePlant={handleReanalyzePlant}
            onOpenCalendar={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'map' && (
          <GardenMapView
            plants={plants}
            onReanalyzePlant={handleReanalyzePlant}
            onOpenTimelineForPlant={handleOpenTimelineForPlant}
            onOpenCalendarForPlant={() => setActiveTab('calendar')}
            onOpenEncyclopediaForPlant={(plant) =>
              setEncyclopediaModalPlant(plant)
            }
            onAddQuickPlantOnMap={handleAddQuickPlantOnMap}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherPanelView
            plants={plants}
            onReanalyzePlant={handleReanalyzePlant}
            onOpenTimelineForPlant={handleOpenTimelineForPlant}
            onOpenEncyclopediaForPlant={(plant) =>
              setEncyclopediaModalPlant(plant)
            }
            onRestoreBackup={handleRestoreBackup}
            onResetToDefaults={handleResetToDefaults}
          />
        )}

        {activeTab === 'fair' && (
          <ScienceFairView
            plants={plants}
            onStartLiveDemo={() => {
              setInitialCaptureMode(null);
              setActiveTab('analyze');
            }}
          />
        )}
      </main>

      {/* Plant Encyclopedia Modal (Accessible from any plant card) */}
      {encyclopediaModalPlant && (
        <PlantEncyclopediaModal
          plant={encyclopediaModalPlant}
          onClose={() => setEncyclopediaModalPlant(null)}
          onReanalyzePlant={handleReanalyzePlant}
          onOpenTimelineForPlant={handleOpenTimelineForPlant}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobil Alt Menü"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-7 items-center px-1"
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'home' ? 'text-[#0F5338] font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Ana Ekran</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setInitialCaptureMode(null);
            setActiveTab('analyze');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'analyze'
              ? 'text-[#0F5338] font-bold'
              : 'text-slate-500'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Analiz</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('encyclopedia')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'encyclopedia'
              ? 'text-[#0F5338] font-bold'
              : 'text-slate-500'
          }`}
        >
          <Library className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Ansiklopedi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'calendar'
              ? 'text-[#0F5338] font-bold'
              : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Takvim</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'map' ? 'text-[#0F5338] font-bold' : 'text-slate-500'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Harita</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'timeline'
              ? 'text-[#0F5338] font-bold'
              : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Grafik</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teacher')}
          className={`flex flex-col items-center justify-center min-h-[44px] ${
            activeTab === 'teacher'
              ? 'text-[#0F5338] font-bold'
              : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 whitespace-nowrap">Yedek/Veri</span>
        </button>
      </nav>
    </div>
  );
}
