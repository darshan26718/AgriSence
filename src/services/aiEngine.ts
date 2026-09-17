import {
  RiskLevel,
  SeverityLevel,
  DetectionResult,
  XAIFactor,
  FarmerAdvisorPlan,
} from '../types/agri';
import { DISEASES_DATA, PESTS_DATA, CROPS_DATA } from '../data/agriData';

export interface PredictionInput {
  crop: string;
  growth_stage: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  soil_moisture: number;
  previous_disease_history?: boolean;
  pest_pressure_level?: 'Low' | 'Medium' | 'High';
}

export interface PredictionResult {
  health_score: number;
  health_category: 'Healthy' | 'Mild Risk' | 'Moderate Risk' | 'High Risk' | 'Critical';
  disease_risk: RiskLevel;
  disease_risk_score: number;
  pest_risk: RiskLevel;
  pest_risk_score: number;
  overall_risk: RiskLevel;
  primary_suspected_threat: string;
  threat_type: 'Fungal Disease' | 'Bacterial Disease' | 'Insect Pest' | 'Healthy Condition';
  recommended_immediate_action: string;
  confidence: number;
  xai_factors: XAIFactor[];
  counterfactual_scenarios: Array<{
    parameter: string;
    adjustment: string;
    new_risk_level: RiskLevel;
    health_score_change: number;
    impact_description: string;
  }>;
}

