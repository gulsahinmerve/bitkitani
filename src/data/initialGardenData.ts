import {
  CareActionType,
  GardenPlant,
  PlantEncyclopediaInfo,
  PlantStatus,
  SamplePlantPhoto,
} from '../types';
import oliveTreeImg from '../assets/images/plant_olive_tree_1790439640100.jpg';
import roseBushImg from '../assets/images/plant_rose_bush_1790439656108.jpg';
import lavenderImg from '../assets/images/plant_lavender_1790439667698.jpg';
import sycamoreImg from '../assets/images/plant_sycamore_maple_1790439679574.jpg';

export const SCHOOL_NAME = 'Yıldızkent Ortaokulu';
export const SCHOOL_PROJECT_TITLE =
  'Yıldızkent Ortaokulu · Yapay Zekâ Destekli Okul Bahçesi Bitki Sağlığı İzleme Sistemi';

export interface CampusZoneInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  microclimate: string;
  typicalSpecies: string[];
}

export const YILDIZKENT_CAMPUS_ZONES: CampusZoneInfo[] = [
  {
    id: 'zone-main-gate',
    name: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
    shortName: 'Ana Giriş & Atatürk Köşesi',
    description: 'Okulun güney cephesinde yer alan, gün boyu güneş alan tören ve karşılama bahçesi.',
    microclimate: 'Tam güneşli, rüzgâra orta düzeyde açık',
    typicalSpecies: ['Genç Zeytin Ağacı', 'Anadolu Karaçamı', 'Mavi Servi'],
  },
  {
    id: 'zone-science-lab',
    name: 'A Blok Fen Laboratuvarı Önü Gül Tarhı',
    shortName: 'A Blok Fen Lab. Gül Tarhı',
    description: 'Fen Bilimleri laboratuvarı pencerelerinin önünde öğrencilerin günlük gözlem yaptığı çiçek parseli.',
    microclimate: 'Yarı gölge / sabah güneşi, nem tutma kapasitesi yüksek toprak',
    typicalSpecies: ['Yediveren Bahçe Gülü', 'Kasımpatı', 'Kadife Çiçeği'],
  },
  {
    id: 'zone-ecology-greenhouse',
    name: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
    shortName: 'B Blok Ekoloji & Sera Alanı',
    description: 'TÜBİTAK 4006-B projesi kapsamında tıbbi ve aromatik bitkilerin yetiştirildiği uygulama alanı.',
    microclimate: 'Bol güneşli, süzek ve taşlı-kumlu drenajlı toprak',
    typicalSpecies: ['Tıbbi Lavanta Kümesi', 'Biberiye', 'Adaçayı', 'Kekik'],
  },
  {
    id: 'zone-sports-corridor',
    name: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
    shortName: 'Spor Sahası Çınar Koridoru',
    description: 'Basketbol ve voleybol sahasının doğu sınırındaki gölgeleme ağaçları kuşağı.',
    microclimate: 'Öğleden sonra beton ısı yansımasına açık, derin kök sulaması gerektiren hat',
    typicalSpecies: ['Doğu Çınarı Fidanı', 'Çınar Yapraklı Akçaağaç', 'Dişbudak'],
  },
  {
    id: 'zone-library-west',
    name: 'Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru',
    shortName: 'Kütüphane & Bilişim Bahçesi',
    description: 'Okul kütüphanesi yanındaki dinlenme bankları çevresinde yer alan kokulu ağaç ve çalı alanı.',
    microclimate: 'Kuzey rüzgârlarına karşı bina siperli, ılıman ve dengeli nemli',
    typicalSpecies: ['Gümüşi Ihlamur Fidanı', 'Biberiye Çalısı', 'Süs Elması'],
  },
];

export function getStatusFromScore(score: number): PlantStatus {
  if (score >= 80) return 'healthy';
  if (score >= 60) return 'monitor';
  return 'inspect';
}

export function getStatusLabel(status: PlantStatus): {
  label: string;
  dot: string;
  badgeText: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  switch (status) {
    case 'healthy':
      return {
        label: 'Sağlıklı',
        dot: '🟢',
        badgeText: '🟢 Sağlıklı',
        colorClass: 'text-emerald-800',
        bgClass: 'bg-emerald-50',
        borderClass: 'border-emerald-300',
      };
    case 'monitor':
      return {
        label: 'Takip edilmeli',
        dot: '🟡',
        badgeText: '🟡 Takip edilmeli',
        colorClass: 'text-amber-800',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-300',
      };
    case 'inspect':
      return {
        label: 'İncelenmeli',
        dot: '🔴',
        badgeText: '🔴 İncelenmeli',
        colorClass: 'text-red-800',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-300',
      };
  }
}

export function formatTurkishShortDate(dateStr: string): string {
  const months: Record<string, string> = {
    '01': 'Ocak',
    '02': 'Şubat',
    '03': 'Mart',
    '04': 'Nisan',
    '05': 'Mayıs',
    '06': 'Haziran',
    '07': 'Temmuz',
    '08': 'Ağustos',
    '09': 'Eylül',
    '10': 'Ekim',
    '11': 'Kasım',
    '12': 'Aralık',
  };
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthName = months[parts[1]] || parts[1];
  return `${day} ${monthName}`;
}

export interface AnalysisReminderStatus {
  isDue: boolean; // Son analizden itibaren 7 gün veya daha fazla geçtiyse true
  daysSinceLastAnalysis: number;
  daysUntilNextAnalysis: number;
  lastDateFormatted: string;
  badgeLabel: string;
  detailMessage: string;
}

export function getAnalysisReminderStatus(
  lastAnalysisDateStr: string
): AnalysisReminderStatus {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const parts = lastAnalysisDateStr.split('-').map((n) => parseInt(n, 10));
  const lastUtc =
    parts.length === 3 && !parts.some(isNaN)
      ? Date.UTC(parts[0], parts[1] - 1, parts[2])
      : todayUtc;

  const diffMs = todayUtc - lastUtc;
  const daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const isDue = daysElapsed >= 7;
  const daysRemaining = Math.max(0, 7 - daysElapsed);
  const lastDateFormatted = formatTurkishShortDate(lastAnalysisDateStr);

  if (isDue) {
    return {
      isDue: true,
      daysSinceLastAnalysis: daysElapsed,
      daysUntilNextAnalysis: 0,
      lastDateFormatted,
      badgeLabel: '🔔 Analiz Zamanı',
      detailMessage: `Son analizden (${lastDateFormatted}) bu yana ${daysElapsed} gün geçti. Haftalık kontrol fotoğrafı yükleme zamanı geldi!`,
    };
  }

  return {
    isDue: false,
    daysSinceLastAnalysis: daysElapsed,
    daysUntilNextAnalysis: daysRemaining,
    lastDateFormatted,
    badgeLabel:
      daysElapsed === 0
        ? '✅ Bugün Analiz Edildi'
        : `⏳ Yeni Analize ${daysRemaining} Gün Kaldı`,
    detailMessage: `Son analiz ${daysElapsed} gün önce (${lastDateFormatted}) yapıldı. Haftalık kontrol için ${daysRemaining} gün kaldı.`,
  };
}

export function getCareActionMeta(actionType: CareActionType): {
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotColor: string;
} {
  switch (actionType) {
    case 'watering':
      return {
        label: '💧 Sulama Yapıldı',
        shortLabel: 'Sulama',
        badgeClass: 'bg-sky-50 text-sky-900 border-sky-200',
        dotColor: '#0284C7',
      };
    case 'pruning':
      return {
        label: '✂️ Budama Yapıldı',
        shortLabel: 'Budama',
        badgeClass: 'bg-rose-50 text-rose-900 border-rose-200',
        dotColor: '#E11D48',
      };
    case 'location_change':
      return {
        label: '☀️ Yer Değiştirme',
        shortLabel: 'Yer Değiştirme',
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
        dotColor: '#D97706',
      };
    case 'soil_care':
      return {
        label: '🌱 Toprak Bakımı',
        shortLabel: 'Toprak Bakımı',
        badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        dotColor: '#059669',
      };
    case 'nutrient_support':
      return {
        label: '🧪 Besin Desteği',
        shortLabel: 'Besin Desteği',
        badgeClass: 'bg-purple-50 text-purple-900 border-purple-200',
        dotColor: '#7C3AED',
      };
  }
}

export function getPlantEncyclopedia(plant: GardenPlant): PlantEncyclopediaInfo {
  if (plant.encyclopedia) return plant.encyclopedia;
  return {
    family: 'Yıldızkent Ortaokulu Bahçe Florası (Kapalı Tohumlu Bitkiler)',
    originAndHabitat: `${plant.location} ve Anadolu ılıman bahçe ekosistemi.`,
    generalInfo: `${plant.plantName} (${plant.scientificName}), Yıldızkent Ortaokulu bahçesinde öğrencilerin düzenli bilimsel gözlem yaptığı ve ekosistem çeşitliliğine katkı sağlayan bir bahçe bitkisidir.`,
    botanicalTraits: {
      leafType: 'Klorofilce zengin, güneş ışığını soğuran yeşil yaprak ayası.',
      stemAndRoot: 'Sürgün gelişimini destekleyen iletim demetlerine (ksilem ve floem) sahip gövde ve kök sistemi.',
      floweringSeason: 'İlkbahar – Yaz büyüme ve çiçeklenme dönemi.',
      maxHeight: 'Bahçe koşullarına uyumlu form.',
      sunAndSoil: 'Yıldızkent Ortaokulu bahçesi mikroklimasına uygun güneşlenme ve nemli-süzek toprak.',
    },
    yildizkentCareTips: [
      `${plant.location} bölgesinde toprak nemi haftada en az 1-2 kez parmakla kontrol edilerek sabah saatlerinde kök sulaması yapılmalıdır.`,
      'Sararan veya kuruyan alt yapraklar gözlemlendiğinde öğretmen gözetiminde budanarak bitkiden uzaklaştırılmalıdır.',
      'Kök çevresindeki yabancı otlar temizlenmeli ve toprak yüzeyi hafifçe havalandırılmalıdır.',
    ],
    scienceDidYouKnow:
      'Bitkiler kökleriyle topraktan aldıkları su ve mineralleri odun boruları (ksilem) ile yapraklara taşır; yapraklarda fotosentezle üretilen besinleri ise soymuk boruları (floem) ile tüm bitkiye dağıtır!',
  };
}

export const SAMPLE_GARDEN_PHOTOS: SamplePlantPhoto[] = [
  {
    id: 'sample-olive',
    title: 'B-01 Yıldızkent Zeytin Fidanı',
    location: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
    linkedPlantId: 'plant-1',
    imageUrl: oliveTreeImg,
    description: 'Ana giriş tören alanı yanındaki zeytin fidanının haftalık yaprak canlılığı gözlemi.',
  },
  {
    id: 'sample-rose',
    title: 'B-02 Fen Lab. Yediveren Gülü',
    location: 'A Blok Fen Laboratuvarı Önü Gül Tarhı',
    linkedPlantId: 'plant-2',
    imageUrl: roseBushImg,
    description: 'A Blok Fen Laboratuvarı önünde yaprak budaması ve dip sulama uygulanan gül.',
  },
  {
    id: 'sample-lavender',
    title: 'B-03 Ekoloji Köşesi Tıbbi Lavanta',
    location: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
    linkedPlantId: 'plant-3',
    imageUrl: lavenderImg,
    description: 'Yıldızkent Ortaokulu uygulama serası yanındaki aromatik lavanta kümesi.',
  },
  {
    id: 'sample-sycamore',
    title: 'B-04 Spor Sahası Doğu Çınarı',
    location: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
    linkedPlantId: 'plant-4',
    imageUrl: sycamoreImg,
    description: 'Spor sahası kenarında kök çanağı genişletilen genç Doğu Çınarı.',
  },
];

