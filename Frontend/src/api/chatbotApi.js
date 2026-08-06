import apiClient from './axios';
import { mockRequest } from './mockClient';
import { runPipelineFromText } from './aiPipelineApi';

const HEALTHCARE_RESPONSES = {
  en: {
    emergency: {
      content: "⚠️ EMERGENCY WARNING: If you are experiencing chest pain, difficulty breathing, or severe bleeding, please call the emergency line (108/112) immediately or visit the nearest emergency room. Sit upright, remain calm, and avoid physical exertion.",
      confidence: 0.99,
      citations: [
        { title: "National Emergency Response Protocol", url: "/emergency" },
        { title: "AHA Emergency Cardiovascular Care", url: "https://www.heart.org" }
      ]
    },
    fever: {
      content: "Fever is often a sign that your body is fighting off an infection (such as the flu, cold, or dengue). Keep hydrated, rest, and monitor your temperature. If the temperature exceeds 103°F (39.4°C) or lasts more than 3 days, please consult a healthcare professional.",
      confidence: 0.94,
      citations: [
        { title: "WHO Fever Management Guidelines", url: "https://www.who.int" },
        { title: "HealthGuard Prevention Manual", url: "/citizen/diseases" }
      ]
    },
    headache: {
      content: "Headaches can be caused by stress, dehydration, fatigue, or eye strain. Drink plenty of water, rest in a quiet, dark room, and avoid screen time. If you experience a sudden, severe headache accompanied by a stiff neck, fever, or confusion, seek immediate medical attention.",
      confidence: 0.91,
      citations: [
        { title: "International Headache Society Guide", url: "https://ihs-headache.org" }
      ]
    },
    diabetes: {
      content: "Diabetes is a chronic metabolic condition where the body cannot regulate blood glucose. It is important to monitor blood sugar levels regularly, eat a high-fiber, low-glycemic diet, exercise daily, and take prescribed medications. Regularly check your feet for sores and schedule annual eye exams.",
      confidence: 0.96,
      citations: [
        { title: "WHO Diabetes Guidelines", url: "https://www.who.int" },
        { title: "National Health Portal Diabetes Info", url: "https://www.nhp.gov.in" }
      ]
    },
    dengue: {
      content: "Dengue is a viral infection transmitted by Aedes mosquitoes. Symptoms include sudden high fever, severe headache (especially behind the eyes), joint/muscle pain, and skin rash. Stay hydrated and take paracetamol (avoid ibuprofen/aspirin as they increase bleeding risks). Prevent mosquito breeding by eliminating stagnant water.",
      confidence: 0.95,
      citations: [
        { title: "National Vector Borne Disease Control Program", url: "https://nvbdcp.gov.in" },
        { title: "CDC Dengue Prevention guidelines", url: "https://www.cdc.gov" }
      ]
    },
    vaccination: {
      content: "Vaccinations are safe and effective ways to protect you from infectious diseases like Polio, Tetanus, Hepatitis, and Measles. Ensure infants and children receive all scheduled immunizations under the Universal Immunization Program.",
      confidence: 0.97,
      citations: [
        { title: "Universal Immunization Program guidelines", url: "/citizen/vaccinations" },
        { title: "WHO Immunization Schedule", url: "https://www.who.int" }
      ]
    },
    pregnancy: {
      content: "For healthy pregnancy outcomes, attend regular prenatal visits, eat a nutritious diet rich in iron and folic acid, stay active, and avoid self-medicating. Watch out for warning signs like severe headache, swollen feet/face, or vaginal bleeding.",
      confidence: 0.95,
      citations: [
        { title: "Janani Suraksha Yojana Program", url: "/citizen/schemes" },
        { title: "WHO Antenatal Care Guidelines", url: "https://www.who.int" }
      ]
    },
    hospital: {
      content: "Based on your location, the nearest facilities are: 1. District General Hospital (2.4 km) - 24/7 Emergency Care; 2. Community Health Centre (4.1 km) - General Medicine & Pediatrics. Please call the emergency center if you need immediate ambulance transport.",
      confidence: 0.98,
      citations: [
        { title: "National Health Facility Registry", url: "/citizen/hospitals" }
      ]
    },
    default: {
      content: "Hello! I am your HealthGuard AI assistant. I can guide you with medical information regarding symptoms, preventive care, nearby hospitals, vaccinations, and government health schemes. How can I help you today?",
      confidence: 0.95,
      citations: [
        { title: "HealthGuard Info Manual", url: "/" }
      ]
    }
  },
  hi: {
    emergency: {
      content: "⚠️ आपातकालीन चेतावनी: यदि आप सीने में दर्द, सांस लेने में कठिनाई, या गंभीर रक्तस्राव का अनुभव कर रहे हैं, तो तुरंत आपातकालीन नंबर (108/112) पर कॉल करें या निकटतम अस्पताल जाएं। सीधे बैठें, शांत रहें और अधिक हिलें-डुलें नहीं।",
      confidence: 0.99,
      citations: [
        { title: "राष्ट्रीय आपातकालीन प्रतिक्रिया प्रोटोकॉल", url: "/emergency" },
        { title: "एएचए आपातकालीन हृदय देखभाल", url: "https://www.heart.org" }
      ]
    },
    fever: {
      content: "बुखार अक्सर इस बात का संकेत होता है कि आपका शरीर किसी संक्रमण (जैसे फ्लू, सर्दी या डेंगू) से लड़ रहा है। पर्याप्त मात्रा में पानी पिएं, आराम करें और अपने तापमान की निगरानी करें। यदि तापमान 103°F (39.4°C) से अधिक हो जाता है या 3 दिनों से अधिक समय तक रहता है, तो कृपया डॉक्टर से संपर्क करें।",
      confidence: 0.94,
      citations: [
        { title: "डब्ल्यूएचओ बुखार प्रबंधन दिशानिर्देश", url: "https://www.who.int" },
        { title: "हेल्थगार्ड रोकथाम मैनुअल", url: "/citizen/diseases" }
      ]
    },
    headache: {
      content: "सिरदर्द तनाव, डिहाइड्रेशन, थकान या आंखों के तनाव के कारण हो सकता है। खूब पानी पिएं, शांत और अंधेरे कमरे में आराम करें। यदि आपको गर्दन में अकड़न, बुखार या भ्रम के साथ अचानक तेज सिरदर्द होता है, तो तुरंत डॉक्टर से संपर्क करें।",
      confidence: 0.91,
      citations: [
        { title: "अंतर्राष्ट्रीय सिरदर्द सोसायटी गाइड", url: "https://ihs-headache.org" }
      ]
    },
    diabetes: {
      content: "मधुमेह एक पुरानी बीमारी है जिसमें शरीर रक्त शर्करा को नियंत्रित नहीं कर पाता है। नियमित रूप से ब्लड शुगर की जांच करना, उच्च फाइबर व कम ग्लाइसेमिक इंडेक्स वाला आहार लेना, दैनिक व्यायाम करना और निर्धारित दवाएं लेना आवश्यक है। अपने पैरों की नियमित जांच करें।",
      confidence: 0.96,
      citations: [
        { title: "डब्ल्यूएचओ मधुमेह दिशानिर्देश", url: "https://www.who.int" },
        { title: "राष्ट्रीय स्वास्थ्य पोर्टल मधुमेह जानकारी", url: "https://www.nhp.gov.in" }
      ]
    },
    dengue: {
      content: "डेंगू एडीज मच्छरों द्वारा फैलने वाला एक वायरल संक्रमण है। इसके लक्षणों में अचानक तेज बुखार, गंभीर सिरदर्द (विशेष रूप से आंखों के पीछे), जोड़ों/मांसपेशियों में दर्द और त्वचा पर चकत्ते शामिल हैं। शरीर में पानी की कमी न होने दें और पैरासिटामोल लें (इबुप्रोफेन/एस्पिरिन से बचें)। मच्छरों को पनपने से रोकने के लिए रुके हुए पानी को नष्ट करें।",
      confidence: 0.95,
      citations: [
        { title: "राष्ट्रीय वेक्टर जनित रोग नियंत्रण कार्यक्रम", url: "https://nvbdcp.gov.in" },
        { title: "सीडीसी डेंगू रोकथाम दिशानिर्देश", url: "https://www.cdc.gov" }
      ]
    },
    vaccination: {
      content: "टीकाकरण पोलियो, टिटनेस, हेपेटाइटिस और खसरा जैसी संक्रामक बीमारियों से आपकी सुरक्षा का एक सुरक्षित और प्रभावी तरीका है। सुनिश्चित करें कि शिशुओं और बच्चों को सार्वभौमिक टीकाकरण कार्यक्रम के तहत समय पर सभी टीके मिलें।",
      confidence: 0.97,
      citations: [
        { title: "सार्वभौमिक टीकाकरण कार्यक्रम दिशानिर्देश", url: "/citizen/vaccinations" },
        { title: "डब्ल्यूएचओ टीकाकरण कार्यक्रम", url: "https://www.who.int" }
      ]
    },
    pregnancy: {
      content: "स्वस्थ गर्भावस्था के लिए, नियमित रूप से जांच कराएं, आयरन और फोलिक एसिड से भरपूर पौष्टिक भोजन लें, सक्रिय रहें और बिना डॉक्टर की सलाह के कोई दवा न लें। तेज सिरदर्द, पैरों/चेहरे पर सूजन या योनि से रक्तस्राव जैसे चेतावनी संकेतों पर ध्यान दें।",
      confidence: 0.95,
      citations: [
        { title: "जननी सुरक्षा योजना कार्यक्रम", url: "/citizen/schemes" },
        { title: "डब्ल्यूएचओ प्रसव पूर्व देखभाल दिशानिर्देश", url: "https://www.who.int" }
      ]
    },
    hospital: {
      content: "आपके स्थान के आधार पर, निकटतम सुविधाएं हैं: 1. जिला सामान्य अस्पताल (2.4 किमी) - 24/7 आपातकालीन देखभाल; 2. सामुदायिक स्वास्थ्य केंद्र (4.1 किमी)। तत्काल एम्बुलेंस के लिए कृपया आपातकालीन केंद्र से संपर्क करें।",
      confidence: 0.98,
      citations: [
        { title: "राष्ट्रीय स्वास्थ्य सुविधा रजिस्ट्री", url: "/citizen/hospitals" }
      ]
    },
    default: {
      content: "नमस्ते! मैं आपका हेल्थगार्ड एआई सहायक हूँ। मैं लक्षणों, स्वास्थ्य देखभाल, अस्पतालों, टीकाकरण और सरकारी स्वास्थ्य योजनाओं के बारे में चिकित्सा जानकारी प्रदान कर सकता हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      confidence: 0.95,
      citations: [
        { title: "हेल्थगार्ड सूचना मैनुअल", url: "/" }
      ]
    }
  },
  ta: {
    emergency: {
      content: "⚠️ அவசரக்கால எச்சரிக்கை: உங்களுக்கு நெஞ்சு வலி, மூச்சு விடுவதில் சிரமம் அல்லது கடுமையான இரத்தப்போக்கு இருந்தால், உடனடியாக அவசர உதவி எண்ணை (108/112) தொடர்பு கொள்ளவும் அல்லது அருகிலுள்ள அவசர சிகிச்சை மையத்திற்குச் செல்லவும். நிமிர்ந்து உட்கார்ந்து, அமைதியாக இருங்கள்.",
      confidence: 0.99,
      citations: [
        { title: "தேசிய அவசரக்கால பதில் நெறிமுறை", url: "/emergency" },
        { title: "அமெரிக்க இதய சங்கம் அவசர சிகிச்சை", url: "https://www.heart.org" }
      ]
    },
    fever: {
      content: "காய்ச்சல் என்பது உங்கள் உடல் ஒரு தொற்றுநோய்க்கு எதிராக (இன்ஃப்ளூயன்ஸா, ஜலதோஷம் அல்லது டெங்கு போன்றவை) போராடுகிறது என்பதற்கான அறிகுறியாகும். போதுமான நீர் அருந்தவும், ஓய்வெடுக்கவும், உடல் வெப்பநிலையைக் கண்காணிக்கவும். வெப்பநிலை 103°F (39.4°C) ஐத் தாண்டினால் அல்லது 3 நாட்களுக்கு மேல் நீடித்தால் மருத்துவரை அணுகவும்.",
      confidence: 0.94,
      citations: [
        { title: "உலக சுகாதார அமைப்பு காய்ச்சல் வழிகாட்டுதல்கள்", url: "https://www.who.int" },
        { title: "ஹெல்த்கார்ட் தடுப்பு கையேடு", url: "/citizen/diseases" }
      ]
    },
    headache: {
      content: "தலைவலி மன அழுத்தம், நீரிழப்பு, சோர்வு அல்லது கண் அழுத்தத்தால் ஏற்படலாம். நிறைய தண்ணீர் குடிக்கவும், அமைதியான, இருண்ட அறையில் ஓய்வெடுக்கவும். திடீரென கடுமையான தலைவலியுடன் கழுத்து விறைப்பு, காய்ச்சல் அல்லது குழப்பம் ஏற்பட்டால் உடனடியாக சிகிச்சை பெறவும்.",
      confidence: 0.91,
      citations: [
        { title: "சர்வதேச தலைவலி சங்கம் வழிகாட்டி", url: "https://ihs-headache.org" }
      ]
    },
    diabetes: {
      content: "நீரிழிவு நோய் என்பது உடல் இரத்த குளுக்கோஸை சீராக்க முடியாத ஒரு நாள்பட்ட நிலை. இரத்த சர்க்கரை அளவை தவறாமல் கண்காணிப்பது, அதிக நார்ச்சத்துள்ள குறைந்த சர்க்கரை உணவை உட்கொள்வது, தினமும் உடற்பயிற்சி செய்வது மற்றும் பரிந்துரைக்கப்பட்ட மருந்துகளை எடுத்துக்கொள்வது முக்கியம்.",
      confidence: 0.96,
      citations: [
        { title: "உலக சுகாதார அமைப்பு நீரிழிவு வழிகாட்டுதல்கள்", url: "https://www.who.int" },
        { title: "தேசிய சுகாதார போர்டல் நீரிழிவு தகவல்", url: "https://www.nhp.gov.in" }
      ]
    },
    dengue: {
      content: "டெங்கு என்பது ஏடிஸ் கொசுக்களால் பரவும் ஒரு வைரஸ் தொற்று ஆகும். அறிகுறிகளில் திடீர் அதிக காய்ச்சல், கடுமையான தலைவலி (குறிப்பாக கண்களுக்குப் பின்னால்), மூட்டு/தசை வலி மற்றும் தோல் தடிப்புகள் ஆகியவை அடங்கும். உடலை நீரேற்றமாக வைத்திருங்கள் மற்றும் பாராசிட்டமால் எடுத்துக் கொள்ளுங்கள் (இபுப்ரோஃபென்/ஆஸ்பிரினைத் தவிர்க்கவும்). தேங்கி நிற்கும் தண்ணீரை அகற்றி கொசுக்கள் பெருகுவதைத் தடுக்கவும்.",
      confidence: 0.95,
      citations: [
        { title: "தேசிய திசையன் மூலம் பரவும் நோய் கட்டுப்பாட்டு திட்டம்", url: "https://nvbdcp.gov.in" },
        { title: "சிடிசி டெங்கு தடுப்பு வழிகாட்டுதல்கள்", url: "https://www.cdc.gov" }
      ]
    },
    vaccination: {
      content: "போலியோ, டெட்டனஸ், ஹெபடைடிஸ் மற்றும் தட்டம்மை போன்ற தொற்று நோய்களிலிருந்து உங்களைப் பாதுகாத்துக் கொள்ள தடுப்பூசிகள் பாதுகாப்பான மற்றும் பயனுள்ள வழியாகும். குழந்தைகள் உலகளாவிய தடுப்பூசி திட்டத்தின் கீழ் அனைத்து தடுப்பூசிகளையும் பெறுகிறார்களா என்பதை உறுதிப்படுத்திக் கொள்ளுங்கள்.",
      confidence: 0.97,
      citations: [
        { title: "உலகளாவிய தடுப்பூசி திட்டம்", url: "/citizen/vaccinations" },
        { title: "உலக சுகாதார அமைப்பு தடுப்பூசி அட்டவணை", url: "https://www.who.int" }
      ]
    },
    pregnancy: {
      content: "ஆரோக்கியமான கர்ப்ப காலத்திற்கு, வழக்கமான பரிசோதனைகளை மேற்கொள்ளுங்கள், இரும்புச்சத்து மற்றும் போலிக் அமிலம் நிறைந்த சத்தான உணவை உண்ணுங்கள், சுறுசுறுப்பாக இருங்கள். கடுமையான தலைவலி, கால்கள்/முகம் வீக்கம் அல்லது இரத்தப்போக்கு போன்ற எச்சரிக்கை அறிகுறிகளைக் கவனியுங்கள்.",
      confidence: 0.95,
      citations: [
        { title: "ஜனனி சுரக்ஷா யோஜனா திட்டம்", url: "/citizen/schemes" },
        { title: "உலக சுகாதார அமைப்பு கர்ப்பகால பராமரிப்பு வழிகாட்டுதல்கள்", url: "https://www.who.int" }
      ]
    },
    hospital: {
      content: "உங்கள் இருப்பிடத்தின் அடிப்படையில், அருகிலுள்ள வசதிகள்: 1. மாவட்ட பொது மருத்துவமனை (2.4 கிமீ) - 24/7 அவசர சிகிச்சை; 2. ஆரம்ப சுகாதார நிலையம் (4.1 கிமீ). ஆம்புலன்ஸ் தேவைப்பட்டால் அவசர மையத்தைத் தொடர்பு கொள்ளவும்.",
      confidence: 0.98,
      citations: [
        { title: "தேசிய சுகாதார வசதி பதிவேடு", url: "/citizen/hospitals" }
      ]
    },
    default: {
      content: "வணக்கம்! நான் உங்கள் ஹெல்த்கார்ட் AI உதவியாளர். அறிகுறிகள், நோய்கள், அருகிலுள்ள மருத்துவமனைகள், தடுப்பூசிகள் மற்றும் அரசு சுகாதாரத் திட்டங்கள் தொடர்பான மருத்துவத் தகவல்களை உங்களுக்கு வழங்க முடியும். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      confidence: 0.95,
      citations: [
        { title: "ஹெல்த்கார்ட் தகவல் கையேடு", url: "/" }
      ]
    }
  },
  or: {
    emergency: {
      content: "⚠️ ଜରୁରୀକାଳୀନ ସୂଚନା: ଯଦି ଆପଣ ଛାତିରେ ଯନ୍ତ୍ରଣା, ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ କିମ୍ବା ପ୍ରବଳ ରକ୍ତସ୍ରାବ ଅନୁଭବ କରୁଛନ୍ତି, ତେବେ ତୁରନ୍ତ ଜରୁରୀକାଳୀନ ନମ୍ବର (108/112) କୁ କଲ୍ କରନ୍ତୁ କିମ୍ବା ନିକଟସ୍ଥ ଡାକ୍ତରଖାନାକୁ ଯାଆନ୍ତୁ। ସିଧା ବସନ୍ତୁ, ଶାନ୍ତ ରୁହନ୍ତୁ ଏବଂ ଅଧିକ ଖେଳକୁଦ କରନ୍ତୁ ନାହିଁ।",
      confidence: 0.99,
      citations: [
        { title: "ଜାତୀୟ ଜରୁରୀକାଳୀନ ପ୍ରତିକ୍ରିୟା ପ୍ରୋଟୋକଲ୍", url: "/emergency" },
        { title: "ଏଏଚଏ ଜରୁରୀ ହୃଦୟ ଯତ୍ନ", url: "https://www.heart.org" }
      ]
    },
    fever: {
      content: "ଜ୍ୱର ସାଧାରଣତଃ ଏହି ସଙ୍କେତ ଦେଇଥାଏ ଯେ ଆପଣଙ୍କ ଶରୀର କୌଣସି ସଂକ୍ରମଣ (ଯେପରିକି ଫ୍ଲୁ, ଥଣ୍ଡା କିମ୍ବା ଡେଙ୍ଗୁ) ସହ ଲଢୁଛି। ପର୍ଯ୍ୟାପ୍ତ ପାଣି ପିଅନ୍ତୁ, ବିଶ୍ରାମ ନିଅନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଶରୀରର ତାପମାତ୍ରା ଉପରେ ନଜର ରଖନ୍ତୁ। ଯଦି ତାପମାତ୍ରା 103°F (39.4°C) ରୁ ଅଧିକ ହୁଏ କିମ୍ବା ୩ ଦିନରୁ ଅଧିକ ରହେ, ତେବେ ଡାକ୍ତରଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
      confidence: 0.94,
      citations: [
        { title: "ଡବ୍ଲୁଏଚଓ ଜ୍ୱର ପରିଚାଳନା ନିର୍ଦ୍ଦେଶାବଳୀ", url: "https://www.who.int" },
        { title: "ହେଲଥଗାର୍ଡ ପ୍ରତିରୋଧକ ମାନୁଆଲ୍", url: "/citizen/diseases" }
      ]
    },
    headache: {
      content: "ମୁଣ୍ଡବିନ୍ଧା ଚାପ, ଶରୀରରେ ଜଳ ଅଭାବ, କ୍ଲାନ୍ତି କିମ୍ବା ଆଖିର ଚାପ ଯୋଗୁଁ ହୋଇପାରେ। ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ, ଶାନ୍ତ ଏବଂ ଅନ୍ଧାର କୋଠରୀରେ ବିଶ୍ରାମ ନିଅନ୍ତୁ। ଯଦି ହଠାତ୍ ଅତି ଗମ୍ଭୀର ମୁଣ୍ଡବିନ୍ଧା ସହ ବେକ ଜଡ଼ିଯିବା କିମ୍ବା ଜ୍ୱର ଅନୁଭବ ହୁଏ, ତୁରନ୍ତ ଡାକ୍ତରଙ୍କ ସହାୟତା ନିଅନ୍ତୁ।",
      confidence: 0.91,
      citations: [
        { title: "ଆନ୍ତର୍ଜାତୀୟ ମୁଣ୍ଡବିନ୍ଧା ସମିତି ଗାଇଡ୍", url: "https://ihs-headache.org" }
      ]
    },
    diabetes: {
      content: "ମଧୁମେହ ଏକ ଦୀର୍ଘକାଳୀନ ରୋଗ ଯେଉଁଥିରେ ଶରୀର ରକ୍ତ ଶର୍କରାକୁ ନିୟନ୍ତ୍ରଣ କରିପାରେ ନାହିଁ। ନିୟମିତ ଭାବେ ରକ୍ତ ଶର୍କରା ଯାଞ୍ଚ କରିବା, ଉଚ୍ଚ ଫାଇବର ଏବଂ କମ୍ ଗ୍ଲାଇସେମିକ୍ ଯୁକ୍ତ ଆହାର ଖାଇବା, ନିୟମିତ ବ୍ୟାୟାମ କରିବା ଏବଂ ଔଷଧ ସେବନ କରିବା ଅତ୍ୟନ୍ତ ଆବଶ୍ୟକ ଅଟେ।",
      confidence: 0.96,
      citations: [
        { title: "ଡବ୍ଲୁଏଚଓ ମଧୁମେହ ନିର୍ଦ୍ଦେଶାବଳୀ", url: "https://www.who.int" },
        { title: "ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ପୋର୍ଟାଲ ମଧୁମେହ ସୂଚନା", url: "https://www.nhp.gov.in" }
      ]
    },
    dengue: {
      content: "ଡେଙ୍ଗୁ ଏଡିସ୍ ମଶା ଦ୍ୱାରା ବ୍ୟାପିଥାଏ। ଏହାର ଲକ୍ଷଣ ହେଉଛି ହଠାତ୍ ପ୍ରବଳ ଜ୍ୱର, ଭୟଙ୍କର ମୁଣ୍ଡବିନ୍ଧା (ବିଶେଷ କରି ଆଖି ପଛପଟେ), ଗଣ୍ଠି ଯନ୍ତ୍ରଣା ଏବଂ ଚର୍ମରେ ଲାଲ୍ ଦାଗ। ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ ଏବଂ ପାରାସିଟାମୋଲ୍ ସେବନ କରନ୍ତୁ (ଆଇବୁପ୍ରୋଫେନ୍/ଏସପିରିନ୍ ଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ)। ମଶା ବଂଶ ବୃଦ୍ଧି ରୋକିବା ପାଇଁ ଜମି ରହିଥିବା ପାଣିକୁ ନଷ୍ଟ କରନ୍ତୁ।",
      confidence: 0.95,
      citations: [
        { title: "ଭେକ୍ଟର ଜନିତ ରୋଗ ନିୟନ୍ତ୍ରଣ କାର୍ଯ୍ୟକ୍ରମ", url: "https://nvbdcp.gov.in" },
        { title: "ସିଡିସି ଡେଙ୍ଗୁ ନିୟନ୍ତ୍ରଣ ନିର୍ଦ୍ଦେଶାବଳୀ", url: "https://www.cdc.gov" }
      ]
    },
    vaccination: {
      content: "ଟିକାକରଣ ପୋଲିଓ, ଧନୁଷ୍ଟଙ୍କାର, ହେପାଟାଇଟିସ୍ ଏବଂ ହାଡ଼ଫୁଟି ଭଳି ସଂକ୍ରାମକ ରୋଗରୁ ରକ୍ଷା କରିବା ପାଇଁ ଏକ ସୁରକ୍ଷିତ ଏବଂ ପ୍ରଭାବଶାଳୀ ଉପାୟ ଅଟେ। ଶିଶୁ ଏବଂ ପିଲାମାନଙ୍କୁ ସମସ୍ତ ନିର୍ଦ୍ଧାରିତ ଟିକା ଠିକ୍ ସମୟରେ ଦିଅନ୍ତୁ।",
      confidence: 0.97,
      citations: [
        { title: "ସାର୍ବଜନୀନ ଟିକାକରଣ କାର୍ଯ୍ୟକ୍ରମ", url: "/citizen/vaccinations" },
        { title: "ଡବ୍ଲୁଏଚଓ ଟିକାକରଣ ସୂଚୀ", url: "https://www.who.int" }
      ]
    },
    pregnancy: {
      content: "ସୁସ୍ଥ ଗର୍ଭାବସ୍ଥା ପାଇଁ, ନିୟମିତ ଭାବେ ଡାକ୍ତରୀ ଯାଞ୍ଚ କରନ୍ତୁ, ଆଇରନ୍ ଏବଂ ଫୋଲିକ୍ ଏସିଡ୍ ଯୁକ୍ତ ପୁଷ୍ଟିକର ଖାଦ୍ୟ ଖାଆନ୍ତୁ, ସକ୍ରିୟ ରୁହନ୍ତୁ ଏବଂ ନିଜେ କୌଣସି ଔଷଧ ଖାଆନ୍ତୁ ନାହିଁ। ଅତ୍ୟଧିକ ମୁଣ୍ଡବିନ୍ଧା, ପାଦ/ମୁହଁ ଫୁଲିଯିବା କିମ୍ବା ରକ୍ତସ୍ରାବ ଭଳି ବିପଦ ସଙ୍କେତ ପ୍ରତି ସତର୍କ ରୁହନ୍ତୁ।",
      confidence: 0.95,
      citations: [
        { title: "ଜନନୀ ସୁରକ୍ଷା ଯୋଜନା", url: "/citizen/schemes" },
        { title: "ଡବ୍ଲୁଏଚଓ ଗର୍ଭାବସ୍ଥା ଯତ୍ନ ନିର୍ଦ୍ଦେଶାବଳୀ", url: "https://www.who.int" }
      ]
    },
    hospital: {
      content: "ଆପଣଙ୍କ ସ୍ଥାନ ଅନୁଯାୟୀ, ନିକଟସ୍ଥ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରଗୁଡିକ ହେଉଛି: 1. ଜିଲ୍ଲା ମୁଖ୍ୟ ଚିକିତ୍ସାଳୟ (2.4 କିମି) - ୨୪ ଘଣ୍ଟିଆ ଜରୁରୀ ଯତ୍ନ; 2. ଗୋଷ୍ଠୀ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (4.1 କିମି)। ଆମ୍ବୁଲାନ୍ସ ପାଇଁ ତୁରନ୍ତ ଜରୁରୀକାଳୀନ କେନ୍ଦ୍ର ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
      confidence: 0.98,
      citations: [
        { title: "ଜାତୀୟ ସ୍ୱାସ୍ଥ୍ୟ ସୁବିଧା ପଞ୍ଜିକରଣ", url: "/citizen/hospitals" }
      ]
    },
    default: {
      content: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ହେଲଥଗାର୍ଡ AI ସହାୟକ। ମୁଁ ଆପଣଙ୍କୁ ଲକ୍ଷଣ, ରୋଗ ପ୍ରତିରୋଧ, ନିକଟସ୍ଥ ଡାକ୍ତରଖାନା, ଟିକାକରଣ ଏବଂ ସରକାରୀ ଯୋଜନା ବିଷୟରେ ଚିକିତ୍ସା ସୂଚନା ଦେଇପାରିବି। ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
      confidence: 0.95,
      citations: [
        { title: "ହେଲଥଗାର୍ଡ ସୂଚନା ମାନୁଆଲ୍", url: "/" }
      ]
    }
  }
};