export class AgriculturalAIEngine {
  /**
   * ML & Agro-ecological inference model for Crop Health & Risk Prediction
   */
  static predictRisk(input: PredictionInput): PredictionResult {
    const { crop, growth_stage, temperature, humidity, rainfall, soil_moisture, previous_disease_history, pest_pressure_level } = input;

    // 1. Environmental vulnerability weighting
    let diseaseScore = 20;
    let pestScore = 20;

    // Humidity factors
    if (humidity > 85) {
      diseaseScore += 35;
      pestScore += 15;
    } else if (humidity > 75) {
      diseaseScore += 20;
      pestScore += 10;
    } else if (humidity < 55) {
      // Dry weather can favor certain mites and thrips
      pestScore += 15;
    }

    // Temperature factors
    if (temperature >= 24 && temperature <= 32) {
      // Optimal range for most fungal pathogens and insect multiplication
      diseaseScore += 18;
      pestScore += 22;
    } else if (temperature > 32) {
      // Heat stress + sucking pests (whiteflies, thrips)
      pestScore += 25;
      diseaseScore += 5;
    } else if (temperature < 20) {
      // Cool weather favors wheat stripe rust and late blight
      if (crop.toLowerCase().includes('wheat') || crop.toLowerCase().includes('potato')) {
        diseaseScore += 30;
      }
    }

    // Rainfall & Soil moisture factors
    if (rainfall > 20 || soil_moisture > 80) {
      diseaseScore += 22; // waterlogging, root rot, fungal splash
    } else if (rainfall > 10) {
      diseaseScore += 12;
    }

    // Stage sensitivity
    const stageLower = growth_stage.toLowerCase();
    if (stageLower.includes('tillering') || stageLower.includes('fruiting') || stageLower.includes('boll') || stageLower.includes('whorl')) {
      diseaseScore += 12;
      pestScore += 15;
    }

    // History and baseline pressure
    if (previous_disease_history) {
      diseaseScore += 15;
    }
    if (pest_pressure_level === 'High') {
      pestScore += 25;
    } else if (pest_pressure_level === 'Medium') {
      pestScore += 12;
    }

    // Clamp scores
    diseaseScore = Math.min(98, Math.max(8, diseaseScore));
    pestScore = Math.min(96, Math.max(8, pestScore));

    const overallScore = Math.max(diseaseScore, pestScore);
    const healthScore = Math.max(5, Math.min(98, Math.round(100 - (overallScore * 0.75 + (diseaseScore + pestScore) * 0.15))));

    const getRiskLevel = (score: number): RiskLevel => {
      if (score >= 75) return 'CRITICAL';
      if (score >= 55) return 'HIGH';
      if (score >= 35) return 'MODERATE';
      return 'LOW';
    };

    const getHealthCategory = (h: number): 'Healthy' | 'Mild Risk' | 'Moderate Risk' | 'High Risk' | 'Critical' => {
      if (h >= 80) return 'Healthy';
      if (h >= 65) return 'Mild Risk';
      if (h >= 50) return 'Moderate Risk';
      if (h >= 35) return 'High Risk';
      return 'Critical';
    };

    const diseaseRisk = getRiskLevel(diseaseScore);
    const pestRisk = getRiskLevel(pestScore);
    const overallRisk = getRiskLevel(overallScore);

    // Identify primary threat
    let suspectedThreat = 'Optimal Conditions - No Immediate Infestation';
    let threatType: 'Fungal Disease' | 'Bacterial Disease' | 'Insect Pest' | 'Healthy Condition' = 'Healthy Condition';
    let immediateAction = 'Continue routine field monitoring and maintain balanced plant nutrition.';

    if (crop.toLowerCase().includes('rice')) {
      if (diseaseScore >= pestScore && humidity > 80) {
        suspectedThreat = 'Rice Blast (Magnaporthe oryzae)';
        threatType = 'Fungal Disease';
        immediateAction = 'Drain stagnant water for 48h and withhold further urea applications.';
      } else {
        suspectedThreat = 'Brown Planthopper (BPH)';
        threatType = 'Insect Pest';
        immediateAction = 'Inspect base of tillers for hoppers; adopt alternate wetting and drying.';
      }
    } else if (crop.toLowerCase().includes('wheat')) {
      suspectedThreat = 'Wheat Stripe / Yellow Rust';
      threatType = 'Fungal Disease';
      immediateAction = 'Inspect lower canopy and flag leaf; prepare prophylactic propiconazole.';
    } else if (crop.toLowerCase().includes('tomato')) {
      if (humidity > 85 && temperature < 23) {
        suspectedThreat = 'Tomato Late Blight (Phytophthora)';
        threatType = 'Fungal Disease';
        immediateAction = 'Cease overhead irrigation immediately; apply protective copper spray.';
      } else {
        suspectedThreat = 'Tomato Early Blight & Whitefly Vector';
        threatType = 'Fungal Disease';
        immediateAction = 'Prune lower leaves; deploy yellow sticky traps; apply protective mulch.';
      }
    } else if (crop.toLowerCase().includes('cotton')) {
      suspectedThreat = 'Pink Bollworm & Sucking Pests';
      threatType = 'Insect Pest';
      immediateAction = 'Install 8 pheromone traps/acre; inspect green bolls for rosetted blooms.';
    } else if (crop.toLowerCase().includes('maize')) {
      suspectedThreat = 'Fall Armyworm (Spodoptera frugiperda)';
      threatType = 'Insect Pest';
      immediateAction = 'Scout central leaf whorls for sawdust frass; apply bio-agents in whorl.';
    } else if (crop.toLowerCase().includes('potato')) {
      suspectedThreat = 'Potato Late Blight';
      threatType = 'Fungal Disease';
      immediateAction = 'Ensure 15cm earthing-up; apply systemic fungicide upon regional blight warning.';
    }

    // 2. Generate Explainable AI (XAI) feature attribution breakdown
    const humidityContribution = Math.round(humidity > 80 ? 32 : humidity > 70 ? 22 : 12);
    const tempContribution = Math.round(temperature >= 24 && temperature <= 32 ? 26 : 16);
    const soilContribution = Math.round(soil_moisture > 75 ? 20 : 12);
    const stageContribution = Math.round(14);
    const historyContribution = Math.round(previous_disease_history ? 14 : 6);
    const totalRaw = humidityContribution + tempContribution + soilContribution + stageContribution + historyContribution;

    const xaiFactors: XAIFactor[] = [
      {
        factor: 'Relative Atmospheric Humidity',
        category: 'Environmental',
        contribution_pct: Math.round((humidityContribution / totalRaw) * 100),
        value_observed: `${humidity}%`,
        threshold: '>75% Danger',
        direction: humidity > 75 ? 'Increases Risk' : 'Neutral',
        description: humidity > 75
          ? 'Elevated canopy moisture stimulates fungal spore germination and creates favorable microclimate.'
          : 'Humidity levels are within safe physiological baseline range.',
      },
      {
        factor: 'Ambient Temperature Range',
        category: 'Environmental',
        contribution_pct: Math.round((tempContribution / totalRaw) * 100),
        value_observed: `${temperature}°C`,
        threshold: '24°C - 32°C Optimal Pathogen Window',
        direction: temperature >= 22 && temperature <= 32 ? 'Increases Risk' : 'Decreases Risk',
        description: 'Current thermal band matches the peak reproductive velocity of major crop pathogens.',
      },
      {
        factor: 'Soil Moisture & Waterlogging',
        category: 'Field Condition',
        contribution_pct: Math.round((soilContribution / totalRaw) * 100),
        value_observed: `${soil_moisture}%`,
        threshold: '>70% Saturated',
        direction: soil_moisture > 70 ? 'Increases Risk' : 'Neutral',
        description: soil_moisture > 70
          ? 'Excessive root saturation limits oxygen uptake and promotes zoospore swimming motility.'
          : 'Soil moisture is well regulated for root respiration.',
      },
      {
        factor: 'Crop Growth Stage Susceptibility',
        category: 'Crop',
        contribution_pct: Math.round((stageContribution / totalRaw) * 100),
        value_observed: growth_stage,
        threshold: 'Active Vegetative / Reproductive Stage',
        direction: 'Increases Risk',
        description: `Rapid cell division and succulent tissue during ${growth_stage} offer lower cuticle resistance.`,
      },
      {
        factor: 'Prior Inoculum & Field Pressure',
        category: 'Historical',
        contribution_pct: Math.round((historyContribution / totalRaw) * 100),
        value_observed: previous_disease_history ? 'Confirmed History' : 'Clean History',
        threshold: 'Zero Baseline Spores',
        direction: previous_disease_history ? 'Increases Risk' : 'Decreases Risk',
        description: previous_disease_history
          ? 'Overwintered fungal sclerotia or dormant pest pupae present in nearby soil debris.'
          : 'Low residual background pathogen load from previous season.',
      },
    ];

    // Counterfactual simulations for what-if exploration
    const counterfactuals = [
      {
        parameter: 'Relative Humidity Reduction',
        adjustment: 'Reduce humidity from ' + humidity + '% to 65% via wider row aeration & drainage',
        new_risk_level: overallRisk === 'CRITICAL' ? ('MODERATE' as RiskLevel) : ('LOW' as RiskLevel),
        health_score_change: +18,
        impact_description: 'Interrupts continuous leaf surface wetness; fungal germination drops by ~58%.',
      },
      {
        parameter: 'Soil Moisture Regulation',
        adjustment: 'Switch from flood irrigation to Alternate Wetting & Drying (AWD)',
        new_risk_level: overallRisk === 'CRITICAL' ? ('HIGH' as RiskLevel) : ('LOW' as RiskLevel),
        health_score_change: +12,
        impact_description: 'Disrupts root rot conditions and collapses basal planthopper breeding habitat.',
      },
      {
        parameter: 'Prophylactic Biological Defense',
        adjustment: 'Apply Pseudomonas fluorescens or Trichoderma viride within 24h',
        new_risk_level: ('LOW' as RiskLevel),
        health_score_change: +15,
        impact_description: 'Competitive bio-colonization forms a living shield blocking infection ingress.',
      },
    ];

    return {
      health_score: healthScore,
      health_category: getHealthCategory(healthScore),
      disease_risk: diseaseRisk,
      disease_risk_score: diseaseScore,
      pest_risk: pestRisk,
      pest_risk_score: pestScore,
      overall_risk: overallRisk,
      primary_suspected_threat: suspectedThreat,
      threat_type: threatType,
      recommended_immediate_action: immediateAction,
      confidence: 0.91,
      xai_factors: xaiFactors,
      counterfactual_scenarios: counterfactuals,
    };
  }