export const INITIAL_GARDEN_PLANTS: GardenPlant[] = [
  {
    id: 'plant-1',
    plantNumber: 'B-01',
    plantName: 'Yıldızkent Genç Zeytin Ağacı',
    scientificName: 'Olea europaea',
    location: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
    campusZone: 'zone-main-gate',
    mapX: 24,
    mapY: 72,
    latestImageUrl: oliveTreeImg,
    latestHealthScore: 84,
    lastAnalysisDate: '2026-09-25',
    status: 'healthy',
    encyclopedia: {
      family: 'Oleaceae (Zeytingiller)',
      originAndHabitat: 'Akdeniz Havzası ve Anadolu. Güneşli, ılıman ve kuraklığa dayanıklı ekosistemler.',
      generalInfo:
        'Zeytin ağacı dört mevsim yaprağını dökmeyen (herdem yeşil), uzun ömürlü ve kuraklığa karşı yüksek uyum yeteneğine sahip odunsu bir bitkidir. Yapraklarının üst yüzeyi koyu yeşil, alt yüzeyi ise su kaybını azaltan gümüşi tüycüklerle kaplıdır.',
      botanicalTraits: {
        leafType: 'Karşılıklı dizilişli, mızrak şeklinde, derimsi ve gümüşi-yeşil yapraklar.',
        stemAndRoot: 'Gençken düzgün gri kabuklu gövde; toprağın derinliklerine inen güçlü kazık ve saçak kök sistemi.',
        floweringSeason: 'Nisan – Mayıs aylarında salkım şeklinde beyazımsı-sarı çiçekler açar.',
        maxHeight: 'Okul bahçesi koşullarında 4 – 8 metre (budama ile form verilebilir).',
        sunAndSoil: 'Tam güneşli cephe; su tutmayan, kireçli-tınlı ve iyi havalanan toprak.',
      },
      yildizkentCareTips: [
        'Yıldızkent Ana Giriş ve Atatürk Köşesi güney cephede yer aldığı için fidanın güneşini kesen duyuru panoları fidanın 2 metre uzağına yerleştirilmelidir.',
        'Yaz ve erken sonbahar döneminde haftada 2 kez sabah 08:30 civarında kök çanağına 3-4 litre dip sulama yapılmalıdır.',
        'Kış yağışları öncesinde kök çevresindeki toprak hafifçe çapalanmalı, gövde dibinde su göllenmesi önlenmelidir.',
      ],
      scienceDidYouKnow:
        'Zeytin yaprağının alt yüzeyindeki mikroskobik şemsiye benzeri tüyler (trikomlar), stomaları güneşin yakıcı etkisinden koruyarak terleme ile su kaybını %40’a kadar azaltır!',
    },
    careActions: [
      {
        id: 'care-101',
        plantId: 'plant-1',
        date: '2026-09-12',
        actionType: 'watering',
        actionLabel: 'Düzenli Kök Sulaması',
        description: '12 Eylül: Sulama yapıldı. Ana girişteki zeytin fidanına sabah 08:30’da 4 litre dip sulama uygulandı.',
        studentGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
        photoUrl: oliveTreeImg,
      },
      {
        id: 'care-102',
        plantId: 'plant-1',
        date: '2026-09-16',
        actionType: 'soil_care',
        actionLabel: 'Toprak Çapalama ve Yabancı Ot Temizliği',
        description: '16 Eylül: Toprak bakımı yapıldı. Kök çevresindeki sertleşmiş toprak çapalandı ve yabancı otlar temizlendi.',
        studentGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
      },
      {
        id: 'care-103',
        plantId: 'plant-1',
        date: '2026-09-19',
        actionType: 'location_change',
        actionLabel: 'Güneş Alma Yönü ve Siperlik Düzenlemesi',
        description: '19 Eylül: Yer değiştirme / ışık düzenlemesi yapıldı. Fidanın güney cephesini gölgeleyen pano kenara çekilerek doğrudan güneş alması sağlandı.',
        studentGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
      },
      {
        id: 'care-104',
        plantId: 'plant-1',
        date: '2026-09-23',
        actionType: 'pruning',
        actionLabel: 'Sararan Alt Yaprakların Budanması',
        description: '23 Eylül: Budama yapıldı. En alttaki kuruyan 2 yaşlı sürgün ucu bahçe makasıyla temizlendi.',
        studentGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
      },
    ],
    observations: [
      {
        id: 'obs-101',
        plantId: 'plant-1',
        plantNumber: 'B-01',
        plantName: 'Yıldızkent Genç Zeytin Ağacı',
        scientificName: 'Olea europaea',
        date: '2026-09-10',
        weekNumber: 1,
        location: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
        imageUrl: oliveTreeImg,
        healthScore: 60,
        observerGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
        performedCareAction: '10 Eylül: Toprak nemi kontrol edildi, ilk sulama planı oluşturuldu.',
        studentNote:
          'Hafta 1: Okul açılış haftasında Atatürk Köşesi yanındaki zeytin fidanımızın alt yapraklarında sararma ve toprakta kuruluk gözlemledik.',
        analysis: {
          plantName: 'Yıldızkent Genç Zeytin Ağacı',
          scientificName: 'Olea europaea',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Yaz kuraklığına bağlı su eksikliği ve alt yapraklarda hafif klorofil kaybı.',
          advisorReport:
            'Bu hafta bitkinin alt yapraklarında hafif sararma ve kıvrılma görülüyor. Daha düzenli sulama yapılması ve güneş ışığını kesen engellerin kaldırılması önerilir.',
          visualFindings: [
            'Üst sürgün yapraklarında gümüşi-yeşil renk korunmaktadır.',
            'Alt dallardaki yapraklarda sararma (kloroz) ve hafif solma gözlenmektedir.',
            'Toprak yüzeyi kuru ve çatlaklı görünümdedir.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Alt yapraklarda nem kaybına bağlı hafif kıvrılma var.',
            stemCondition: 'Genç sürgün dalları sağlam ancak büyüme yavaş.',
            colorChanges: 'Alt yapraklarda klorofil azalmasına bağlı sarı ton geçişi.',
            pestOrDiseaseRisk: 'Düşük ihtimal; zararlı böcek izine rastlanmadı.',
            wateringNeed: 'Yüksek — Haftada 2 kez düzenli dip sulama gerekli.',
            sunlightStatus: 'Orta — Tören panosu öğleden sonra kısmi gölge yapıyor.',
            growthStatus: 'Yavaşlamış — Su stresi nedeniyle yeni sürgün çıkışı sınırlı.',
          },
          smartRecommendations: {
            watering: 'Haftada 2 gün sabah erken saatlerde kök bölgesine 3-4 litre su verilmeli.',
            locationChange: 'Fidanın güneybatı yönündeki gölgeleyici engel kaldırılarak tam güneş alması sağlanmalı.',
            soilCare: 'Kök çanağındaki kabuk bağlamış toprak hafifçe çapalanarak havalandırılmalı.',
            pruning: 'Tamamen kurumuş en alt 2 yaprak dalı temizlenmeli.',
            nutrientSupport: 'Sonbahar başında organik kompost ile toprak desteklenebilir.',
          },
          possibleCauses: [
            {
              factor: 'Su Eksikliği',
              explanation:
                'Yaz tatili döneminde düzensiz sulama nedeniyle bitki suyu genç uç yapraklara yönlendirmiştir.',
            },
            {
              factor: 'Mineral Eksikliği',
              explanation:
                'Topraktaki azot ve magnezyum emiliminin azalması yaşlı alt yapraklarda sararmaya yol açabilir.',
            },
          ],
          careRecommendations: [
            'Toprak nemini 3-4 cm derinlikten kontrol ederek haftada 2 kez sabah saatlerinde sulayın.',
            'Ağaç dibindeki yabancı otları temizleyerek su rekabetini azaltın.',
            'Sararan yaprakların sayısını gelecek hafta tekrar sayarak değişimi kaydedin.',
          ],
          scienceConnections: {
            photosynthesis:
              'Yapraklardaki klorofil pigmenti azaldığında ışık enerjisinin soğurulması ve fotosentez hızı düşer.',
            growthAndDevelopment:
              'Bitki büyümesini sürdürmek için besin elementlerini genç uç sürgünlere öncelikli olarak aktarır.',
            waterAndMineralTransport:
              'Köklerden odun boruları (ksilem) ile taşınan su azaldığında yapraklarda turgor basıncı düşer.',
            ecosystem:
              'Yıldızkent Ortaokulu bahçesindeki zeytin ağacı kuraklığa dayanıklı yapısıyla toprak erozyonunu önler.',
          },
          healthScore: 60,
          healthScoreBreakdown: {
            leafAppearance: 62,
            colorCondition: 56,
            vitality: 64,
            drynessControl: 55,
            stressResistance: 63,
          },
          healthScoreExplanation:
            'Alt yapraklardaki sararma ve toprak kuruluğu nedeniyle Hafta 1 puanı 60/100 olarak hesaplanmıştır. Bilimsel laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Hafta 1 başlangıç gözlem kaydı oluşturuldu (60 puan).',
        },
      },
      {
        id: 'obs-102',
        plantId: 'plant-1',
        plantNumber: 'B-01',
        plantName: 'Yıldızkent Genç Zeytin Ağacı',
        scientificName: 'Olea europaea',
        date: '2026-09-17',
        weekNumber: 2,
        location: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
        imageUrl: oliveTreeImg,
        healthScore: 68,
        observerGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
        performedCareAction: '12 Eylül: Sulama yapıldı. 16 Eylül: Toprak çapalandı.',
        studentNote:
          'Hafta 2: Düzenli sulama ve çapalama sonrasında yaprakların dikleştiğini ve sararmanın durduğunu gözlemledik.',
        analysis: {
          plantName: 'Yıldızkent Genç Zeytin Ağacı',
          scientificName: 'Olea europaea',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Su dengesi normale dönmeye başlayan ve yaprak turgorunu geri kazanan genç zeytin fidanı.',
          advisorReport:
            'Geçen haftaya göre yaprak canlılığında belirgin artış var. Düzenli sulama ve toprak havalandırma olumlu sonuç verdi.',
          visualFindings: [
            'Yaprak yüzeylerinde parlak yeşil görünüm artmıştır.',
            'Yeni yapraklarda sararma görülmemektedir.',
            'Üst sürgün uçlarında yeni tomurcuk hazırlığı başlamıştır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yapraklar dik ve gergin (turgor durumu iyileşti).',
            stemCondition: 'Gövde ve yan dallar esnek ve sağlıklı.',
            colorChanges: 'Koyu yeşil klorofil yoğunluğu üst yapraklarda belirginleşti.',
            pestOrDiseaseRisk: 'Düşük — Yaprak yüzeyleri temiz.',
            wateringNeed: 'Dengeli — Mevcut haftalık sulama rutini korunmalı.',
            sunlightStatus: 'İyi — Gölgeleme azaltıldı.',
            growthStatus: 'İyileşiyor — Uç meristemlerde büyüme aktif.',
          },
          smartRecommendations: {
            watering: 'Haftalık düzenli kök sulamasına aynı saatte devam edilmeli.',
            locationChange: 'Güney yönündeki açık görüş korunmalı.',
            soilCare: 'Çapalanan toprağın nemini korumak için kuru yaprak malçı eklenebilir.',
            pruning: 'Alt kısımdaki tek tük kuru yapraklar alınabilir.',
            nutrientSupport: 'Doğal humus takviyesi ile mineral dengesi desteklenebilir.',
          },
          possibleCauses: [
            {
              factor: 'Düzenli Sulama ve Toprak Havalandırma',
              explanation: 'Kök bölgesine suyun rahat ulaşması yaprak diriliğini artırmıştır.',
            },
          ],
          careRecommendations: [
            'Mevcut sulama düzenini koruyun, aşırı sulamadan kaçının.',
            'Gelecek hafta yeni çıkan yaprak sayısını kaydedin.',
          ],
          scienceConnections: {
            photosynthesis:
              'Geniş ve koyu yeşil yaprak yüzeyi güneş ışığını verimli kullanarak besin üretimini artırır.',
            growthAndDevelopment:
              'Uç meristem dokularındaki hücre bölünmesi ile yeni sürgünler uzamaktadır.',
            waterAndMineralTransport:
              'Düzenli sulama sayesinde kök emici tüyleri topraktan çözünmüş mineralleri yapraklara verimli taşımaktadır.',
            ecosystem:
              'Sağlıklı ağaç örtüsü Yıldızkent Ortaokulu bahçesindeki mikro-iklimi dengeler.',
          },
          healthScore: 68,
          healthScoreBreakdown: {
            leafAppearance: 70,
            colorCondition: 66,
            vitality: 72,
            drynessControl: 66,
            stressResistance: 66,
          },
          healthScoreExplanation:
            'Önceki haftaya göre yaprak diriliği arttığı için sağlık puanı 60’tan 68’e yükselmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict:
            'Geçen haftaya göre yaprak canlılığında artış gözlendi. Bitkinin genel sağlık puanı 60’tan 68’e yükseldi (+8 puan).',
        },
      },
      {
        id: 'obs-103',
        plantId: 'plant-1',
        plantNumber: 'B-01',
        plantName: 'Yıldızkent Genç Zeytin Ağacı',
        scientificName: 'Olea europaea',
        date: '2026-09-25',
        weekNumber: 3,
        location: 'Yıldızkent Ana Giriş & Atatürk Köşesi Bahçesi',
        imageUrl: oliveTreeImg,
        healthScore: 84,
        observerGroup: 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
        performedCareAction: '19 Eylül: Güneş yönü açıldı. 23 Eylül: Kuru alt sürgünler budandı.',
        studentNote:
          'Hafta 3: Üçüncü hafta ölçümümüzde 6 yeni yaprak çıktı. Budama ve ışık düzenlemesi sonrası sağlık puanımız 84’e ulaştı.',
        analysis: {
          plantName: 'Yıldızkent Genç Zeytin Ağacı',
          scientificName: 'Olea europaea',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Sağlıklı gelişim gösteren, yüksek klorofil canlılığına sahip zeytin sürgünü.',
          advisorReport:
            'Harika gelişim! 3 haftalık düzenli sulama, toprak çapalama ve güneşlenme düzenlemesi sonucunda bitki 84 puana ulaşarak sağlıklı kategorisine geçti.',
          visualFindings: [
            'Yapraklarda canlı yeşil renk ve karakteristik gümüşi alt yüzey net biçimde seçilmektedir.',
            'Kuruma veya yeni lekelenme belirtisi yoktur.',
            'Sürgün uçları 3 cm uzayarak aktif büyüme göstermiştir.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak kenarları düzgün, su kaybı belirtisi yok.',
            stemCondition: 'Genç dal dokusu pürüzsüz ve dayanıklı.',
            colorChanges: 'Homojen ve canlı zeytin yeşili.',
            pestOrDiseaseRisk: 'Yok — Yaprak ve gövde tamamen sağlıklı.',
            wateringNeed: 'Normal — Haftada 1-2 kez nem kontrolüyle sulama yeterli.',
            sunlightStatus: 'Çok İyi — Gün boyu doğrudan güneş ışığı alıyor.',
            growthStatus: 'Hızlı ve Sağlıklı — 6 yeni yaprak oluşumu tamamlandı.',
          },
          smartRecommendations: {
            watering: 'Sonbahar yağışlarına göre haftada 1 kez dip sulama yeterli olacaktır.',
            locationChange: 'Mevcut güneşli konumu çok uygun, değişiklik gerekmez.',
            soilCare: 'Kış öncesi kök çevresine koruyucu organik malç serilebilir.',
            pruning: 'İlkbahara kadar ek budama yapılmasına gerek yoktur.',
            nutrientSupport: 'Mevcut mineral dengesi yeterli görünmektedir.',
          },
          possibleCauses: [
            {
              factor: 'Dengeli Bakım ve Güneş Işığı',
              explanation: 'Yıldızkent Ana Giriş bahçesinde yeterli güneş alması ve düzenli nem kontrolü bitkiyi güçlendirmiştir.',
            },
          ],
          careRecommendations: [
            'Haftalık fotoğraflarla yeni sürgün boyunu gözlem defterine not etmeye devam edin.',
            'Kış öncesi kök çevresine kuru yaprak örtüsü sererek toprak ısısını koruyun.',
          ],
          scienceConnections: {
            photosynthesis:
              'Sağlıklı stomalar ve bol klorofil sayesinde karbondioksit özümlemesi optimum düzeyde gerçekleşir.',
            growthAndDevelopment:
              'Vejetatif büyüme evresi sağlıklı ilerlemekte, dal ve yaprak biyokütlesi artmaktadır.',
            waterAndMineralTransport:
              'Terleme-çekim kuvveti ile köklerden uç yapraklara kesintisiz su iletimi sağlanmaktadır.',
            ecosystem:
              'Yıldızkent Ortaokulu bahçesinde karbon ayak izini azaltan uzun ömürlü odunsu bitki örneğidir.',
          },
          healthScore: 84,
          healthScoreBreakdown: {
            leafAppearance: 86,
            colorCondition: 82,
            vitality: 88,
            drynessControl: 82,
            stressResistance: 82,
          },
          healthScoreExplanation:
            'Yaprak canlılığı, dik duruşu ve renk bütünlüğü nedeniyle 84/100 puan verilmiştir. Bu değer görsel tahmindir, laboratuvar analizi değildir.',
          timeComparisonVerdict:
            'Geçen haftaya göre yaprak canlılığında artış gözlendi. Bitkinin genel sağlık puanı 68’den 84’e yükseldi (+16 puan).',
        },
      },
    ],
  },
  {
    id: 'plant-2',
    plantNumber: 'B-02',
    plantName: 'Yediveren Bahçe Gülü',
    scientificName: 'Rosa hybrida',
    location: 'A Blok Fen Laboratuvarı Önü Gül Tarhı',
    campusZone: 'zone-science-lab',
    mapX: 48,
    mapY: 36,
    latestImageUrl: roseBushImg,
    latestHealthScore: 78,
    lastAnalysisDate: '2026-09-24',
    status: 'monitor',
    encyclopedia: {
      family: 'Rosaceae (Gülgiller)',
      originAndHabitat: 'Anadolu ve Asya kökenli kültür formu. Yarı güneşli ve açık hava akımlı bahçe tarhları.',
      generalInfo:
        'Yediveren bahçe gülü, ilkbahardan sonbahar sonuna kadar birden fazla kez çiçek açabilen çok yıllık, dikenli ve yarı odunsu bir çalı bitkisidir. Bileşik yapraklarının kenarları testere dişlidir ve fotosentez kapasitesi yüksektir.',
      botanicalTraits: {
        leafType: '5 veya 7 yaprakçıklı bileşik yaprak; kenarları dişli ve parlak koyu yeşil.',
        stemAndRoot: 'Klorofilli yeşil-kahverengi dikenli sürgünler; orta derinlikte lifli kök yapısı.',
        floweringSeason: 'Mayıs ayından Kasım ayına kadar periyodik katmerli çiçeklenme.',
        maxHeight: '60 cm – 150 cm arası çalı formu.',
        sunAndSoil: 'Günde en az 5-6 saat doğrudan güneş ışığı; organik maddece zengin, nemli fakat süzek toprak.',
      },
      yildizkentCareTips: [
        'A Blok Fen Laboratuvarı önündeki gül tarhında sulama kesinlikle yaprakların üstünden fıskiye ile değil, sabah saatlerinde doğrudan kök dibine yapılmalıdır.',
        'Bina gölgesinde kalan saksı ve fideler, yapraklarda nem kaynaklı kara leke oluşmaması için tarhın güney kenarındaki güneşli şeride konumlandırılmalıdır.',
        'Solan çiçek başları ve lekeli alt yapraklar Fen Bilimleri öğretmeni gözetiminde budanarak bitkiden uzaklaştırılmalıdır.',
      ],
      scienceDidYouKnow:
        'Gül gövdesindeki dikenler aslında gerçek diken (dal başkalaşımı) değil, epidermis tabakasından gelişen koruyucu kabuk çıkıntılarıdır ve bitkiyi otçul canlılara karşı korur.',
    },
    careActions: [
      {
        id: 'care-201',
        plantId: 'plant-2',
        date: '2026-09-11',
        actionType: 'watering',
        actionLabel: 'Üstten Sulamanın Kesilip Dip Sulamaya Geçilmesi',
        description: '11 Eylül: Sulama düzeni değiştirildi. Yapraklarda leke oluşmaması için sabah saatlerinde sadece kök dibine su verildi.',
        studentGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
        photoUrl: roseBushImg,
      },
      {
        id: 'care-202',
        plantId: 'plant-2',
        date: '2026-09-18',
        actionType: 'pruning',
        actionLabel: 'Lekeli Alt Yaprakların Budanması',
        description: '18 Eylül: Budama yapıldı. Fen bilgisi öğretmenimiz gözetiminde kahverengi lekeli alt yapraklar budanarak uzaklaştırıldı.',
        studentGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
      },
      {
        id: 'care-203',
        plantId: 'plant-2',
        date: '2026-09-20',
        actionType: 'location_change',
        actionLabel: 'Saksı/Tarh Kenarı Güneşli Alana Taşıma',
        description: '20 Eylül: Yer değiştirme yapıldı. Bina gölgesinde kalan gül saksısı Fen Laboratuvarı önündeki doğrudan güneş alan güney tarh kenarına taşındı.',
        studentGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
      },
    ],
    observations: [
      {
        id: 'obs-201',
        plantId: 'plant-2',
        plantNumber: 'B-02',
        plantName: 'Yediveren Bahçe Gülü',
        scientificName: 'Rosa hybrida',
        date: '2026-09-10',
        weekNumber: 1,
        location: 'A Blok Fen Laboratuvarı Önü Gül Tarhı',
        imageUrl: roseBushImg,
        healthScore: 65,
        observerGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
        performedCareAction: '10 Eylül: İlk yaprak leke gözlemi kaydedildi.',
        studentNote:
          'Hafta 1: A Blok Fen Laboratuvarı önündeki gülün alt yapraklarında kahverengi benekler gördük. Akşam fıskiye sulaması yaprakları ıslak bırakıyor.',
        analysis: {
          plantName: 'Yediveren Bahçe Gülü',
          scientificName: 'Rosa hybrida',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Yaprak yüzeyinin uzun süre nemli kalmasına bağlı görsel lekelenme ve çevresel nem stresi.',
          advisorReport:
            'Bu hafta gül yapraklarında nem kaynaklı koyu lekeler ve hafif sararma görülüyor. Yaprak üstten sulamanın durdurulması ve daha güneşli bir konuma alınması önerilir.',
          visualFindings: [
            'Alt yapraklarda dairesel kahverengi-siyah lekelenmeler mevcuttur.',
            'Üst kısımda pembe çiçek tomurcuğu gelişimini sürdürmektedir.',
            'Lekeli yaprakların çevresinde hafif sararma halkaları başlamıştır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Testere dişli yaprak kenarları belirgin, alt yapraklarda noktasal lezyonlar var.',
            stemCondition: 'Dikenli yeşil gövde sağlam görünüyor.',
            colorChanges: 'Koyu yeşil zemin üzerinde kahverengi benekler ve bölgesel sararma.',
            pestOrDiseaseRisk: 'Orta — Yüksek nem kaynaklı yaprak leke mantarı ihtimali gözlenmeli.',
            wateringNeed: 'Dip sulama gerekli — Yapraklar kesinlikle ıslatılmamalı.',
            sunlightStatus: 'Yetersiz — Bina gölgesinde kaldığı için yapraklar geç kuruyor.',
            growthStatus: 'Orta — Tomurcuk var ancak alt yapraklar stres altında.',
          },
          smartRecommendations: {
            watering: 'Sulamayı yalnızca sabah erken saatte doğrudan kök toprağına yapın.',
            locationChange: 'Bina gölgesinden çıkarıp hava akımı ve sabah güneşi alan tarh kenarına taşıyın.',
            soilCare: 'Dökülen lekeli yaprakları toprak yüzeyinden temizleyin.',
            pruning: 'Yoğun lekeli alt yaprakları budama makasıyla keserek bitkiden uzaklaştırın.',
            nutrientSupport: 'Potasyum açısından zengin doğal bitki besini ile direnci artırın.',
          },
          possibleCauses: [
            {
              factor: 'Fazla Sulama / Yaprak Islaklığı',
              explanation:
                'Akşam saatlerinde yaprakların üstten ıslatılması yüzeyde nem birikimine ve lekelenmeye neden olabilir.',
            },
            {
              factor: 'Işık ve Hava Sirkülasyonu Yetersizliği',
              explanation: 'A Blok gölgesinde kalan alt dallar yeterince hızlı kuruyamamaktadır.',
            },
          ],
          careRecommendations: [
            'Sulamayı yapraklara değil, doğrudan kök bölgesindeki toprağa sabah saatlerinde yapın.',
            'Yere dökülen lekeli kuru yaprakları bahçe eldiveni ile toplayıp uzaklaştırın.',
          ],
          scienceConnections: {
            photosynthesis:
              'Yaprak yüzeyindeki koyu lekeler ışığın kloroplastlara ulaşmasını engelleyerek etkin fotosentez alanını daraltır.',
            growthAndDevelopment:
              'Bitki enerjisinin bir kısmını stresle mücadeleye harcadığında çiçeklenme süresi kısalabilir.',
            waterAndMineralTransport:
              'Kökten su alımı yeterli olsa bile yaprak dokusundaki hasar suyun yaprak içi dağılımını etkiler.',
            ecosystem:
              'Nem ve sıcaklık gibi cansız (abiyotik) faktörler, Yıldızkent Ortaokulu bahçesindeki bitkilerin sağlığını doğrudan etkiler.',
          },
          healthScore: 65,
          healthScoreBreakdown: {
            leafAppearance: 58,
            colorCondition: 62,
            vitality: 72,
            drynessControl: 68,
            stressResistance: 65,
          },
          healthScoreExplanation:
            'Tomurcuk canlılığı iyi olsa da yapraklardaki lekelenmeler nedeniyle 65/100 olarak değerlendirilmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Hafta 1 başlangıç kaydı (65 puan).',
        },
      },
      {
        id: 'obs-202',
        plantId: 'plant-2',
        plantNumber: 'B-02',
        plantName: 'Yediveren Bahçe Gülü',
        scientificName: 'Rosa hybrida',
        date: '2026-09-17',
        weekNumber: 2,
        location: 'A Blok Fen Laboratuvarı Önü Gül Tarhı',
        imageUrl: roseBushImg,
        healthScore: 56,
        observerGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
        performedCareAction: '18 Eylül: Lekeli yapraklar budandı ve güneşli alana taşıma planlandı.',
        studentNote:
          'Hafta 2: Yağışlı geçen hafta sonunda lekeli yaprak sayısı arttı (56 puan). Budama ve güneşli noktaya taşıma işlemi uyguladık.',
        analysis: {
          plantName: 'Yediveren Bahçe Gülü',
          scientificName: 'Rosa hybrida',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Yağışlı hafta sonrası artan nem stresi ve alt yapraklarda kloroz.',
          advisorReport:
            'Yağışlar nedeniyle alt yapraklardaki lekelenme bu hafta biraz arttı (56 puan). Lekeli yaprakların budanması ve güneşli alana taşınması iyileşmeyi başlatacaktır.',
          visualFindings: [
            'Orta ve alt yapraklarda kahverengi lekelerin alanı genişlemiştir.',
            'Yaprak sararması bir önceki gözleme göre daha belirgindir.',
            'Tepe tomurcuğu canlılığını korumaktadır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Alt yapraklarda erken dökülme eğilimi var.',
            stemCondition: 'Gövde dik, alt boğumlarda yaprak seyrelmesi mevcut.',
            colorChanges: 'Sararma ve kahverengi benek yoğunluğunda artış.',
            pestOrDiseaseRisk: 'Orta-Yüksek — Nemli yaprakların budanması gerekiyor.',
            wateringNeed: 'Azaltılmalı — Yağış sonrası toprak zaten nemli.',
            sunlightStatus: 'Güneşli konuma taşınması önerilir.',
            growthStatus: 'Stres altında — Bakım müdahalesi şart.',
          },
          smartRecommendations: {
            watering: 'Toprak üst yüzeyi kuruyana kadar ek sulama yapmayın.',
            locationChange: 'Fen Laboratuvarı önündeki doğrudan güneş alan güney kenara taşıyın.',
            soilCare: 'Toprak yüzeyini hafifçe havalandırın.',
            pruning: 'Lekeli alt yaprakları hemen budayarak sağlıklı yaprakları koruyun.',
            nutrientSupport: 'Budama sonrası kök gelişimini destekleyen hafif kompost verin.',
          },
          possibleCauses: [
            {
              factor: 'Yüksek Nem ve Gölgeleme',
              explanation: 'Yağışlı hava ve bina gölgesi yaprak yüzeyinin kurumasını geciktirmiştir.',
            },
          ],
          careRecommendations: [
            'Öğretmen desteğiyle yoğun lekeli alt yaprakları budayın.',
            'Saksıyı/bitkiyi doğrudan güneş alan açık konuma taşıyın.',
          ],
          scienceConnections: {
            photosynthesis: 'Sararan yapraklar fotosentez kapasitesini düşürür.',
            growthAndDevelopment: 'Budama işlemi bitkinin enerjisini yeni ve sağlıklı sürgünlere yönlendirmesini sağlar.',
            waterAndMineralTransport: 'Fazla ıslak toprakta kök solunumu yavaşlar.',
            ecosystem: 'Hastalıklı yaprakların uzaklaştırılması bahçedeki diğer gülleri korur.',
          },
          healthScore: 56,
          healthScoreBreakdown: {
            leafAppearance: 50,
            colorCondition: 52,
            vitality: 64,
            drynessControl: 60,
            stressResistance: 54,
          },
          healthScoreExplanation:
            'Yaprak lekelerinin artması sebebiyle sağlık puanı 56/100 olarak hesaplanmıştır. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict:
            'Yağışlı hafta nedeniyle sağlık puanı 65’ten 56’ya geriledi (-9 puan). Budama ve yer değiştirme müdahalesi başlatıldı.',
        },
      },
      {
        id: 'obs-203',
        plantId: 'plant-2',
        plantNumber: 'B-02',
        plantName: 'Yediveren Bahçe Gülü',
        scientificName: 'Rosa hybrida',
        date: '2026-09-24',
        weekNumber: 3,
        location: 'A Blok Fen Laboratuvarı Önü Gül Tarhı (Güneşli Güney Kenarı)',
        imageUrl: roseBushImg,
        healthScore: 78,
        observerGroup: 'Yıldızkent 6-B Doğa Gözlemcileri',
        performedCareAction: '18 Eylül: Budama yapıldı. 20 Eylül: Güneşli alana taşındı.',
        studentNote:
          'Hafta 3: Lekeli yaprakları budayıp daha güneşli alana taşıdıktan sonra yeni çıkan yapraklarda hiç leke oluşmadı! Puan 56’dan 78’e çıktı.',
        analysis: {
          plantName: 'Yediveren Bahçe Gülü',
          scientificName: 'Rosa hybrida',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Budama ve güneşli konuma taşınma sonrasında hızla toparlanan, sağlıklı genç yapraklar veren gül bitkisi.',
          advisorReport:
            'Uygulanan budama ve güneşli konuma yer değiştirme işlemleri çok başarılı sonuç verdi! Bitkinin sağlık puanı bir haftada 56’dan 78’e yükseldi.',
          visualFindings: [
            'Yeni çıkan sürgün yaprakları lekesiz ve parlak yeşil renktedir.',
            'Çiçek tomurcuğu açmaya başlamış, canlı pembe taç yapraklar belirmiştir.',
            'Yaprak yüzeylerinde ıslaklık veya yeni sararma yoktur.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Genç yapraklar tamamen sağlıklı ve diri.',
            stemCondition: 'Budama yapılan boğumlardan yeni yan sürgünler patlıyor.',
            colorChanges: 'Canlı yeşil yapraklar ve parlak pembe çiçeklenme.',
            pestOrDiseaseRisk: 'Düşük — Güneşlenme ve hava akımı nem stresini bitirdi.',
            wateringNeed: 'Dengeli — Sadece sabahları kök sulaması yapılıyor.',
            sunlightStatus: 'Çok İyi — Güney tarh kenarında doğrudan güneş alıyor.',
            growthStatus: 'Hızlı Toparlanma — Yeni yaprak ve çiçek gelişimi aktif.',
          },
          smartRecommendations: {
            watering: 'Sabah saatlerinde dip sulama yöntemine devam edin.',
            locationChange: 'Yeni taşındığı güneşli konum çok ideal, burada kalmalı.',
            soilCare: 'Toprak yüzeyini temiz tutmaya devam edin.',
            pruning: 'Sadece solan çiçek başlarını zamanı geldiğinde kesin.',
            nutrientSupport: 'Çiçeklenmeyi desteklemek için 2 haftada bir organik besin verilebilir.',
          },
          possibleCauses: [
            {
              factor: 'Başarılı Budama ve Güneşli Konuma Taşıma',
              explanation: 'Hasarlı yaprakların uzaklaştırılması ve doğrudan güneş ışığı bitkiyi hızla iyileştirmiştir.',
            },
          ],
          careRecommendations: [
            'Güneşli konumu ve dip sulama düzenini koruyun.',
            'Yeni açan çiçek sayısını haftalık gözlem defterine kaydedin.',
          ],
          scienceConnections: {
            photosynthesis: 'Güneşli konuma taşınan bitkinin yeni yapraklarında fotosentez hızı maksimuma ulaşmıştır.',
            growthAndDevelopment: 'Budama sonrası yan tomurcuklar (dormant meristemler) uyanarak yeni sürgünler oluşturmuştur.',
            waterAndMineralTransport: 'Kökten alınan su ve mineraller doğrudan genç yaprak ve çiçek tomurcuğuna taşınmaktadır.',
            ecosystem: 'Açan gül çiçekleri Yıldızkent Ortaokulu bahçesindeki tozlaştırıcı böcekler için besin kaynağı oluşturur.',
          },
          healthScore: 78,
          healthScoreBreakdown: {
            leafAppearance: 78,
            colorCondition: 76,
            vitality: 82,
            drynessControl: 78,
            stressResistance: 76,
          },
          healthScoreExplanation:
            'Budama ve yer değiştirme sonrası lekesiz yeni yaprak gelişimiyle puan 56’dan 78/100’e yükselmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict:
            'Geçen haftaya göre yaprak canlılığında büyük artış gözlendi. Bitkinin genel sağlık puanı 56’dan 78’e yükseldi (+22 puan).',
        },
      },
    ],
  },
  {
    id: 'plant-3',
    plantNumber: 'B-03',
    plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
    scientificName: 'Lavandula angustifolia',
    location: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
    campusZone: 'zone-ecology-greenhouse',
    mapX: 72,
    mapY: 26,
    latestImageUrl: lavenderImg,
    latestHealthScore: 94,
    lastAnalysisDate: '2026-09-25',
    status: 'healthy',
    encyclopedia: {
      family: 'Lamiaceae (Ballıbabagiller)',
      originAndHabitat: 'Akdeniz kuşağı, güneşli ve taşlı-kireçli yamaçlar.',
      generalInfo:
        'Tıbbi lavanta, zengin uçucu yağlar içeren, kuraklığa son derece dayanıklı, herdem yeşil ve yarı çalımsı aromatik bir bitkidir. Mor çiçek başakları arılar ve kelebekler için önemli bir nektar kaynağıdır.',
      botanicalTraits: {
        leafType: 'İnce uzun (şeritsi), kenarları hafif içe kıvrık, grimsi-gümüşi yeşil aromatik yapraklar.',
        stemAndRoot: 'Dört köşeli genç sürgünler, altta odunlaşan sık dallı gövde ve derine inen kurakçıl kökler.',
        floweringSeason: 'Haziran – Eylül arası uzun saplı mor-mavi başak çiçekler.',
        maxHeight: '40 cm – 80 cm küresel küme formu.',
        sunAndSoil: 'Tam güneşli açık alan; kumlu-çakıllı, su tutmayan yüksek drenajlı toprak.',
      },
      yildizkentCareTips: [
        'B Blok Ekoloji Köşesi ve Sera yanındaki lavanta kümesi su fazlalığına karşı hassastır; toprak tamamen kurumadan ek sulama yapılmamalıdır.',
        'Kök çürümesini önlemek için kök çevresine Yıldızkent Ekoloji Kulübünün hazırladığı çakıllı kum karışımı serilmelidir.',
        'Eylül sonunda geçen çiçek saplarına hafif uç budaması yapılarak bitkinin küresel formu kış öncesinde korunmalıdır.',
      ],
      scienceDidYouKnow:
        'Lavanta yaprak ve çiçeklerindeki mikroskobik salgı tüylerinde üretilen linalool uçucu yağı, hem bitkiyi zararlı böceklerden korur hem de tozlaştırıcı bal arılarını kilometrelerce öteden kendine çeker!',
    },
    careActions: [
      {
        id: 'care-301',
        plantId: 'plant-3',
        date: '2026-09-14',
        actionType: 'soil_care',
        actionLabel: 'Çakıllı Drenaj ve Toprak Havalandırma',
        description: '14 Eylül: Toprak bakımı yapıldı. Sera yanındaki lavanta kök çevresine su tutmayı önleyen çakıllı kum karıştırıldı.',
        studentGroup: 'Yıldızkent 8-C TÜBİTAK Araştırma Ekibi',
        photoUrl: lavenderImg,
      },
      {
        id: 'care-302',
        plantId: 'plant-3',
        date: '2026-09-21',
        actionType: 'pruning',
        actionLabel: 'Geçen Çiçek Saplarının Uç Budaması',
        description: '21 Eylül: Budama yapıldı. Kuruyan eski çiçek başakları hafifçe budanarak bitkinin küresel formu korundu.',
        studentGroup: 'Yıldızkent 8-C TÜBİTAK Araştırma Ekibi',
      },
    ],
    observations: [
      {
        id: 'obs-301',
        plantId: 'plant-3',
        plantNumber: 'B-03',
        plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
        scientificName: 'Lavandula angustifolia',
        date: '2026-09-11',
        weekNumber: 1,
        location: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
        imageUrl: lavenderImg,
        healthScore: 82,
        observerGroup: 'Yıldızkent 8-C TÜBİTAK Araştırma Ekibi',
        performedCareAction: '11 Eylül: İlk polinasyon ve yaprak gözlemi yapıldı.',
        studentNote:
          'Hafta 1: B Blok Ekoloji Köşesindeki lavanta kümemiz güneşli alanda sağlıklı büyüyor. Çiçekler üzerinde bal arılarını gözlemledik.',
        analysis: {
          plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
          scientificName: 'Lavandula angustifolia',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Güneş ışığını ve toprak drenajını iyi alan, sağlıklı gelişen tıbbi lavanta bitkisi.',
          advisorReport:
            'Lavanta bitkisi oldukça sağlıklı görünüyor (82 puan). Toprak drenajının korunması ve aşırı sulamadan kaçınılması gelişimi daha da artıracaktır.',
          visualFindings: [
            'İnce uzun gümüşi-yeşil yapraklar sık ve dik durmaktadır.',
            'Mor çiçek başakları canlı ve homojen renktedir.',
            'Yapraklarda sararma veya leke belirtisi bulunmamaktadır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Dar yaprak yüzeyi su kaybını önleyen ince tüycüklerle kaplı ve sağlıklı.',
            stemCondition: 'Odunsu alt gövde ve otsu çiçek sapları güçlü.',
            colorChanges: 'Canlı gümüşi-yeşil yapraklar ve parlak mor çiçekler.',
            pestOrDiseaseRisk: 'Yok — Uçucu yağları sayesinde zararlılara doğal dirençli.',
            wateringNeed: 'Düşük — Toprak tamamen kurumadan su verilmemeli.',
            sunlightStatus: 'Mükemmel — Tam güneş alan konumda.',
            growthStatus: 'Sağlıklı — Çiçeklenme evresinde.',
          },
          smartRecommendations: {
            watering: 'Haftada en fazla 1 kez, yalnızca toprak tamamen kuruduğunda az miktarda sulayın.',
            locationChange: 'B Blok Ekoloji Köşesindeki tam güneşli yeri idealdir.',
            soilCare: 'Kök çevresinde su birikmesini önlemek için süzek toprak yapısını koruyun.',
            pruning: 'Çiçeklenme sonunda solan başakları uçtan hafifçe budayın.',
            nutrientSupport: 'Fazla gübreleme yapmayın; lavanta fakir ve kireçli toprakları sever.',
          },
          possibleCauses: [
            {
              factor: 'Uygun Güneşlenme ve Toprak Drenajı',
              explanation:
                'Lavanta tam güneş alan ve su tutmayan süzek topraklarda yüksek sağlık performansı gösterir.',
            },
          ],
          careRecommendations: [
            'Toprak tamamen kurumadan sulama yapmayın; lavanta az suyu sever.',
            'Tozlaşma yapan böcek türlerini gözlem defterine kaydedin.',
          ],
          scienceConnections: {
            photosynthesis: 'Açık alanda doğrudan güneş ışığı alan yapraklar yüksek verimle fotosentez yapar.',
            growthAndDevelopment: 'Çiçeklenme ve tohum oluşturma sağlıklı biçimde gerçekleşmektedir.',
            waterAndMineralTransport: 'Dar ve grimsi yaprak yapısı terleme ile su kaybını azaltan bir adaptasyondur.',
            ecosystem: 'Uçucu yağ kokusu ve nektarı ile arıları çekerek Yıldızkent Ortaokulu bahçesinde tozlaşmayı destekler.',
          },
          healthScore: 82,
          healthScoreBreakdown: {
            leafAppearance: 84,
            colorCondition: 82,
            vitality: 84,
            drynessControl: 80,
            stressResistance: 80,
          },
          healthScoreExplanation:
            'Yaprak ve çiçek bütünlüğü yüksek olduğundan 82/100 puan verilmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Hafta 1 başlangıç kaydı (82 puan).',
        },
      },
      {
        id: 'obs-302',
        plantId: 'plant-3',
        plantNumber: 'B-03',
        plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
        scientificName: 'Lavandula angustifolia',
        date: '2026-09-18',
        weekNumber: 2,
        location: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
        imageUrl: lavenderImg,
        healthScore: 88,
        observerGroup: 'Yıldızkent 8-C TÜBİTAK Araştırma Ekibi',
        performedCareAction: '14 Eylül: Çakıllı drenaj ve toprak bakımı yapıldı.',
        studentNote:
          'Hafta 2: Toprak drenajını güçlendirdikten sonra dip sürgünlerin canlandığını ve bitki çapının genişlediğini gördük.',
        analysis: {
          plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
          scientificName: 'Lavandula angustifolia',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Toprak havalandırması sonrası kök solunumu güçlenen ve gürleşen lavanta kümesi.',
          advisorReport:
            'Toprak drenajı bakımı sonrasında yaprak yoğunluğu arttı ve sağlık puanı 82’den 88’e yükseldi.',
          visualFindings: [
            'Simetrik ve gür büyüme gözlenmektedir.',
            'Dip kısımlardan yeni gümüşi-yeşil sürgünler çıkmaktadır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak dokusu sıkı ve aromatik.',
            stemCondition: 'Sürgünler dik ve rüzgâra dayanıklı.',
            colorChanges: 'Doğal gümüşi-yeşil ve mor tonlar korunuyor.',
            pestOrDiseaseRisk: 'Yok.',
            wateringNeed: 'Düşük.',
            sunlightStatus: 'Tam güneşli.',
            growthStatus: 'Çok İyi — Küme çapı genişliyor.',
          },
          smartRecommendations: {
            watering: 'Yağışlı günlerde ek sulama yapmayın.',
            locationChange: 'Mevcut konumu koruyun.',
            soilCare: 'Toprak drenajı mükemmel durumda.',
            pruning: 'Gelecek hafta kuruyan çiçek saplarına şekil budaması yapabilirsiniz.',
            nutrientSupport: 'Ek besin gerekmiyor.',
          },
          possibleCauses: [
            {
              factor: 'İdeal Toprak Drenajı',
              explanation: 'Köklerin su içinde kalmaması lavantanın gelişimini hızlandırmıştır.',
            },
          ],
          careRecommendations: [
            'Haftaya solan çiçek saplarını hafifçe budayın.',
          ],
          scienceConnections: {
            photosynthesis: 'Sık yaprak dokusu güneş enerjisini verimli kullanmaktadır.',
            growthAndDevelopment: 'Yan sürgün gelişimi bitkinin küresel formunu büyütmektedir.',
            waterAndMineralTransport: 'Kurakçıl adaptasyon sayesinde su dengesi korunmaktadır.',
            ecosystem: 'Biyoçeşitliliği destekleyen örnek okul bahçesi bitkisidir.',
          },
          healthScore: 88,
          healthScoreBreakdown: {
            leafAppearance: 90,
            colorCondition: 88,
            vitality: 90,
            drynessControl: 86,
            stressResistance: 86,
          },
          healthScoreExplanation: 'Sağlıklı sürgün artışı ile 88/100 puan almıştır. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Sağlık puanı 82’den 88’e yükseldi (+6 puan).',
        },
      },
      {
        id: 'obs-303',
        plantId: 'plant-3',
        plantNumber: 'B-03',
        plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
        scientificName: 'Lavandula angustifolia',
        date: '2026-09-25',
        weekNumber: 3,
        location: 'B Blok Ekoloji Köşesi & Uygulama Serası Yanı',
        imageUrl: lavenderImg,
        healthScore: 94,
        observerGroup: 'Yıldızkent 8-C TÜBİTAK Araştırma Ekibi',
        performedCareAction: '21 Eylül: Uç budaması yapıldı.',
        studentNote:
          'Hafta 3: Hafif uç budaması sonrası bitki 94 sağlık puanıyla Yıldızkent Ortaokulu bahçesinin en sağlıklı bitkisi oldu!',
        analysis: {
          plantName: 'Yıldızkent Tıbbi Lavanta Kümesi',
          scientificName: 'Lavandula angustifolia',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Çevresel koşullara tam uyum sağlamış, sıfır stres belirtisi gösteren tıbbi ve aromatik bitki.',
          advisorReport:
            'Uç budaması ve doğru sulama rejimi sayesinde bitki 94/100 puana ulaştı. Bilim fuarı sergisi için örnek referans bitkidir.',
          visualFindings: [
            'Tüm sürgünlerde simetrik ve gür büyüme gözlenmektedir.',
            'Yapraklarda veya gövdede hiçbir sararma ya da çürüme belirtisi yoktur.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak dokusu sıkı ve aromatik yağ bezleri çok canlı.',
            stemCondition: 'Budama sonrası kompakt ve güçlü gövde.',
            colorChanges: 'Canlı gümüşi-yeşil ve mor tonlar.',
            pestOrDiseaseRisk: 'Yok.',
            wateringNeed: 'Düşük — Doğal yağış yeterli.',
            sunlightStatus: 'Tam Güneşli.',
            growthStatus: 'Zirve — 94/100 sağlık performansı.',
          },
          smartRecommendations: {
            watering: 'Sonbahar boyunca doğal yağışlar yeterlidir.',
            locationChange: 'Mevcut konum korunmalı.',
            soilCare: 'Yabancı ot kontrolü dışında işlem gerekmez.',
            pruning: 'Kış dinlenmesine kadar yeni budama yapmayın.',
            nutrientSupport: 'Gerekmiyor.',
          },
          possibleCauses: [
            {
              factor: 'İdeal Ekosistem Uyumu ve Doğru Budama',
              explanation: 'B Blok Ekoloji Köşesindeki güneşli konum ve şekil budaması bitkiyi güçlendirmiştir.',
            },
          ],
          careRecommendations: [
            'Yıldızkent Ortaokulu bahçesinin diğer kurak bölümleri için örnek bitki olarak raporlayın.',
          ],
          scienceConnections: {
            photosynthesis: 'Yoğun yaprak kümeleri güneş enerjisini kimyasal bağ enerjisine dönüştürmektedir.',
            growthAndDevelopment: 'Vejetatif ve generatif gelişim dengeli biçimde ilerlemektedir.',
            waterAndMineralTransport: 'Kök sistemi topraktaki az miktardaki nemi bile yüksek verimle kullanabilmektedir.',
            ecosystem: 'Yıldızkent Ortaokulu biyoçeşitliliğini destekleyen tozlaştırıcı dostu bitkidir.',
          },
          healthScore: 94,
          healthScoreBreakdown: {
            leafAppearance: 95,
            colorCondition: 94,
            vitality: 96,
            drynessControl: 92,
            stressResistance: 93,
          },
          healthScoreExplanation:
            'Yaprak canlılığı ve sıfır stres belirtisi ile 94/100 tahmini puan almıştır. Bilimsel laboratuvar ölçümü değildir.',
          timeComparisonVerdict:
            'Bitkinin durumunda istikrarlı sağlıklı gelişim gözlenmektedir (82 -> 88 -> 94 puan).',
        },
      },
    ],
  },
  {
    id: 'plant-4',
    plantNumber: 'B-04',
    plantName: 'Doğu Çınarı Fidanı',
    scientificName: 'Platanus orientalis',
    location: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
    campusZone: 'zone-sports-corridor',
    mapX: 80,
    mapY: 70,
    latestImageUrl: sycamoreImg,
    latestHealthScore: 76,
    lastAnalysisDate: '2026-09-23',
    status: 'monitor',
    encyclopedia: {
      family: 'Platanaceae (Çınargiller)',
      originAndHabitat: 'Anadolu, Balkanlar ve Doğu Akdeniz. Dere kenarları ve geniş okul/park alanları.',
      generalInfo:
        'Doğu Çınarı, el şeklinde derin loblu geniş yapraklara sahip, hızlı büyüyen ve yüzyıllarca yaşayabilen görkemli bir gölge ağacıdır. Geniş yaprak ayası sayesinde okul bahçesindeki havayı filtreler ve toz partiküllerini tutar.',
      botanicalTraits: {
        leafType: '5-7 derin loblu (elsi damarlı), geniş yüzeyli ve kışın dökülen yeşil yapraklar.',
        stemAndRoot: 'Pul pul dökülen alacalı gövde kabuğu; geniş alana yayılan güçlü kök sistemi.',
        floweringSeason: 'İlkbaharda küre şeklinde sarkık çiçek ve meyve toplulukları oluşturur.',
        maxHeight: 'Yetişkinlikte 15 – 30 metreye ulaşabilen anıtsal ağaç.',
        sunAndSoil: 'Güneşli veya yarı gölge geniş alanlar; derin, nemli ve geçirgen alüvyal toprak.',
      },
      yildizkentCareTips: [
        'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru beton zemine yakın olduğu için öğleden sonra yansıyan ısı yaprak uçlarında kurumaya yol açabilir.',
        'Fidanın kök çanağı 50 cm çapında açık tutulmalı ve sıcak haftalarda haftada 2 kez derin kök sulaması yapılmalıdır.',
        'Sonbaharda dökülen çınar yaprakları toplanarak okulun organik kompost kutusunda ayrıştırıcılar deneyi için değerlendirilmelidir.',
      ],
      scienceDidYouKnow:
        'Geniş yapraklı bir Doğu Çınarı fidanı, sıcak bir yaz gününde köklerinden emdiği suyu ksilem borularıyla yapraklarına taşıyarak terleme (transpirasyon) yoluyla çevresindeki havayı doğal bir klima gibi 2-3 °C serinletir!',
    },
    careActions: [
      {
        id: 'care-401',
        plantId: 'plant-4',
        date: '2026-09-10',
        actionType: 'soil_care',
        actionLabel: 'Kök Çanağı Genişletme İşlemi',
        description: '10 Eylül: Toprak bakımı yapıldı. Spor sahası kenarındaki çınar fidanının kök çanağı 50 cm çapında genişletildi.',
        studentGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
        photoUrl: sycamoreImg,
      },
      {
        id: 'care-402',
        plantId: 'plant-4',
        date: '2026-09-15',
        actionType: 'watering',
        actionLabel: 'Derin Kök Sulaması',
        description: '15 Eylül: Sulama yapıldı. Beton saha ısısına karşı haftada 2 kez derin kök sulaması uygulandı.',
        studentGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
      },
      {
        id: 'care-403',
        plantId: 'plant-4',
        date: '2026-09-21',
        actionType: 'pruning',
        actionLabel: 'Kuruyan Alt Yaprakların Temizlenmesi',
        description: '21 Eylül: Budama yapıldı. Rüzgâr ve sıcaktan kenarları tamamen kuruyan 2 alt yaprak kesilerek alındı.',
        studentGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
      },
    ],
    observations: [
      {
        id: 'obs-401',
        plantId: 'plant-4',
        plantNumber: 'B-04',
        plantName: 'Doğu Çınarı Fidanı',
        scientificName: 'Platanus orientalis',
        date: '2026-09-09',
        weekNumber: 1,
        location: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
        imageUrl: sycamoreImg,
        healthScore: 62,
        observerGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
        performedCareAction: '9 Eylül: Sıcaklık stresi ve yaprak kenarı kuruma ölçümü yapıldı.',
        studentNote:
          'Hafta 1: Spor sahası betonunun yanındaki çınar fidanının yaprak uçlarında kuruma gördük. Öğle saatlerinde zemin çok ısınıyor.',
        analysis: {
          plantName: 'Doğu Çınarı Fidanı',
          scientificName: 'Platanus orientalis',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Yüksek sıcaklık ve beton zemin yansımasına bağlı yaprak kenarı kuruması (termal ve su stresi).',
          advisorReport:
            'Bu hafta geniş çınar yapraklarının uçlarında sıcaklığa bağlı kuruma görülüyor. Kök çanağının genişletilmesi ve derin sulama yapılması önerilir.',
          visualFindings: [
            'Geniş elsi yaprakların orta kısmı canlı yeşil renktedir.',
            'Yaprak uçlarında ve kenar dişlerinde 2-4 mm genişliğinde kahverengi kuruma şeridi vardır.',
            'Yaprak damarları belirgin ve sağlıklıdır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Geniş yaprak ayası sağlam, uç kısımlarda hafif gevrekleşme var.',
            stemCondition: 'Yaprak sapları ve genç dal kabuğu sağlıklı.',
            colorChanges: 'Merkezde parlak yeşil, en dış kenarlarda açık kahverengi kuruma.',
            pestOrDiseaseRisk: 'Düşük — Belirtiler abiyotik (sıcaklık/su) kaynaklı.',
            wateringNeed: 'Yüksek — Geniş yapraklar terleme ile çok su kaybediyor.',
            sunlightStatus: 'Yüksek — Beton saha yansıması ısı stresini artırıyor.',
            growthStatus: 'Orta — Kök sulaması ile desteklenmeli.',
          },
          smartRecommendations: {
            watering: 'Sıcak günlerde haftada 2 kez derinlemesine kök sulaması yapın.',
            locationChange: 'Sabit ağaç fidanı olduğu için kök çevresine malç sererek toprak ısısını düşürün.',
            soilCare: 'Fidan çanağını genişleterek suyun kök bölgesinde tutunmasını sağlayın.',
            pruning: 'Tamamen kuruyan en alt yaprakları temizleyin.',
            nutrientSupport: 'Sonbaharda potasyum içerikli organik toprak düzenleyici ekleyin.',
          },
          possibleCauses: [
            {
              factor: 'Su Eksikliği ve Yüksek Terleme',
              explanation:
                'Geniş yapraklı çınar fidanları sıcak havalarda terleme ile çok su kaybeder; su yaprak uçlarına yetişemediğinde kenar kuruması oluşur.',
            },
            {
              factor: 'Çevresel Faktörler (Beton Isı Yansıması)',
              explanation: 'Yıldızkent Spor Sahası betonundan yansıyan sıcaklık yaprak kenarlarındaki su kaybını hızlandırmaktadır.',
            },
          ],
          careRecommendations: [
            'Fidan çanağını genişleterek suyun kök bölgesinde tutunmasını sağlayın.',
            'Sıcak günlerde haftada 2 kez derinlemesine kök sulaması yapın.',
          ],
          scienceConnections: {
            photosynthesis:
              'Yaprağın yeşil kalan geniş orta bölgesi fotosenteze devam ederek ağacın besin ihtiyacını karşılar.',
            growthAndDevelopment:
              'Sonbahara yaklaşırken yaprak kenarlarındaki değişimler mevsimsel geçiş ve su dengesiyle ilişkilidir.',
            waterAndMineralTransport:
              'Su, yaprak damarları (ksilem) boyunca en son yaprak uçlarına ulaştığı için su eksikliği ilk olarak uçlarda kuruma yapar.',
            ecosystem:
              'Çınar ağaçları geniş yapraklarıyla Yıldızkent Ortaokulu spor sahası çevresinde gölge oluşturur ve toz tutar.',
          },
          healthScore: 62,
          healthScoreBreakdown: {
            leafAppearance: 60,
            colorCondition: 64,
            vitality: 66,
            drynessControl: 56,
            stressResistance: 64,
          },
          healthScoreExplanation:
            'Yaprak kenarı kurumaları nedeniyle Hafta 1 puanı 62/100 olarak verilmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Hafta 1 başlangıç kaydı (62 puan).',
        },
      },
      {
        id: 'obs-402',
        plantId: 'plant-4',
        plantNumber: 'B-04',
        plantName: 'Doğu Çınarı Fidanı',
        scientificName: 'Platanus orientalis',
        date: '2026-09-16',
        weekNumber: 2,
        location: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
        imageUrl: sycamoreImg,
        healthScore: 68,
        observerGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
        performedCareAction: '10 Eylül: Kök çanağı genişletildi. 15 Eylül: Derin sulama yapıldı.',
        studentNote:
          'Hafta 2: Kök çanağını genişletip derin sulama yaptıktan sonra yaprak kenarındaki kurumanın ilerlemesi durdu.',
        analysis: {
          plantName: 'Doğu Çınarı Fidanı',
          scientificName: 'Platanus orientalis',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Su stresi kontrol altına alınmaya başlayan genç çınar fidanı.',
          advisorReport:
            'Kök çanağı genişletme ve derin sulama sonrasında kurumanın merkeze ilerlemesi durdu. Sağlık puanı 62’den 68’e çıktı.',
          visualFindings: [
            'Yaprak kenarındaki kuruma sabit kalmıştır.',
            'Orta damar çevresi canlı yeşil rengini korumaktadır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak ayası daha diri.',
            stemCondition: 'Genç dallar sağlam.',
            colorChanges: 'Merkezi yeşil doku korundu.',
            pestOrDiseaseRisk: 'Düşük.',
            wateringNeed: 'Düzenli kök sulamasına devam edilmeli.',
            sunlightStatus: 'Açık alan.',
            growthStatus: 'Dengeleniyor.',
          },
          smartRecommendations: {
            watering: 'Haftalık derin sulamaya devam edin.',
            locationChange: 'Kök çevresi malçlaması yapılabilir.',
            soilCare: 'Toprak çanağını açık tutun.',
            pruning: 'En alttaki hasarlı 2 yaprağı gelecek hafta budayabilirsiniz.',
            nutrientSupport: 'Organik humus eklenebilir.',
          },
          possibleCauses: [
            {
              factor: 'Düzenli Su İletimi',
              explanation: 'Kök çanağının su tutması yaprak turgorunu desteklemiştir.',
            },
          ],
          careRecommendations: [
            'Haftalık gözleme devam edin.',
          ],
          scienceConnections: {
            photosynthesis: 'Yeşil yaprak dokusu besin üretimine devam etmektedir.',
            growthAndDevelopment: 'Odunsu gövde kış öncesi güçlenmektedir.',
            waterAndMineralTransport: 'Ksilem iletimi dengelenmiştir.',
            ecosystem: 'Spor sahası kenarında mikro-iklimi serinletir.',
          },
          healthScore: 68,
          healthScoreBreakdown: {
            leafAppearance: 66,
            colorCondition: 70,
            vitality: 72,
            drynessControl: 64,
            stressResistance: 68,
          },
          healthScoreExplanation: 'Kurumanın durmasıyla puan 68/100’e yükselmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Sağlık puanı 62’den 68’e yükseldi (+6 puan).',
        },
      },
      {
        id: 'obs-403',
        plantId: 'plant-4',
        plantNumber: 'B-04',
        plantName: 'Doğu Çınarı Fidanı',
        scientificName: 'Platanus orientalis',
        date: '2026-09-23',
        weekNumber: 3,
        location: 'Çok Amaçlı Spor Sahası Doğu Çınar Koridoru',
        imageUrl: sycamoreImg,
        healthScore: 76,
        observerGroup: 'Yıldızkent 5-A Genç Botanikçiler Grubu',
        performedCareAction: '21 Eylül: Kuruyan alt yapraklar budandı.',
        studentNote:
          'Hafta 3: Kuruyan 2 alt yaprağı budadık ve düzenli sulamayı sürdürdük. Tepe sürgününden yeni ve sağlıklı bir yaprak açtı (76 puan).',
        analysis: {
          plantName: 'Doğu Çınarı Fidanı',
          scientificName: 'Platanus orientalis',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Su dengesi korunan ve yeni uç yaprak geliştiren sağlıklı genç çınar fidanı.',
          advisorReport:
            '3 haftalık kök bakımı, sulama ve kuru yaprak budaması ile çınar fidanının sağlık puanı 62’den 76’ya yükseldi.',
          visualFindings: [
            'Tepe sürgününde tamamen sağlıklı yeni yaprak çıkışı gözlenmiştir.',
            'Yaprak damarları ve orta doku parlak yeşil rengini korumaktadır.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak esnekliği iyi, yeni yırtılma veya kuruma yok.',
            stemCondition: 'Sürgün dalları sağlam.',
            colorChanges: 'Orta ve üst kısımda sağlıklı yeşil ton korunmaktadır.',
            pestOrDiseaseRisk: 'Yok.',
            wateringNeed: 'Normal sonbahar sulaması.',
            sunlightStatus: 'İyi.',
            growthStatus: 'İyileşiyor (+14 puan toplam gelişim).',
          },
          smartRecommendations: {
            watering: 'Sonbahar yağışlarıyla birlikte sulama sıklığını haftada 1’e düşürün.',
            locationChange: 'Mevcut kök çanağı koruması yeterli.',
            soilCare: 'Dökülen yaprakların toprağa karışımını gözlemleyin.',
            pruning: 'Ek budama gerekmiyor.',
            nutrientSupport: 'İlkbahar başında organik kompost verilebilir.',
          },
          possibleCauses: [
            {
              factor: 'Kök Çanağı Bakımı ve Düzenli Sulama',
              explanation: 'Suyun kök bölgesinde tutulması yeni yaprak gelişimini sağlamıştır.',
            },
          ],
          careRecommendations: [
            'Sonbahar boyunca haftalık gözleme devam edin.',
            'Dökülen yaprakların toprağa karışım sürecini (ayrıştırıcılar) fen dersinde inceleyin.',
          ],
          scienceConnections: {
            photosynthesis:
              'Sağlıklı yeşil yaprak dokusu güneş ışığını soğurarak kış öncesi köklerde besin depolanmasını sağlar.',
            growthAndDevelopment:
              'Çok yıllık odunsu bitkiler sonbaharda gövde dokularını güçlendirerek kışa hazırlanır.',
            waterAndMineralTransport:
              'Kök çanağının genişletilmesi yağmur suyunun toprağa sızmasını ve köklere ulaşmasını kolaylaştırmıştır.',
            ecosystem:
              'Yıldızkent Ortaokulu bahçesindeki çınar ağaçları kuşlar için mikro-habitat oluşturur.',
          },
          healthScore: 76,
          healthScoreBreakdown: {
            leafAppearance: 75,
            colorCondition: 76,
            vitality: 80,
            drynessControl: 74,
            stressResistance: 75,
          },
          healthScoreExplanation:
            'Yeni uç yaprak çıkışı ve kurumanın durmasıyla 76/100 olarak değerlendirilmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict:
            'Geçen haftaya göre yaprak canlılığında artış gözlendi. Bitkinin genel sağlık puanı 68’den 76’ya yükseldi (+8 puan).',
        },
      },
    ],
  },
  {
    id: 'plant-5',
    plantNumber: 'B-05',
    plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
    scientificName: 'Tilia tomentosa',
    location: 'Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru',
    campusZone: 'zone-library-west',
    mapX: 22,
    mapY: 34,
    latestImageUrl: oliveTreeImg,
    latestHealthScore: 86,
    lastAnalysisDate: '2026-09-25',
    status: 'healthy',
    encyclopedia: {
      family: 'Malvaceae / Tilioideae (Ihlamurgiller)',
      originAndHabitat: 'Anadolu ve Güneydoğu Avrupa. Ilıman, rüzgârdan korunaklı ve nemli bahçe alanları.',
      generalInfo:
        'Gümüşi Ihlamur, kalp şeklindeki yapraklarının alt yüzeyi gümüş renginde yıldızsı tüylerle kaplı olan, yaz başında hoş kokulu sarımsı çiçekler açan değerli bir ağaç türüdür. Altındaki biberiye çalılarıyla birlikte okul bahçesinde çok katmanlı bir mikro-ekosistem oluşturur.',
      botanicalTraits: {
        leafType: 'Kalp şeklinde (kordat), kenarları dişli, üstü koyu yeşil altı gümüşi beyaz tüylü yapraklar.',
        stemAndRoot: 'Düzgün gri-kahverengi gövde; toprağı sıkıca kavrayan derin yan kökler.',
        floweringSeason: 'Haziran – Temmuz aylarında karakteristik dilcikli (brakteli) kokulu çiçekler.',
        maxHeight: 'Okul bahçesinde 6 – 15 metreye kadar boylanabilir.',
        sunAndSoil: 'Güneşli veya yarı gölge, sert rüzgârdan korunaklı konum; humuslu ve nemli toprak.',
      },
      yildizkentCareTips: [
        'Kütüphane & Bilişim Kanadı Kuzeybatı Koridorunda oluşan rüzgâr akımına karşı genç fidanlar bina duvarının siper yaptığı güneybatı köşesinde desteklenmelidir.',
        'Yaprakların klorofil canlılığını korumak için ilkbahar ve sonbahar başında okul kompost kutusundan elde edilen organik humus toprağa karıştırılmalıdır.',
        'Toprak yüzeyi kuru yaprak malçı ile örtülerek hem kök nemi korunmalı hem de toprak solucanlarının etkinliği gözlemlenmelidir.',
      ],
      scienceDidYouKnow:
        'Ihlamur çiçeklerinin yanında bulunan kanat benzeri ince yaprakçık (brakte), olgunlaşan tohumların rüzgârda tıpkı bir helikopter pervanesi gibi dönerek ana ağaçtan uzaklara taşınmasını sağlayan harika bir adaptasyondur!',
    },
    careActions: [
      {
        id: 'care-501',
        plantId: 'plant-5',
        date: '2026-09-13',
        actionType: 'location_change',
        actionLabel: 'Rüzgâr Koridorundan Güneşli Siper Алanına Taşıma',
        description: '13 Eylül: Yer değiştirme yapıldı. Kütüphane girişindeki rüzgâr koridorunda bulunan saksılı biberiye ve ıhlamur destek fidanı, bina siperindeki güneşli güneybatı köşesine alındı.',
        studentGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
      },
      {
        id: 'care-502',
        plantId: 'plant-5',
        date: '2026-09-17',
        actionType: 'nutrient_support',
        actionLabel: 'Organik Kompost ve Mineral Desteği',
        description: '17 Eylül: Besin desteği verildi. Okul bahçesi kompost kutusundan elde edilen doğal humus toprağa karıştırıldı.',
        studentGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
      },
      {
        id: 'care-503',
        plantId: 'plant-5',
        date: '2026-09-22',
        actionType: 'watering',
        actionLabel: 'Sabah Nem Dengeleme Sulaması',
        description: '22 Eylül: Sulama yapıldı. Toprak nemi ölçülerek 3 litre dinlendirilmiş su verildi.',
        studentGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
      },
    ],
    observations: [
      {
        id: 'obs-501',
        plantId: 'plant-5',
        plantNumber: 'B-05',
        plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
        scientificName: 'Tilia tomentosa',
        date: '2026-09-11',
        weekNumber: 1,
        location: 'Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru',
        imageUrl: oliveTreeImg,
        healthScore: 70,
        observerGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
        performedCareAction: '11 Eylül: Kuzeybatı rüzgâr etkisi ve yaprak duruşu incelendi.',
        studentNote:
          'Hafta 1: Kütüphane koridoru önündeki fidanlarımızda serin rüzgâr nedeniyle hafif yaprak büzülmesi gördük (70 puan).',
        analysis: {
          plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
          scientificName: 'Tilia tomentosa',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Rüzgâr koridorunda kalmaya bağlı hafif terleme stresi ve mineral ihtiyacı.',
          advisorReport:
            'Kütüphane kanadı önündeki rüzgâr akımı yapraklarda su kaybını artırıyor. Daha siperli ve güneşli köşeye alınması ve organik kompost desteği önerilir.',
          visualFindings: [
            'Yaprakların alt yüzeyi gümüşi tüylü yapısını korumaktadır.',
            'Rüzgâr alan yan dallarda hafif yaprak kıvrılması mevcuttur.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yaprak bütünlüğü tam, hafif rüzgâr yorgunluğu var.',
            stemCondition: 'Gövde dik ve sağlam.',
            colorChanges: 'Açık yeşil tonlar hakim.',
            pestOrDiseaseRisk: 'Düşük.',
            wateringNeed: 'Orta — Haftada 2 kez düzenli sulama.',
            sunlightStatus: 'Orta — Öğleden sonra güneş alıyor.',
            growthStatus: 'Normal — Rüzgâr siperi ile hızlanabilir.',
          },
          smartRecommendations: {
            watering: 'Rüzgârlı günlerde toprak nemini kontrol ederek sulama yapın.',
            locationChange: 'Kütüphane duvarının rüzgâr kesen güneşli güneybatı köşesine taşıyın.',
            soilCare: 'Toprak yüzeyini organik malç ile örtün.',
            pruning: 'Budama gerekmiyor.',
            nutrientSupport: 'Yaprak rengini koyulaştırmak için organik kompost ekleyin.',
          },
          possibleCauses: [
            {
              factor: 'Rüzgâr Koridoru Etkisi',
              explanation: 'Kuzeybatı koridorundaki hava akımı yaprak yüzeyinden su kaybını artırmaktadır.',
            },
          ],
          careRecommendations: [
            'Fidan çevresini rüzgârdan koruyacak konuma alın ve kompost desteği verin.',
          ],
          scienceConnections: {
            photosynthesis: 'Klorofil yoğunluğunun organik besinle desteklenmesi fotosentez verimini artırır.',
            growthAndDevelopment: 'Rüzgâr stresinin azalması uç büyümesini hızlandırır.',
            waterAndMineralTransport: 'Kompost takviyesi köklerin mineral emilimini güçlendirir.',
            ecosystem: 'Ihlamur ve biberiye Yıldızkent Ortaokulu kütüphane bahçesinde hoş koku ve biyoçeşitlilik sağlar.',
          },
          healthScore: 70,
          healthScoreBreakdown: {
            leafAppearance: 70,
            colorCondition: 68,
            vitality: 72,
            drynessControl: 70,
            stressResistance: 70,
          },
          healthScoreExplanation: 'Rüzgâr etkisiyle hafif stres görüldüğünden 70/100 verilmiştir. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Hafta 1 başlangıç kaydı (70 puan).',
        },
      },
      {
        id: 'obs-502',
        plantId: 'plant-5',
        plantNumber: 'B-05',
        plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
        scientificName: 'Tilia tomentosa',
        date: '2026-09-18',
        weekNumber: 2,
        location: 'Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru',
        imageUrl: oliveTreeImg,
        healthScore: 79,
        observerGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
        performedCareAction: '13 Eylül: Rüzgâr siperine yer değiştirildi. 17 Eylül: Organik kompost verildi.',
        studentNote:
          'Hafta 2: Bina siperine taşıma ve organik kompost sonrasında yapraklar koyu yeşil renge döndü (79 puan).',
        analysis: {
          plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
          scientificName: 'Tilia tomentosa',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Rüzgâr stresinden kurtulan ve mineral desteğiyle canlanan sağlıklı yaprak dokusu.',
          advisorReport:
            'Yer değiştirme ve kompost besin desteği sonrasında sağlık puanı 70’ten 79’a yükseldi.',
          visualFindings: [
            'Yaprak kıvrılması tamamen sona ermiştir.',
            'Yaprak rengi koyu ve parlak yeşile dönmüştür.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Yapraklar geniş ve diri.',
            stemCondition: 'Sürgünler güçlü.',
            colorChanges: 'Klorofil artışı belirgin.',
            pestOrDiseaseRisk: 'Yok.',
            wateringNeed: 'Dengeli.',
            sunlightStatus: 'İyi.',
            growthStatus: 'Hızlandı.',
          },
          smartRecommendations: {
            watering: 'Haftalık nem kontrolüyle sulamaya devam edin.',
            locationChange: 'Yeni rüzgâr siperli konum korunmalı.',
            soilCare: 'Toprak nemi dengeli.',
            pruning: 'Gerekmiyor.',
            nutrientSupport: 'Kompost etkisi devam ediyor.',
          },
          possibleCauses: [
            {
              factor: 'Siperli Konum ve Organik Besin',
              explanation: 'Rüzgârın kesilmesi ve organik kompost bitkiyi canlandırmıştır.',
            },
          ],
          careRecommendations: ['Mevcut bakım düzenini sürdürün.'],
          scienceConnections: {
            photosynthesis: 'Koyu yeşil yapraklar ışığı yüksek verimle soğurur.',
            growthAndDevelopment: 'Yeni tomurcuk gelişimi gözlenmektedir.',
            waterAndMineralTransport: 'Terleme hızı dengelenmiştir.',
            ecosystem: 'Okul bahçesi organik atıklarının kompost olarak geri dönüşümü döngüsel ekosistemi destekler.',
          },
          healthScore: 79,
          healthScoreBreakdown: {
            leafAppearance: 80,
            colorCondition: 78,
            vitality: 80,
            drynessControl: 78,
            stressResistance: 79,
          },
          healthScoreExplanation: 'Canlanan yaprak dokusuyla 79/100 puan almıştır. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Sağlık puanı 70’ten 79’a yükseldi (+9 puan).',
        },
      },
      {
        id: 'obs-503',
        plantId: 'plant-5',
        plantNumber: 'B-05',
        plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
        scientificName: 'Tilia tomentosa',
        date: '2026-09-25',
        weekNumber: 3,
        location: 'Kütüphane & Bilişim Kanadı Kuzeybatı Koridoru',
        imageUrl: oliveTreeImg,
        healthScore: 86,
        observerGroup: 'Yıldızkent 7-B Yeşil Kampüs Takımı',
        performedCareAction: '22 Eylül: Sabah nem dengeleme sulaması yapıldı.',
        studentNote:
          'Hafta 3: Kütüphane bahçesindeki ıhlamur ve biberiye parselimiz 86 puana ulaşarak sağlıklı yeşil statüye geçti.',
        analysis: {
          plantName: 'Gümüşi Ihlamur ve Biberiye Parseli',
          scientificName: 'Tilia tomentosa',
          similarityStatement:
            'Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: Güçlü yaprak ve sürgün gelişimi gösteren sağlıklı okul bahçesi fidanı.',
          advisorReport:
            '3 haftalık düzenli bakım takvimi uygulamalarıyla bitki 70 puandan 86 puana yükseldi.',
          visualFindings: [
            'Yaprak yüzeyi pürüzsüz, parlak ve yüksek canlılığa sahiptir.',
            'Yeni uç sürgünler sağlıklı gelişmektedir.',
          ],
          leafStemColorAnalysis: {
            leafCondition: 'Tamamen sağlıklı.',
            stemCondition: 'Güçlü ve esnek.',
            colorChanges: 'Homojen koyu yeşil.',
            pestOrDiseaseRisk: 'Yok.',
            wateringNeed: 'Haftada 1-2 kez.',
            sunlightStatus: 'İdeal.',
            growthStatus: 'Çok İyi (86/100).',
          },
          smartRecommendations: {
            watering: 'Haftalık düzenli sulamayı koruyun.',
            locationChange: 'Mevcut yeri çok uygun.',
            soilCare: 'Sonbahar yaprak malçı eklenebilir.',
            pruning: 'Gerekmiyor.',
            nutrientSupport: 'İlkbahara kadar ek besin gerekmez.',
          },
          possibleCauses: [
            {
              factor: 'Düzenli Bakım Takvimi Uygulaması',
              explanation: 'Yer değiştirme, besin desteği ve düzenli sulama bitkiyi tam sağlığına kavuşturmuştur.',
            },
          ],
          careRecommendations: ['Haftalık fotoğraf kaydına devam edin.'],
          scienceConnections: {
            photosynthesis: 'Optimum klorofil düzeyiyle yüksek fotosentez hızı.',
            growthAndDevelopment: 'Sağlıklı vejetatif büyüme.',
            waterAndMineralTransport: 'Dengeli ksilem ve floem iletimi.',
            ecosystem: 'Yıldızkent Ortaokulu kütüphane dinlenme alanına gölge ve oksijen sağlar.',
          },
          healthScore: 86,
          healthScoreBreakdown: {
            leafAppearance: 86,
            colorCondition: 86,
            vitality: 88,
            drynessControl: 85,
            stressResistance: 85,
          },
          healthScoreExplanation: 'Sağlıklı yaprak ve sürgün yapısıyla 86/100 puan almıştır. Laboratuvar ölçümü değildir.',
          timeComparisonVerdict: 'Sağlık puanı 3 haftada 70’ten 86’ya yükseldi (+16 puan).',
        },
      },
    ],
  },
];