export async function sendChatMessage(message, languageCode = 'en') {
  const analysis = await runPipelineFromText(message);

  try {
    const { data } = await apiClient.post('/ai/chat', { message });
    if (data && data.reply) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        inReplyTo: message,
        aiAnalysis: {
          ...analysis,
          intent: {
            ...analysis.intent,
            label: data.source ? `Source: ${data.source}` : analysis.intent.label,
          },
        },
      };
    }
  } catch (err) {
    console.warn('Backend /ai/chat unavailable, using local healthcare assistant fallback:', err?.message || err);
  }

  return mockRequest(() => {
    const lang = HEALTHCARE_RESPONSES[languageCode] ? languageCode : 'en';
    const dict = HEALTHCARE_RESPONSES[lang];
    const msgLower = message.toLowerCase();

    // Check emergency triggers first
    if (
      msgLower.includes('urgent') ||
      msgLower.includes('emergency') ||
      msgLower.includes('chest pain') ||
      msgLower.includes('breathing') ||
      msgLower.includes('bleeding') ||
      msgLower.includes('दर्द') ||
      msgLower.includes('खून') ||
      msgLower.includes('வலி') ||
      msgLower.includes('இரத்தம்') ||
      msgLower.includes('ଯନ୍ତ୍ରଣା') ||
      msgLower.includes('ରକ୍ତ')
    ) {
      return {
        id: `msg_${Date.now()}_emergency`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.emergency
      };
    }

    if (msgLower.includes('fever') || msgLower.includes('temp') || msgLower.includes('बुखार') || msgLower.includes('कफ') || msgLower.includes('காய்ச்சல்') || msgLower.includes('ଜ୍ୱର')) {
      return {
        id: `msg_${Date.now()}_fever`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.fever
      };
    }

    if (msgLower.includes('headache') || msgLower.includes('migraine') || msgLower.includes('सिरदर्द') || msgLower.includes('தலைவலி') || msgLower.includes('ମୁଣ୍ଡବିନ୍ଧା')) {
      return {
        id: `msg_${Date.now()}_headache`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.headache
      };
    }

    if (msgLower.includes('diabet') || msgLower.includes('sugar') || msgLower.includes('मधुमेह') || msgLower.includes('நீரிழிவு') || msgLower.includes('ମଧୁମେହ')) {
      return {
        id: `msg_${Date.now()}_diabetes`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.diabetes
      };
    }

    if (msgLower.includes('dengue') || msgLower.includes('mosquito') || msgLower.includes('डेंगू') || msgLower.includes('டெங்கு') || msgLower.includes('ଡେଙ୍ଗୁ')) {
      return {
        id: `msg_${Date.now()}_dengue`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.dengue
      };
    }

    if (msgLower.includes('vaccin') || msgLower.includes('dose') || msgLower.includes('टीका') || msgLower.includes('தடுப்பூசி') || msgLower.includes('ଟିକା')) {
      return {
        id: `msg_${Date.now()}_vaccination`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.vaccination
      };
    }

    if (msgLower.includes('pregnan') || msgLower.includes('baby') || msgLower.includes('गर्भावस्था') || msgLower.includes('கர்ப்பம்') || msgLower.includes('ଗର୍ଭାବସ୍ଥା')) {
      return {
        id: `msg_${Date.now()}_pregnancy`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.pregnancy
      };
    }

    if (msgLower.includes('hospital') || msgLower.includes('clinic') || msgLower.includes('doctor') || msgLower.includes('अस्पताल') || msgLower.includes('மருத்துவமனை') || msgLower.includes('ଡାକ୍ତରଖାନା')) {
      return {
        id: `msg_${Date.now()}_hospital`,
        role: 'assistant',
        inReplyTo: message,
        aiAnalysis: analysis,
        ...dict.hospital
      };
    }

    return {
      id: `msg_${Date.now()}_default`,
      role: 'assistant',
      inReplyTo: message,
        aiAnalysis: analysis,
      ...dict.default
    };
  });
}