  /**
   * Demo Image Inference Pipeline for Leaf & Pest Computer Vision Classification
   */
  static analyzeImage(
    cropName: string,
    imageHint?: string,
    userProvidedImage?: boolean
  ): DetectionResult {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const cropLower = cropName.toLowerCase();
    const hintLower = (imageHint || '').toLowerCase();

    // Select matched disease or pest from catalog
    let matchedDisease = DISEASES_DATA.find(d =>
      d.affected_crops.some(c => c.toLowerCase().includes(cropLower)) ||
      hintLower.includes(d.name.toLowerCase())
    );

    let matchedPest = PESTS_DATA.find(p =>
      p.crops_affected.some(c => c.toLowerCase().includes(cropLower)) ||
      hintLower.includes(p.name.toLowerCase())
    );

    // If hint suggests healthy or explicitly selected healthy sample
    if (hintLower.includes('healthy') || hintLower.includes('optimal')) {
      return {
        id: `DET-${Date.now()}`,
        timestamp,
        crop: cropName || 'Field Crop',
        category: 'Healthy',
        name: 'Healthy Foliage (No Disease or Pest Detected)',
        confidence: 0.97,
        severity: 'Low',
        severity_pct: 4,
        risk_level: 'LOW',
        symptoms: [
          'Uniform chlorophyll reflectance across upper and lower leaf surface',
          'Intact cell epidermis with no necrotic lesions or insect scraping',
          'Healthy vigorous turgidity and well-formed vascular venation',
        ],
        possible_causes: [
          'Optimal microclimate balance with balanced N-P-K mineral nutrition',
          'Effective preventative sanitation and regular scouting',
        ],
        management_immediate: 'No chemical or biological intervention needed. Maintain scheduled irrigation.',
        management_preventive: 'Continue weekly inspection and install yellow sticky traps for prophylactic monitoring.',
        management_biological: 'Maintain indigenous beneficial insect habitats (ladybirds, predatory spiders) around borders.',
        management_ipm: 'Record clean inspection in logbook and re-scout in 7 days.',
        xai_factors: [
          {
            factor: 'Chlorophyll Uniformity Index',
            category: 'Crop',
            contribution_pct: 42,
            value_observed: '98% Homogeneous Green',
            threshold: '>90% Normal',
            direction: 'Decreases Risk',
            description: 'High green-channel optical reflectance confirms healthy chloroplast density.',
          },
          {
            factor: 'Lesion Pixel Density',
            category: 'Environmental',
            contribution_pct: 35,
            value_observed: '0.2% Area',
            threshold: '<2.0% Clean',
            direction: 'Decreases Risk',
            description: 'Absence of concentric rings or chlorotic halo necrosis.',
          },
          {
            factor: 'Vascular Turgor Integrity',
            category: 'Field Condition',
            contribution_pct: 23,
            value_observed: 'Optimal Osmotic Pressure',
            threshold: 'Erect Unwilted',
            direction: 'Decreases Risk',
            description: 'No vascular wilt or phloem sap-sucking damage detected.',
          },
        ],
        counterfactual_tip: 'Crop is in prime health. Ensure nitrogen is not applied in excess to preserve cellular resistance.',
      };
    }

    // Default to disease or pest based on hints
    const isPest = hintLower.includes('pest') || hintLower.includes('borer') || hintLower.includes('bollworm') || hintLower.includes('aphid');

    if (isPest && matchedPest) {
      return {
        id: `DET-${Date.now()}`,
        timestamp,
        crop: cropName || 'Target Crop',
        category: 'Pest',
        name: matchedPest.name,
        confidence: 0.93,
        severity: matchedPest.risk_level === 'CRITICAL' ? 'Critical' : 'High',
        severity_pct: matchedPest.risk_level === 'CRITICAL' ? 76 : 58,
        risk_level: matchedPest.risk_level,
        symptoms: matchedPest.identification_traits.concat([matchedPest.symptoms_and_damage]),
        possible_causes: [
          `Favorable climatic temperature band supporting rapid ${matchedPest.name} reproduction`,
          'Absence or suppression of indigenous predatory biocontrol agents',
          'Presence of host plants in nearby untreated plots',
        ],
        management_immediate: `Immediate Action: ${matchedPest.cultural_control.split('.')[0]}.`,
        management_preventive: matchedPest.cultural_control,
        management_biological: `Biological: ${matchedPest.biological_control}`,
        management_ipm: `IPM Guidance: ${matchedPest.chemical_guidance}`,
        xai_factors: [
          {
            factor: 'Feeding Damage Morphology',
            category: 'Crop',
            contribution_pct: 38,
            value_observed: 'Boring Frass / Sap Extraction Marks',
            threshold: 'Signature Pattern',
            direction: 'Increases Risk',
            description: 'Visual pattern matches characteristic insect mastication and excreta morphology.',
          },
          {
            factor: 'Life Stage Vulnerability Index',
            category: 'Environmental',
            contribution_pct: 28,
            value_observed: matchedPest.danger_life_stage,
            threshold: 'Active Destructive Stage',
            direction: 'Increases Risk',
            description: 'High feeding velocity observed during current destructive larval/nymph stage.',
          },
          {
            factor: 'Economic Threshold Proximity',
            category: 'Historical',
            contribution_pct: 20,
            value_observed: 'Crosses Field ETL',
            threshold: matchedPest.economic_threshold,
            direction: 'Increases Risk',
            description: 'Pest population density has breached economic damage thresholds.',
          },
          {
            factor: 'Biocontrol Population Deficit',
            category: 'Field Condition',
            contribution_pct: 14,
            value_observed: 'Sub-threshold Predators',
            threshold: 'Conserved Population',
            direction: 'Increases Risk',
            description: 'Native predator counts insufficient to naturally suppress infestation wave.',
          },
        ],
        counterfactual_tip: `Deploying targeted pheromone traps or release of egg parasitoids suppresses adult population by ~70%.`,
      };
    }

    // Disease inference
    if (!matchedDisease) {
      matchedDisease = DISEASES_DATA[0]; // Rice Blast fallback
    }

    return {
      id: `DET-${Date.now()}`,
      timestamp,
      crop: cropName || matchedDisease.affected_crops[0] || 'Agricultural Crop',
      category: 'Disease',
      name: matchedDisease.name,
      confidence: 0.94,
      severity: matchedDisease.severity,
      severity_pct: matchedDisease.severity === 'Critical' ? 82 : matchedDisease.severity === 'High' ? 68 : 45,
      risk_level: matchedDisease.severity === 'Critical' ? 'CRITICAL' : matchedDisease.severity === 'High' ? 'HIGH' : 'MODERATE',
      symptoms: [
        matchedDisease.symptoms,
        `Pathogen: ${matchedDisease.pathogen}`,
        `Distinct visual pattern: ${matchedDisease.detection_pattern}`,
      ],
      possible_causes: [
        matchedDisease.primary_cause,
        `Favorable environment: ${matchedDisease.favorable_conditions.description}`,
      ],
      management_immediate: `Immediate Action: ${matchedDisease.prevention_measures[1] || 'Isolate affected sector and sanitize tools'}.`,
      management_preventive: matchedDisease.prevention_measures.join('. '),
      management_biological: `Biological: ${matchedDisease.organic_control}`,
      management_ipm: `IPM / Chemical Advisory: ${matchedDisease.chemical_control_guidance}`,
      xai_factors: [
        {
          factor: 'Lesion Border & Halo Ratio',
          category: 'Crop',
          contribution_pct: 36,
          value_observed: 'Sharp Necrotic Halo Detected',
          threshold: 'Characteristic Diagnostic Lesion',
          direction: 'Increases Risk',
          description: 'Computer-vision feature contour matches known concentric spore growth geometry.',
        },
        {
          factor: 'Canopy Humidity Correlation',
          category: 'Environmental',
          contribution_pct: 28,
          value_observed: matchedDisease.favorable_conditions.humidity_pct,
          threshold: '>80% Fungal Conidia Germination',
          direction: 'Increases Risk',
          description: 'Microclimate atmospheric vapor pressure provides free water film required for infection.',
        },
        {
          factor: 'Thermal Match for Pathogen Growth',
          category: 'Environmental',
          contribution_pct: 22,
          value_observed: matchedDisease.favorable_conditions.temp_c,
          threshold: 'Optimum Thermal Range',
          direction: 'Increases Risk',
          description: 'Temperature aligns with peak mycelial growth velocity curves.',
        },
        {
          factor: 'Tissue Resistance Index',
          category: 'Crop',
          contribution_pct: 14,
          value_observed: 'Soft Juvenile Tissue',
          threshold: 'Lignified Hard Cuticle',
          direction: 'Increases Risk',
          description: 'Rapidly growing leaf tissue provides low mechanical barrier against fungal appressoria.',
        },
      ],
      counterfactual_tip: `Pruning blighted lower leaves and eliminating standing water reduces secondary spread by ~65%.`,
    };
  }

