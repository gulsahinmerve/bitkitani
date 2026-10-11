import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      plantContext,
      previousObservations,
      appliedCareDescription,
    } = req.body || {};

    if (!imageBase64) {
      res.status(400).json({ error: 'Lütfen analiz için bir bitki fotoğrafı yükleyin.' });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const historyPrompt =
      Array.isArray(previousObservations) && previousObservations.length > 0
        ? `\nBu bitkinin Yıldızkent Ortaokulu bahçesindeki önceki haftalık gözlem kayıtları şunlardır:\n${previousObservations
            .map(
              (obs: { date: string; healthScore: number; summary: string; performedCareAction?: string }, idx: number) =>
                `${idx + 1}. Hafta (${obs.date}) - Sağlık Puanı: ${obs.healthScore}/100, Uygulanan Bakım: ${obs.performedCareAction || 'Belirtilmedi'}, Özet: ${obs.summary}`
            )
            .join('\n')}\nÖğrencinin geçen haftadan bu yana uyguladığı bakım işlemi: "${appliedCareDescription || 'Düzenli sulama ve bakım takibi yapıldı.'}".\nLütfen yeni yüklenen fotoğrafı önceki haftanın fotoğraf ve verileriyle karşılaştırarak:\n1) Öğrencinin yaptığı bakım uygulamasının doğru/etkili olup olmadığını (careVerificationReport içinde) değerlendir.\n2) Zaman içindeki değişimi (+ veya - puan ve yaprak/canlılık farkı olarak) analiz et.`
        : '';

    const contextNote = plantContext
      ? `\nYıldızkent Ortaokulu öğrencisinin belirttiği ek bilgi / bahçe konumu: ${plantContext}`
      : '';

    const promptText = `Sen Yıldızkent Ortaokulu TÜBİTAK 4006-B Bilim Fuarı kapsamında kullanılan "Yapay Zekâ Destekli Okul Bahçesi Bitki Sağlığı İzleme ve Bitki Bakım Danışmanı Sistemi"nin bilimsel danışmanısın.
Yüklenen fotoğrafı Yıldızkent Ortaokulu (5, 6, 7 ve 8. sınıf) Fen Bilimleri seviyesine uygun, anlaşılır, bilimsel ve eğitici bir dille Türkçe olarak analiz et.

ÖNEMLİ KURALLAR:
1. İlk olarak fotoğraftaki bitkinin hangi bitki olduğunu (plantName ve scientificName) ve tahmin güven oranını (identificationConfidence: 75-99 arası) belirle.
2. Kesin hastalık teşhisi YAPMA. Değerlendirmeni mutlaka "Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: ..." kalıbıyla bilimsel ve dikkatli şekilde ifade et.
3. Yapraklarda hasar, sararma, kuruma, lekelenme veya zararlı/hastalık belirtisi olup olmadığını (leafDamageReport içinde) detaylıca tespit et ve hemen uygulanabilecek öğrenci önerisi sun.
4. Eğer önceki hafta verisi varsa, öğrencinin yaptığı bakım uygulamasının (sulama, budama, konum değişimi vb.) doğru sonuç verip vermediğini (careVerificationReport içinde) değerlendir ve 1 hafta sonraki fotoğraf kontrolü için hedef belirle.
5. Her fotoğraf yüklendiğinde şu özellikleri değerlendir:
   - Bitkinin genel sağlık durumu
   - Yaprak rengi ve canlılığı
   - Sararma, solma, kuruma belirtileri
   - Hastalık veya zararlı ihtimali (gözleme dayalı olasılık olarak)
   - Sulama ihtiyacı tahmini
   - Işık/güneş alma durumu
   - Genel gelişim durumu
6. Analiz sonucunda kullanıcıya anlaşılır bir haftalık danışman raporu (advisorReport) sun.
7. Akıllı Öneri Sistemi (smartRecommendations) kapsamında 5 başlıkta (Sulama, Konum, Toprak, Budama, Besin) gözlemlere dayalı tavsiye sun.
8. Analizi ortaokul Fen Bilimleri müfredatındaki 4 temel konuyla ilişkilendir: Fotosentez, Bitkilerde Büyüme ve Gelişme, Su ve Mineral Taşınması, Ekosistem.
9. 0 ile 100 arasında tahmini bir "Bitki Sağlık Puanı" ver. Puanın nedenini açıkla ve bunun bir bilimsel laboratuvar ölçümü olmadığını belirt.${contextNote}${historyPrompt}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plantName: {
              type: Type.STRING,
              description: 'Tahmin edilen bitkinin Türkçe adı (ör. Genç Zeytin Ağacı, Yediveren Bahçe Gülü, Tıbbi Lavanta, Doğu Çınarı, Gümüşi Ihlamur).',
            },
            scientificName: {
              type: Type.STRING,
              description: 'Tahmin edilen bitkinin Latince bilimsel adı (ör. Olea europaea).',
            },
            identificationConfidence: {
              type: Type.INTEGER,
              description: 'Bitki türü tahmin güven oranı (75-99 arası tam sayı).',
            },
            similarityStatement: {
              type: Type.STRING,
              description:
                '"Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: ..." cümlesiyle başlayan dikkatli, bilimsel ön değerlendirme özeti.',
            },
            advisorReport: {
              type: Type.STRING,
              description:
                'Öğrenciye yönelik anlaşılır haftalık bitki bakım danışmanı raporu.',
            },
            leafDamageReport: {
              type: Type.OBJECT,
              properties: {
                hasDamage: {
                  type: Type.BOOLEAN,
                  description: 'Yapraklarda herhangi bir sararma, kuruma, leke veya hasar var mı?',
                },
                damageSeverity: {
                  type: Type.STRING,
                  description: '"Yok / Sağlıklı", "Hafif", "Orta" veya "Yoğun" değerlerinden biri.',
                },
                detectedIssues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Yapraklarda tespit edilen görsel hasar veya stres belirtileri listesi.',
                },
                diseaseOrPestSimilarity: {
                  type: Type.STRING,
                  description: 'Kesin hastalık teşhisi koymadan, yaprak hasarının hangi çevresel veya biyolojik durumlarla benzerlik gösterdiği.',
                },
                immediateActionPlan: {
                  type: Type.STRING,
                  description: 'Yaprak hasarını gidermek veya sağlığı korumak için öğrencinin hemen uygulayacağı net eylem önerisi.',
                },
              },
              required: [
                'hasDamage',
                'damageSeverity',
                'detectedIssues',
                'diseaseOrPestSimilarity',
                'immediateActionPlan',
              ],
            },
            careVerificationReport: {
              type: Type.OBJECT,
              properties: {
                isCareEffective: {
                  type: Type.BOOLEAN,
                  description: 'Uygulanan bakım veya mevcut gelişim olumlu mu?',
                },
                verificationSummary: {
                  type: Type.STRING,
                  description: 'Öğrencinin yaptığı bakım uygulamasının doğru olup olmadığının ve bitkiye etkisinin değerlendirmesi.',
                },
                observedImprovementDetails: {
                  type: Type.STRING,
                  description: 'Önceki duruma göre yapraklarda ve gövdede gözlenen somut iyileşme veya dikkat edilmesi gereken nokta.',
                },
                nextWeekGoal: {
                  type: Type.STRING,
                  description: '1 hafta sonra çekilecek yeni fotoğrafta kontrol edilecek bilimsel hedef.',
                },
              },
              required: [
                'isCareEffective',
                'verificationSummary',
                'observedImprovementDetails',
                'nextWeekGoal',
              ],
            },
            visualFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                'Görsel gözlem bulguları maddeleri (yapraklarda sararma, solma, lekelenme, kuruma, canlılık, gövde durumu).',
            },
            leafStemColorAnalysis: {
              type: Type.OBJECT,
              properties: {
                leafCondition: {
                  type: Type.STRING,
                  description: 'Yaprak rengi, canlılığı, sararma/solma/kuruma durumu.',
                },
                stemCondition: {
                  type: Type.STRING,
                  description: 'Gövde ve sürgün yapısı hakkında gözlem.',
                },
                colorChanges: {
                  type: Type.STRING,
                  description: 'Klorofil rengi, sararma veya kahverengileşme durumu.',
                },
                pestOrDiseaseRisk: {
                  type: Type.STRING,
                  description: 'Gözleme dayalı hastalık veya zararlı ihtimali değerlendirmesi.',
                },
                wateringNeed: {
                  type: Type.STRING,
                  description: 'Sulama ihtiyacı tahmini.',
                },
                sunlightStatus: {
                  type: Type.STRING,
                  description: 'Işık ve güneş alma durumu değerlendirmesi.',
                },
                growthStatus: {
                  type: Type.STRING,
                  description: 'Genel gelişim ve büyüme durumu.',
                },
              },
              required: [
                'leafCondition',
                'stemCondition',
                'colorChanges',
                'pestOrDiseaseRisk',
                'wateringNeed',
                'sunlightStatus',
                'growthStatus',
              ],
            },
            smartRecommendations: {
              type: Type.OBJECT,
              properties: {
                watering: {
                  type: Type.STRING,
                  description: 'Gözlemlere dayalı sulama tavsiyesi.',
                },
                locationChange: {
                  type: Type.STRING,
                  description: 'Gözlemlere dayalı konum/ışık değiştirme tavsiyesi.',
                },
                soilCare: {
                  type: Type.STRING,
                  description: 'Gözlemlere dayalı toprak bakımı ve havalandırma tavsiyesi.',
                },
                pruning: {
                  type: Type.STRING,
                  description: 'Gözlemlere dayalı kuru/lekeli yaprak uzaklaştırma ve budama tavsiyesi.',
                },
                nutrientSupport: {
                  type: Type.STRING,
                  description: 'Gözlemlere dayalı organik/mineral besin desteği tavsiyesi.',
                },
              },
              required: [
                'watering',
                'locationChange',
                'soilCare',
                'pruning',
                'nutrientSupport',
              ],
            },
            possibleCauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: {
                    type: Type.STRING,
                    description: 'Olası neden başlığı (ör. Su Eksikliği, Işık Yetersizliği, Mineral Eksikliği, Çevresel Faktörler).',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Bu nedenin bitkideki belirtilerle nasıl ilişkili olduğunun öğrenci seviyesinde açıklaması.',
                  },
                },
                required: ['factor', 'explanation'],
              },
            },
            careRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Öğrencilerin Yıldızkent Ortaokulu bahçesinde uygulayabileceği 4-5 maddelik somut bakım ve gözlem önerisi.',
            },
            scienceConnections: {
              type: Type.OBJECT,
              properties: {
                photosynthesis: {
                  type: Type.STRING,
                  description: 'Gözlemlenen yaprak ve klorofil durumunun fotosentez hızı ve besin üretimi ile ilişkisi.',
                },
                growthAndDevelopment: {
                  type: Type.STRING,
                  description: 'Bitkilerde büyüme, tomurcuklanma ve gelişme süreçleriyle bağlantısı.',
                },
                waterAndMineralTransport: {
                  type: Type.STRING,
                  description: 'Köklerden yapraklara su ve mineral taşınması (iletim demetleri) ile ilişkisi.',
                },
                ecosystem: {
                  type: Type.STRING,
                  description: 'Yıldızkent Ortaokulu bahçesi ekosistemi, toprak sağlığı ve biyoçeşitlilik açısından önemi.',
                },
              },
              required: [
                'photosynthesis',
                'growthAndDevelopment',
                'waterAndMineralTransport',
                'ecosystem',
              ],
            },
            healthScore: {
              type: Type.INTEGER,
              description: '0 ile 100 arasında tahmini Bitki Sağlık Puanı.',
            },
            healthScoreBreakdown: {
              type: Type.OBJECT,
              properties: {
                leafAppearance: {
                  type: Type.INTEGER,
                  description: 'Yaprak canlılığı ve görünümü puanı (0-100).',
                },
                colorCondition: {
                  type: Type.INTEGER,
                  description: 'Renk durumu puanı (0-100).',
                },
                vitality: {
                  type: Type.INTEGER,
                  description: 'Genel canlılık puanı (0-100).',
                },
                drynessControl: {
                  type: Type.INTEGER,
                  description: 'Kuruma belirtileri olmaması / nem dengesi puanı (0-100).',
                },
                stressResistance: {
                  type: Type.INTEGER,
                  description: 'Büyüme durumu ve çevresel stres direnci puanı (0-100).',
                },
              },
              required: [
                'leafAppearance',
                'colorCondition',
                'vitality',
                'drynessControl',
                'stressResistance',
              ],
            },
            healthScoreExplanation: {
              type: Type.STRING,
              description:
                'Sağlık puanının neden bu değerde olduğunun açıklaması ve bunun bilimsel laboratuvar ölçümü olmadığının vurgusu.',
            },
            timeComparisonVerdict: {
              type: Type.STRING,
              description:
                '"Geçen haftaya göre yaprak canlılığında artış gözlendi." gibi öğrenci seviyesinde haftalık karşılaştırma yorumu.',
            },
          },
          required: [
            'plantName',
            'scientificName',
            'identificationConfidence',
            'similarityStatement',
            'advisorReport',
            'leafDamageReport',
            'careVerificationReport',
            'visualFindings',
            'leafStemColorAnalysis',
            'smartRecommendations',
            'possibleCauses',
            'careRecommendations',
            'scienceConnections',
            'healthScore',
            'healthScoreBreakdown',
            'healthScoreExplanation',
            'timeComparisonVerdict',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Yapay zekâ modelinden yanıt alınamadı.');
    }

    const parsed = JSON.parse(rawText.trim());
    res.status(200).json(parsed);
  } catch (error: unknown) {
    console.error('Bitki analizi hatası:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Bitki analizi sırasında beklenmeyen bir hata oluştu.';
    res.status(500).json({ error: message });
  }
}
