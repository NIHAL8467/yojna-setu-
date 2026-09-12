export interface VerifiedSchemeInfo {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  category: 'agriculture' | 'health' | 'housing' | 'business' | 'education' | 'women' | 'social_welfare' | 'sanitation' | 'transport' | 'artisan';
  targetGroup: string;
  targetGroupHi: string;
  definition: string;
  definitionHi: string;
  eligibility: string[];
  eligibilityHi: string[];
  financialBenefit: string;
  financialBenefitHi: string;
  requiredDocuments: string[];
  requiredDocumentsHi: string[];
  howToApply: string;
  howToApplyHi: string;
  officialPortal?: string;
  keywords: string[];
}

export const VERIFIED_SCHEMES_REGISTRY: VerifiedSchemeInfo[] = [
  // 1. PM-KISAN
  {
    id: 'pm_kisan',
    code: 'PM-KISAN',
    name: 'PM Kisan Samman Nidhi',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    category: 'agriculture',
    targetGroup: 'Farmer families with cultivable landholding',
    targetGroupHi: 'कृषि योग्य भूमि वाले किसान परिवार',
    definition: 'PM-KISAN is a Government of India scheme that provides income support to eligible farmer families. The benefit is provided through direct bank transfer.',
    definitionHi: 'पीएम-किसान (PM-KISAN) भारत सरकार की एक योजना है जो पात्र किसान परिवारों को वित्तीय सहायता प्रदान करती है। यह लाभ प्रत्यक्ष बैंक हस्तांतरण (DBT) के माध्यम से दिया जाता है।',
    eligibility: [
      'All landholding farmer families who have cultivable landholding in their names.',
      'Exclusions: Institutional landholders, constitutional post holders, serving/retired government employees, income tax payees, and professionals (doctors, engineers, lawyers).'
    ],
    eligibilityHi: [
      'वे सभी किसान परिवार जिनके नाम पर कृषि योग्य भूमि का स्वामित्व दर्ज है।',
      'अपवाद: संस्थागत भूमिधारक, संवैधानिक पदों पर कार्यरत, सेवारत/सेवानिवृत्त सरकारी कर्मचारी, आयकर दाता, और पेशेवर (डॉक्टर, इंजीनियर, वकील)।'
    ],
    financialBenefit: 'Financial assistance of ₹6,000 per year, transferred directly into bank accounts in 3 equal installments of ₹2,000 every four months.',
    financialBenefitHi: 'प्रति वर्ष ₹6,000 की वित्तीय सहायता, जो हर 4 महीने में ₹2,000 की 3 समान किस्तों में सीधे बैंक खाते में भेजी जाती है।',
    requiredDocuments: [
      'Aadhaar Card',
      'Land ownership documents (Khasra / Khatauni / RoR)',
      'Active bank account passbook linked with Aadhaar',
      'Valid mobile number'
    ],
    requiredDocumentsHi: [
      'आधार कार्ड',
      'भूमि स्वामित्व दस्तावेज (खसरा / खतौनी / जमाबंदी)',
      'आधार से लिंक सक्रिय बैंक खाता पासबुक',
      'सक्रिय मोबाइल नंबर'
    ],
    howToApply: 'Farmers can register online at the official portal pmkisan.gov.in under "Farmer Corner" or visit their local Common Service Center (CSC) or Agriculture Office.',
    howToApplyHi: 'किसान आधिकारिक पोर्टल pmkisan.gov.in पर "Farmer Corner" के तहत ऑनलाइन आवेदन कर सकते हैं या अपने नजदीकी सीएससी (CSC) या कृषि कार्यालय जा सकते हैं।',
    officialPortal: 'https://pmkisan.gov.in',
    keywords: ['pm kisan', 'pmkisan', 'kisan', 'farmer', 'farmers', 'agriculture', 'kheti', 'किसान', 'पीएम किसान', 'सम्मान निधि']
  },

  // 2. PM-JAY / AYUSHMAN BHARAT
  {
    id: 'ayushman_bharat',
    code: 'PM-JAY',
    name: 'Ayushman Bharat - PM Jan Arogya Yojana',
    nameHi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)',
    category: 'health',
    targetGroup: 'Low-income families and senior citizens aged 70+',
    targetGroupHi: 'निम्न आय वर्ग परिवार एवं 70 वर्ष या उससे अधिक आयु के सभी वरिष्ठ नागरिक',
    definition: 'PM-JAY is the world\'s largest government-funded health assurance scheme providing free secondary and tertiary inpatient healthcare to eligible families.',
    definitionHi: 'आयुष्मान भारत (PM-JAY) भारत सरकार की राष्ट्रीय स्वास्थ्य सुरक्षा योजना है, जो पात्र परिवारों को द्वितीयक और तृतीयक अस्पताल में कैशलेस इलाज की सुविधा देती है।',
    eligibility: [
      'Families listed in the Socio-Economic Caste Census (SECC 2011) database or active NFSA ration card holders.',
      'Recently expanded to all senior citizens aged 70 years and above, irrespective of household income.'
    ],
    eligibilityHi: [
      'सामाजिक-आर्थिक जाति जनगणना (SECC 2011) डेटाबेस में सूचीबद्ध परिवार या पात्र राशन कार्ड धारक।',
      'परिवार की आय पर विचार किए बिना 70 वर्ष या उससे अधिक आयु के सभी वरिष्ठ नागरिक भी पात्र हैं।'
    ],
    financialBenefit: 'Cashless health insurance cover of up to ₹5,00,000 per family per year for hospitalization across impaneled public and private hospitals nationwide.',
    financialBenefitHi: 'देश भर के सूचीबद्ध सरकारी और निजी अस्पतालों में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5,00,000 तक का कैशलेस स्वास्थ्य सुरक्षा कवर।',
    requiredDocuments: [
      'Aadhaar Card',
      'Ration Card / Family ID',
      'Ayushman Card or PM-JAY letter (if already issued)'
    ],
    requiredDocumentsHi: [
      'आधार कार्ड',
      'राशन कार्ड / परिवार पहचान पत्र',
      'आयुष्मान कार्ड (यदि पहले से बना हो)'
    ],
    howToApply: 'Check eligibility and generate your Ayushman Card at beneficiary.nha.gov.in, nearest CSC center, or at the Ayushman Mitra desk in any empanelled hospital.',
    howToApplyHi: 'beneficiary.nha.gov.in पोर्टल पर, नजदीकी सीएससी (CSC) केंद्र पर, या किसी भी सूचीबद्ध अस्पताल के आयुष्मान मित्र काउंटर पर अपनी पात्रता जांचें और कार्ड बनवाएं।',
    officialPortal: 'https://beneficiary.nha.gov.in',
    keywords: ['ayushman', 'pm-jay', 'pmjay', 'health', 'hospital', 'medical', 'ilaj', 'swasthya', 'आयुष्मान', 'इलाज', 'स्वास्थ्य']
  },

  // 3. PM AWAS YOJANA (PMAY)
  {
    id: 'pm_awas_yojana',
    code: 'PMAY',
    name: 'Pradhan Mantri Awas Yojana',
    nameHi: 'प्रधानमंत्री आवास योजना (PMAY)',
    category: 'housing',
    targetGroup: 'Homeless and kutcha house dwellers (Rural & Urban)',
    targetGroupHi: 'बेघर और कच्चे मकानों में रहने वाले परिवार (ग्रामीण एवं शहरी)',
    definition: 'PMAY is a central government housing mission designed to provide pucca houses with basic amenities to all eligible homeless or kutcha household families.',
    definitionHi: 'प्रधानमंत्री आवास योजना (PMAY) बेघर या कच्चे घरों में रहने वाले पात्र परिवारों को सभी बुनियादी सुविधाओं से युक्त पक्का मकान उपलब्ध कराने की सरकारी योजना है।',
    eligibility: [
      'Beneficiary family must not own a pucca house in their name or any family member\'s name anywhere in India.',
      'Income category: Economically Weaker Section (EWS - income up to ₹3 Lakh) or Low Income Group (LIG - income up to ₹6 Lakh).',
      'Priority to SC/ST households, women-headed households, and persons with disabilities.'
    ],
    eligibilityHi: [
      'लाभार्थी परिवार के किसी भी सदस्य के नाम पर पूरे भारत में कोई पक्का मकान नहीं होना चाहिए।',
      'आय वर्ग: आर्थिक रूप से कमजोर वर्ग (EWS - ₹3 लाख तक) या निम्न आय वर्ग (LIG - ₹6 लाख तक)।',
      'अनुसूचित जाति/जनजाति, महिला मुखिया वाले परिवारों और दिव्यांगजनों को प्राथमिकता।'
    ],
    financialBenefit: 'Direct financial assistance of ₹1,20,000 (plains) to ₹1,30,000 (hilly areas) for PMAY-Gramin, or interest subsidy up to ₹2.67 Lakhs on housing loans under PMAY-Urban.',
    financialBenefitHi: 'ग्रामीण क्षेत्रों में ₹1.20 लाख से ₹1.30 लाख की सीधी वित्तीय सहायता, या शहरी क्षेत्रों में गृह ऋण पर ₹2.67 लाख तक की ब्याज सब्सिडी।',
    requiredDocuments: [
      'Aadhaar Card of all adult family members',
      'Income Certificate',
      'Bank Account passbook linked with Aadhaar',
      'Proof of land / house site (or self-declaration of no pucca house)',
      'Job Card / Ration Card'
    ],
    requiredDocumentsHi: [
      'परिवार के सभी बालिग सदस्यों का आधार कार्ड',
      'आय प्रमाण पत्र',
      'आधार से लिंक बैंक खाता पासबुक',
      'भूमि या कच्चे मकान का प्रमाण',
      'राशन कार्ड / जॉब कार्ड'
    ],
    howToApply: 'For rural, contact your Gram Panchayat or Block Development Office. For urban, apply through pmaymis.gov.in or municipal corporation / ULB office.',
    howToApplyHi: 'ग्रामीण के लिए अपनी ग्राम पंचायत या ब्लॉक विकास कार्यालय से संपर्क करें। शहरी के लिए pmaymis.gov.in पोर्टल या नगर निगम कार्यालय में आवेदन करें।',
    officialPortal: 'https://pmaymis.gov.in',
    keywords: ['pmay', 'awas', 'house', 'housing', 'makan', 'ghar', 'आवास', 'मकान', 'घर']
  },

  // 4. PM MUDRA YOJANA (PMMY)
  {
    id: 'pm_mudra_yojana',
    code: 'PMMY',
    name: 'Pradhan Mantri Mudra Yojana',
    nameHi: 'प्रधानमंत्री मुद्रा योजना (PMMY)',
    category: 'business',
    targetGroup: 'Non-farm micro and small entrepreneurs, shopkeepers, and vendors',
    targetGroupHi: 'गैर-कृषि सूक्ष्म और लघु उद्यमी, दुकानदार और छोटे व्यापारी',
    definition: 'PMMY provides collateral-free institutional loans up to ₹10 Lakhs (and up to ₹20 Lakhs under Tarun Plus) to non-corporate, non-farm micro and small enterprises.',
    definitionHi: 'प्रधानमंत्री मुद्रा योजना (PMMY) विनिर्माण, प्रसंस्करण, व्यापार या सेवा क्षेत्र के गैर-कॉर्पोरेट और गैर-कृषि सूक्ष्म उद्यमों को बिना किसी गारंटी के ऋण प्रदान करती है।',
    eligibility: [
      'Any Indian citizen having a viable business plan for a non-farm income-generating activity.',
      'Should not be a defaulter to any bank or financial institution.'
    ],
    eligibilityHi: [
      'कोई भी भारतीय नागरिक जिसके पास गैर-कृषि आय-उत्पादक गतिविधि के लिए व्यवहार्य व्यावसायिक योजना हो।',
      'किसी भी बैंक या वित्तीय संस्थान का डिफ़ॉल्टर नहीं होना चाहिए।'
    ],
    financialBenefit: 'Three loan categories: Shishu (loans up to ₹50,000), Kishore (loans from ₹50,001 to ₹5,00,000), and Tarun (loans from ₹5,00,001 to ₹10,00,000, extended up to ₹20 Lakhs). No collateral security required.',
    financialBenefitHi: 'तीन श्रेणियां: शिशु (₹50,000 तक), किशोर (₹50,001 से ₹5 लाख तक), और तरुण (₹5,00,001 से ₹10 लाख तक, पुनर्भुगतान करने वालों के लिए ₹20 लाख तक)। कोई गारंटी (Collateral) आवश्यक नहीं।',
    requiredDocuments: [
      'Identity Proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address Proof (Electricity bill / Ration card)',
      'Proof of business identity and address (Establishment certificate / Trade license / Udyam registration)',
      'Quotation of machinery, items, or equipment to be purchased',
      'Bank statement for past 6 months'
    ],
    requiredDocumentsHi: [
      'पहचान प्रमाण (आधार कार्ड / वोटर आईडी / पैन कार्ड)',
      'निवास प्रमाण पत्र',
      'व्यावसायिक प्रतिष्ठान का प्रमाण (उद्यम पंजीकरण / ट्रेड लाइसेंस)',
      'खरीदे जाने वाले उपकरण या सामग्री का कोटेशन',
      'पिछले 6 महीने का बैंक स्टेटमेंट'
    ],
    howToApply: 'Apply at any commercial bank, Regional Rural Bank (RRB), small finance bank, or online via the UdyamiMitra portal (udyamimitra.in).',
    howToApplyHi: 'किसी भी वाणिज्यिक बैंक, क्षेत्रीय ग्रामीण बैंक (RRB), या udyamimitra.in पोर्टल के माध्यम से ऑनलाइन आवेदन कर सकते हैं।',
    officialPortal: 'https://www.mudra.org.in',
    keywords: ['mudra', 'pmmy', 'shishu', 'kishore', 'tarun', 'business loan', 'collateral free', 'मुद्रा', 'शिशु', 'किशोर', 'तरुण']
  },

  // 5. PM SVANIDHI
  {
    id: 'pm_svanidhi',
    code: 'PM-SVANidhi',
    name: 'PM Street Vendor\'s AtmaNirbhar Nidhi',
    nameHi: 'पीएम स्वनिधि योजना (PM SVANidhi)',
    category: 'business',
    targetGroup: 'Urban street vendors, hawkers, and thela-walas',
    targetGroupHi: 'शहरी रेहड़ी-पटरी वाले, ठेला चालक और छोटे विक्रेता',
    definition: 'PM SVANidhi is a micro-credit scheme providing working capital loans to urban street vendors to resume or scale their livelihoods with interest subsidies on timely repayment.',
    definitionHi: 'पीएम स्वनिधि (PM SVANidhi) योजना शहरी रेहड़ी-पटरी वालों (स्ट्रीट वेंडर्स) को अपना व्यवसाय चलाने या बढ़ाने के लिए किफायती कार्यशील पूंजी ऋण प्रदान करती है।',
    eligibility: [
      'Street vendors vending in urban areas on or before March 24, 2020.',
      'Must possess a Vending Certificate / Identity Card issued by the Urban Local Body (ULB) or a Letter of Recommendation (LoR).'
    ],
    eligibilityHi: [
      'शहरी क्षेत्रों में रेहड़ी-पटरी पर सामान बेचने वाले विक्रेता।',
      'शहरी स्थानीय निकाय (नगर पालिका / नगर निगम) द्वारा जारी वेंडिंग प्रमाणपत्र / पहचान पत्र या अनुशंसा पत्र (LoR) होना आवश्यक है।'
    ],
    financialBenefit: 'Collateral-free working capital loan in 3 tranches: ₹10,000 (1st tranche), ₹20,000 (2nd tranche upon timely repayment), and ₹50,000 (3rd tranche). Interest subsidy of 7% p.a. credited to bank account.',
    financialBenefitHi: 'बिना गारंटी के 3 चरणों में ऋण: प्रथम चरण में ₹10,000, समय पर चुकाने पर दूसरे चरण में ₹20,000, और तीसरे चरण में ₹50,000। समय पर भुगतान पर 7% वार्षिक ब्याज सब्सिडी।',
    requiredDocuments: [
      'Aadhaar Card',
      'Vending Certificate / Urban Local Body Identity Card / Letter of Recommendation (LoR)',
      'Bank Account linked with Aadhaar and mobile'
    ],
    requiredDocumentsHi: [
      'आधार कार्ड',
      'वेंडिंग प्रमाण पत्र / पहचान पत्र / नगर निकाय अनुशंसा पत्र (LoR)',
      'आधार से लिंक बैंक खाता पासबुक'
    ],
    howToApply: 'Apply directly online on the PM SVANidhi portal (pmsvanidhi.mohua.gov.in) or through Common Service Centers (CSC) and municipal offices.',
    howToApplyHi: 'pmsvanidhi.mohua.gov.in पोर्टल पर ऑनलाइन या नजदीकी सीएससी (CSC) या नगर पालिका कार्यालय में आवेदन करें।',
    officialPortal: 'https://pmsvanidhi.mohua.gov.in',
    keywords: ['svanidhi', 'street vendor', 'thela', 'hawker', 'vendor', 'रेहड़ी', 'पटरी', 'स्वनिधि', 'ठेला']
  },

  // 6. PM VISHWAKARMA
  {
    id: 'pm_vishwakarma',
    code: 'PM-Vishwakarma',
    name: 'PM Vishwakarma Scheme',
    nameHi: 'प्रधानमंत्री विश्वकर्मा योजना (PM Vishwakarma)',
    category: 'artisan',
    targetGroup: 'Traditional artisans and craftspeople across 18 trades',
    targetGroupHi: '18 पारंपरिक व्यवसायों में हाथों और औजारों से काम करने वाले कारीगर और शिल्पकार',
    definition: 'PM Vishwakarma provides end-to-end holistic support including formal skill training, modern toolkit incentive, and concessional collateral-free credit to traditional artisans and craftspeople.',
    definitionHi: 'प्रधानमंत्री विश्वकर्मा योजना हाथों और औजारों से काम करने वाले 18 पारंपरिक व्यवसायों के कारीगरों को कौशल प्रशिक्षण, टूलकिट प्रोत्साहन और रियायती ऋण सहायता प्रदान करती है।',
    eligibility: [
      'Artisans and craftspeople engaged in one of the 18 recognized traditional trades (e.g., carpenter, blacksmith, potter, sculptor, cobbler, tailor, mason, barber, garland maker, boat maker, etc.).',
      'Minimum age: 18 years. Benefit restricted to one member per family.',
      'Must not have availed loans under PMEGP, Mudra, or PM SVANidhi in the past 5 years.'
    ],
    eligibilityHi: [
      'मान्यता प्राप्त 18 पारंपरिक व्यवसायों (बढ़ई, लोहार, कुम्हार, मूर्तिकार, मोची, दर्जी, राजमिस्त्री, नाई, धोबी आदि) में कार्यरत कारीगर।',
      'न्यूनतम आयु 18 वर्ष। परिवार के केवल एक सदस्य को लाभ।',
      'पिछले 5 वर्षों में PMEGP, मुद्रा या पीएम स्वनिधि के तहत ऋण न लिया हो।'
    ],
    financialBenefit: 'PM Vishwakarma Certificate & ID Card; Free skill training with ₹500/day stipend; ₹15,000 toolkit grant; and collateral-free enterprise loan up to ₹1 Lakh (1st tranche) and ₹2 Lakhs (2nd tranche) at only 5% concessional interest.',
    financialBenefitHi: 'विश्वकर्मा प्रमाण पत्र एवं आईडी कार्ड; ₹500/दिन वजीफे के साथ निःशुल्क कौशल प्रशिक्षण; ₹15,000 टूलकिट अनुदान; और केवल 5% रियायती ब्याज दर पर ₹1 लाख (पहला चरण) तथा ₹2 लाख (दूसरा चरण) का बिना गारंटी ऋण।',
    requiredDocuments: [
      'Aadhaar Card',
      'Active Mobile Number',
      'Bank Account Passbook',
      'Ration Card / Family Proof'
    ],
    requiredDocumentsHi: [
      'आधार कार्ड',
      'सक्रिय मोबाइल नंबर',
      'बैंक खाता विवरण',
      'राशन कार्ड'
    ],
    howToApply: 'Register with biometric authentication at any Common Service Center (CSC) via the official portal pmvishwakarma.gov.in.',
    howToApplyHi: 'आधिकारिक पोर्टल pmvishwakarma.gov.in के माध्यम से किसी भी नजदीकी सीएससी (CSC) केंद्र पर बायोमेट्रिक सत्यापन के साथ आवेदन करें।',
    officialPortal: 'https://pmvishwakarma.gov.in',
    keywords: ['vishwakarma', 'artisan', 'craft', 'carpenter', 'blacksmith', 'tailor', 'potter', 'karigar', 'विश्वकर्मा', 'कारीगर', 'शिल्पकार', 'दर्जी', 'लोहार', 'बढ़ई']
  },

  // 7. SUKANYA SAMRIDDHI YOJANA (SSY)
  {
    id: 'sukanya_samriddhi',
    code: 'SSY',
    name: 'Sukanya Samriddhi Yojana',
    nameHi: 'सुकन्या समृद्धि योजना (SSY)',
    category: 'women',
    targetGroup: 'Parents / guardians of girl child below 10 years',
    targetGroupHi: '10 वर्ष से कम आयु की बालिकाओं के माता-पिता या अभिभावक',
    definition: 'SSY is a government-backed small savings scheme under Beti Bachao Beti Padhao initiative to build a secure financial fund for a girl child\'s higher education and marriage.',
    definitionHi: 'सुकन्या समृद्धि योजना (SSY) "बेटी बचाओ, बेटी पढ़ाओ" अभियान के तहत बालिकाओं की उच्च शिक्षा और विवाह के लिए एक सरकारी लघु बचत योजना है।',
    eligibility: [
      'Account can be opened by natural or legal guardian in the name of a girl child below the age of 10 years.',
      'Maximum 2 girl children per family (with exception for twins/triplets).'
    ],
    eligibilityHi: [
      '10 वर्ष से कम उम्र की बालिका के नाम पर माता-पिता या कानूनी अभिभावक द्वारा खाता खोला जा सकता है।',
      'एक परिवार में अधिकतम दो बालिकाओं के लिए खाता खोला जा सकता है (जुड़वां बच्चों के मामले में छूट)।'
    ],
    financialBenefit: 'High sovereign-guaranteed interest rate (~8.2% p.a.), triple tax exemption under Section 80C (EEE status), deposits start from as low as ₹250 up to ₹1,50,000 per financial year.',
    financialBenefitHi: 'उच्च सरकारी ब्याज दर (लगभग 8.2% वार्षिक), आयकर धारा 80C के तहत पूर्ण कर छूट, न्यूनतम ₹250 से अधिकतम ₹1,50,000 प्रति वर्ष तक जमा करने की सुविधा।',
    requiredDocuments: [
      'Birth Certificate of the girl child',
      'Identity and address proof of the parent / guardian (Aadhaar, PAN)',
      'Passport size photographs of parent and girl child'
    ],
    requiredDocumentsHi: [
      'बालिका का जन्म प्रमाण पत्र',
      'माता-पिता/अभिभावक का पहचान एवं निवास प्रमाण (आधार, पैन)',
      'पासपोर्ट साइज फोटो'
    ],
    howToApply: 'Open an account at any Post Office branch or authorized public and private sector commercial banks.',
    howToApplyHi: 'किसी भी डाकघर (Post Office) की शाखा या अधिकृत वाणिज्यिक बैंक में जाकर खाता खुलवाएं।',
    officialPortal: 'https://www.indiapost.gov.in',
    keywords: ['sukanya', 'ssy', 'girl child', 'beti', 'savings', 'सुकन्या', 'बेटी', 'बालिका']
  },

  // 8. POST-MATRIC SCHOLARSHIP FOR SC STUDENTS
  {
    id: 'post_matric_scholarship_sc',
    code: 'PMS-SC',
    name: 'Post Matric Scholarship for SC Students',
    nameHi: 'अनुसूचित जाति (SC) उत्तर मैट्रिक छात्रवृत्ति योजना',
    category: 'education',
    targetGroup: 'SC students pursuing post-matriculation / post-secondary education',
    targetGroupHi: '10वीं के बाद उच्च शिक्षा प्राप्त करने वाले अनुसूचित जाति के छात्र',
    definition: 'PMS-SC provides comprehensive financial assistance covering non-refundable academic fees and monthly maintenance allowances to SC students pursuing Class 11, 12, diploma, degree, and postgraduate courses.',
    definitionHi: 'यह योजना 10वीं के बाद उच्च शिक्षा (कक्षा 11, 12, डिप्लोमा, स्नातक, स्नातकोत्तर) ग्रहण कर रहे अनुसूचित जाति (SC) के छात्रों को कॉलेज फीस और मासिक निर्वाह भत्ता प्रदान करती है।',
    eligibility: [
      'Applicant must belong to the Scheduled Caste (SC) community.',
      'Annual family income from all sources must not exceed ₹2,50,000 p.a.',
      'Must have passed Class 10 and enrolled in a recognized post-matric course.'
    ],
    eligibilityHi: [
      'आवेदक अनुसूचित जाति (SC) समुदाय से होना चाहिए।',
      'सभी स्रोतों से वार्षिक पारिवारिक आय ₹2,50,000 से अधिक नहीं होनी चाहिए।',
      'मान्यता प्राप्त कॉलेज या संस्थान में अध्ययनरत होना अनिवार्य है।'
    ],
    financialBenefit: '100% compulsory non-refundable college tuition fees reimbursed, plus monthly maintenance allowance up to ₹1,200/month for day scholars and ₹3,800/month for hostellers transferred via DBT.',
    financialBenefitHi: 'संस्थान की अनिवार्य गैर-वापसी योग्य फीस की पूरी प्रतिपूर्ति, तथा हॉस्टलर छात्रों को ₹3,800/माह और डे-स्कॉलर छात्रों को ₹1,200/माह तक का निर्वाह भत्ता सीधे बैंक में।',
    requiredDocuments: [
      'Valid SC Caste Certificate issued by Tehsildar/SDM',
      'Annual Family Income Certificate (< ₹2.5 Lakh)',
      'Aadhaar Card linked to active bank account',
      'Previous class Marksheet and College Admission Fee Receipt',
      'College Bonafide Certificate'
    ],
    requiredDocumentsHi: [
      'सक्षम अधिकारी द्वारा जारी जाति प्रमाण पत्र',
      'पारिवारिक आय प्रमाण पत्र (वार्षिक आय ₹2.5 लाख से कम)',
      'आधार से लिंक बैंक खाता विवरण',
      'पिछली कक्षा की अंकतालिका और कॉलेज फीस रसीद',
      'कॉलेज बोनाफाइड प्रमाण पत्र'
    ],
    howToApply: 'Apply online through the National Scholarship Portal (scholarships.gov.in) or your respective State Scholarship Portal.',
    howToApplyHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (scholarships.gov.in) या अपने राज्य के छात्रवृत्ति पोर्टल के माध्यम से ऑनलाइन आवेदन करें।',
    officialPortal: 'https://scholarships.gov.in',
    keywords: ['scholarship', 'post matric', 'student', 'college', 'fee', 'education', 'sc scholarship', 'छात्रवृत्ति', 'स्कॉलरशिप', 'शिक्षा']
  }
];

// Helper functions for quick searching and retrieval
export function findVerifiedScheme(query: string): VerifiedSchemeInfo | undefined {
  const clean = query.toLowerCase().trim();
  return VERIFIED_SCHEMES_REGISTRY.find(s => 
    s.id.toLowerCase() === clean ||
    s.code.toLowerCase() === clean ||
    s.name.toLowerCase().includes(clean) ||
    s.nameHi.toLowerCase().includes(clean) ||
    s.keywords.some(k => clean.includes(k) || k.includes(clean))
  );
}

export function searchVerifiedSchemesByTopic(topic: string): VerifiedSchemeInfo[] {
  const clean = topic.toLowerCase().trim();
  return VERIFIED_SCHEMES_REGISTRY.filter(s => 
    s.category.includes(clean) ||
    s.targetGroup.toLowerCase().includes(clean) ||
    s.name.toLowerCase().includes(clean) ||
    s.keywords.some(k => clean.includes(k) || k.includes(clean))
  );
}