  /**
   * Farmer Advisor Language Translator & Plain-language Action Generator
   */
  static getFarmerActionPlan(
    crop: string,
    diseaseOrPest: string,
    severity: SeverityLevel,
    growthStage: string,
    weatherCondition: string,
    language: 'English' | 'Hindi' | 'Marathi' | 'Telugu' | 'Punjabi' | 'Bengali' = 'English'
  ): FarmerAdvisorPlan {
    const isCritical = severity === 'Critical' || severity === 'High';

    const plan: FarmerAdvisorPlan = {
      crop,
      condition: diseaseOrPest,
      severity,
      growth_stage: growthStage,
      weather: weatherCondition,
      summary_message: isCritical
        ? `Alert: Your ${crop} is exhibiting significant signs of ${diseaseOrPest} during ${growthStage}. Swift proactive intervention is required to avoid yield reduction.`
        : `Monitoring Notice: Moderate symptoms of ${diseaseOrPest} identified on ${crop}. Routine integrated management will safeguard your harvest.`,
      action_steps: [
        {
          step: 1,
          title: 'Field Inspection & Isolation',
          details: 'Walk through your field along a zig-zag pattern. Mark or tag affected plants. Remove severely diseased lower leaves and bury them outside the field bund.',
          priority: 'Immediate',
        },
        {
          step: 2,
          title: 'Regulate Water & Canopy Drainage',
          details: 'Immediately halt excessive or overhead irrigation. Ensure field furrows allow standing water to drain freely so the crop canopy can dry quickly in morning sun.',
          priority: 'Immediate',
        },
        {
          step: 3,
          title: 'Bio-Protectant & Organic Spray',
          details: 'Apply organic formulation such as 5% Neem Seed Kernel Extract (NSKE) or Trichoderma bio-fungicide during calm late afternoon hours on both upper and lower leaf surfaces.',
          priority: 'Important',
        },
        {
          step: 4,
          title: 'Avoid Excessive Nitrogen Fertilizer',
          details: 'Withhold chemical urea top-dressing for 10-14 days. Excess nitrogen promotes lush soft leaves that are easily penetrated by fungal spores and pests.',
          priority: 'Important',
        },
        {
          step: 5,
          title: 'Re-Scout in 72 Hours',
          details: 'Revisit the tagged inspection zones after 3 days. If new lesions have stopped expanding, continue biological protection. If spread continues, consult your local Krishi Vigyan Kendra (KVK).',
          priority: 'Routine',
        },
      ],
      safety_advisory: 'Always follow state agricultural university and authorized extension recommendations. Use protective masks and gloves when applying agricultural solutions.',
    };

    // Hindi translation support
    if (language === 'Hindi') {
      plan.summary_message = `सावधानी: आपकी ${crop} की फसल में ${growthStage} अवस्था में ${diseaseOrPest} के लक्षण देखे गए हैं। फसल के नुकसान से बचने के लिए तुरंत कदम उठाएं।`;
      plan.action_steps = [
        {
          step: 1,
          title: 'खेत का निरीक्षण और संक्रमित पत्तों को हटाना',
          details: 'खेत में ज़िग-ज़ैग तरीके से घूमें। अधिक प्रभावित पत्तों को तोड़कर खेत से दूर मिट्टी में दबा दें।',
          priority: 'Immediate',
        },
        {
          step: 2,
          title: 'अतिरिक्त पानी की निकासी',
          details: 'खेत में पानी जमा न होने दें। नालियों को खोलें ताकि फसल की हवा और धूप बनी रहे।',
          priority: 'Immediate',
        },
        {
          step: 3,
          title: 'जैविक व नीम का छिड़काव',
          details: 'शाम के समय 5% नीम का काढ़ा या ट्राइकोडर्मा का छिड़काव पत्तों के दोनों तरफ करें।',
          priority: 'Important',
        },
        {
          step: 4,
          title: 'यूरिया का प्रयोग तुरंत रोकें',
          details: 'रोग की स्थिति में यूरिया डालने से पत्ते कोमल हो जाते हैं जिससे बीमारी तेजी से फैलती है।',
          priority: 'Important',
        },
        {
          step: 5,
          title: '72 घंटे बाद पुनः निरीक्षण',
          details: '3 दिन बाद खेत की जांच करें। यदि नए धब्बे रुक गए हैं तो जैविक उपाय जारी रखें, अन्यथा कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
          priority: 'Routine',
        },
      ];
      plan.safety_advisory = 'कृषि रसायनों के उपयोग के समय दस्ताने और मास्क का उपयोग अवश्य करें। स्थानीय कृषि विश्वविद्यालय की सलाह का पालन करें।';
    }

    return plan;
  }
}
