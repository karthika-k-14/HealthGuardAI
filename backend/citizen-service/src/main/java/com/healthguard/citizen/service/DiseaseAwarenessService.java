package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiseaseAwarenessService {

    private final YouTubeService youTubeService;

    // Static internal model for multi-lingual disease knowledge base
    private static class DiseaseRecord {
        String id;
        String nameEn;
        String nameTa;
        String nameOr;
        String nameHi;
        String categoryEn;
        String categoryTa;
        String categoryOr;
        String categoryHi;
        String severity;
        String icon;

        Map<String, String> description = new HashMap<>();
        Map<String, List<String>> symptoms = new HashMap<>();
        Map<String, List<String>> prevention = new HashMap<>();
        Map<String, List<String>> governmentRecommendations = new HashMap<>();
        Map<String, String> treatment = new HashMap<>();
        List<String> symptomKeywordsEn = new ArrayList<>();
        List<String> symptomKeywordsTa = new ArrayList<>();
        List<String> symptomKeywordsOr = new ArrayList<>();
        List<String> symptomKeywordsHi = new ArrayList<>();
    }

    private static final List<DiseaseRecord> DISEASE_REGISTRY = new ArrayList<>();

    static {
        // 1. DENGUE
        DiseaseRecord dengue = new DiseaseRecord();
        dengue.id = "dengue";
        dengue.nameEn = "Dengue Fever";
        dengue.nameTa = "டெங்கு காய்ச்சல்";
        dengue.nameOr = "ଡେଙ୍ଗୁ ଜ୍ୱର";
        dengue.nameHi = "डेंगू बुखार";
        dengue.categoryEn = "Vector-borne Viral Disease";
        dengue.categoryTa = "கொசு பரப்பும் வைரஸ் நோய்";
        dengue.categoryOr = "ମଶା ବାହିତ ଭୂତାଣୁ ଜନିତ ରୋଗ";
        dengue.categoryHi = "मच्छर जनित वायरल रोग";
        dengue.severity = "High";
        dengue.icon = "Activity";

        dengue.description.put("en", "Dengue is a mosquito-borne viral infection transmitted by female Aedes mosquitoes. Early diagnosis and fluid management are crucial to prevent Dengue Hemorrhagic Fever.");
        dengue.description.put("ta", "டெங்கு என்பது ஏடிஸ் கொசுக்களால் பரவும் கடுமையான வைரஸ் காய்ச்சல். கடுமையான உடல் வலி, கண் பின்னால் வலி மற்றும் பிளேட்லெட் குறைவு இதன் முதன்மை அறிகுறிகள்.");
        dengue.description.put("or", "ଡେଙ୍ଗୁ ହେଉଛି ଏଡିସ୍ ମଶା କାମୁଡ଼ିବା ଦ୍ୱାରା ବ୍ୟାପୁଥିବା ଏକ ଭୂତାଣୁ ଜ୍ୱର। ପ୍ରଚୁର ପାଣି ପିଇବା ଏବଂ ପ୍ଲେଟଲେଟ୍ ତଦାରଖ କରିବା ଅତ୍ୟନ୍ତ ଜରୁରୀ।");
        dengue.description.put("hi", "डेंगू एडीज मच्छरों के काटने से फैलने वाला एक गंभीर वायरल संक्रमण है। तेज बुखार, आंखों के पीछे दर्द और प्लेटलेट्स की कमी इसके प्रमुख लक्षण हैं।");

        dengue.symptoms.put("en", List.of("Sudden high fever (104°F)", "Severe headache & pain behind eyes", "Severe joint and muscle pain", "Nausea and vomiting", "Skin rash appearing 2-5 days after fever"));
        dengue.symptoms.put("ta", List.of("திடீர் தீவிர காய்ச்சல் (104°F)", "கடுமையான தலைவலி மற்றும் கண் வலி", "மூட்டு மற்றும் தசை வலி", "குமட்டல் மற்றும் வாந்தி", "தோல் தடிப்புகள் (ரேஷஸ்)"));
        dengue.symptoms.put("or", List.of("ହଠାତ୍ ପ୍ରବଳ ଜ୍ୱର", "ମୁଣ୍ଡବିନ୍ଧା ଏବଂ ଆଖି ପଛପଟେ ଯନ୍ତ୍ରଣା", "ଗଣ୍ଠି ଏବଂ ମାଂସପେଶୀରେ ଯନ୍ତ୍ରଣା", "ବାନ୍ତି ଏବଂ ଦୁର୍ବଳତା", "ଚର୍ମରେ ଲାଲ ଦାଗ"));
        dengue.symptoms.put("hi", List.of("अचानक तेज बुखार (104°F)", "गंभीर सिरदर्द और आंखों के पीछे दर्द", "जोड़ों और मांसपेशियों में तेज दर्द", "जी मिचलाना और उल्टी", "त्वचा पर चकत्ते"));

        dengue.prevention.put("en", List.of("Avoid stagnant water in coolers, pots, and tires", "Use mosquito nets and insect repellents", "Wear full-sleeve light-colored clothing", "Support fogging drives in residential areas"));
        dengue.prevention.put("ta", List.of("தேங்கி நிற்கும் நன்னீரை வாரந்தோறும் அப்புறப்படுத்துங்கள்", "கொசு வலை மற்றும் கொசு விரட்டிகளைப் பயன்படுத்துங்கள்", "முழுக்கை ஆடைகளை அணியுங்கள்", "உள்ளூர் சுகாதார பணியாளர்களுக்கு ஒத்துழையுங்கள்"));
        dengue.prevention.put("or", List.of("ଘର ପାଖରେ କୌଣସି ସ୍ଥାନରେ ପାଣି ଜମିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ", "ମଶାରୀ ଏବଂ ମଶା ଧୂପ/ତେଲ ବ୍ୟବହାର କରନ୍ତୁ", "ପୂରା ହାତ ପୋଷାକ ପିନ୍ଧନ୍ତୁ", "ପାନୀୟ ଜଳ ପାତ୍ରକୁ ସର୍ବଦା ଢାଙ୍କି ରଖନ୍ତୁ"));
        dengue.prevention.put("hi", List.of("कूलर, गमलों और टायरों में पानी जमा न होने दें", "सोते समय मच्छरदानी और रिपेलेंट का उपयोग करें", "पूरी आस्तीन के कपड़े पहनें", "सप्ताह में एक बार ड्राई डे मनाएं"));

        dengue.governmentRecommendations.put("en", List.of(
                "National Vector Borne Disease Control Programme (NVBDCP) guidelines: Free NS1 ELISA testing available at all District Hospitals & PHCs",
                "Do NOT take Aspirin or Ibuprofen without prescription as they increase bleeding risk; use Paracetamol for fever",
                "Report cluster fever outbreaks immediately to your local ASHA worker or Urban Health Officer",
                "Emergency platelet support is subsidized under Ayushman Bharat PM-JAY"
        ));
        dengue.governmentRecommendations.put("ta", List.of(
                "அரசு மருத்துவமனைகளில் இலவச NS1 மற்றும் IgM எலிசா பரிசோதனை வசதி உண்டு",
                "ஆஸ்பிரின் (Aspirin), புரூஃபென் (Ibuprofen) மாத்திரைகளை சுயமாக சாப்பிடாதீர்கள்; பாராசிட்டமால் மட்டுமே பாதுகாப்பானது",
                "காய்ச்சல் நீடித்தால் உடனடியாக அருகிலுள்ள ஆரம்ப சுகாதார நிலையத்தை (PHC) அணுகவும்"
        ));
        dengue.governmentRecommendations.put("or", List.of(
                "ଜିଲ୍ଲା ସଦର ମହକୁମା ଡାକ୍ତରଖାନା ଏବଂ PHC ରେ ମାଗଣା ଡେଙ୍ଗୁ ପରୀକ୍ଷା ଉପଲବ୍ଧ",
                "ଡାକ୍ତରଙ୍କ ବିନା ପରାମର୍ଶରେ ଆସ୍ପିରିନ୍ କିମ୍ବା ବ୍ରୁଫେନ୍ ଖାଆନ୍ତୁ ନାହିଁ",
                "ଗ୍ରାମାଞ୍ଚଳରେ ଆଶା ଦିଦିଙ୍କ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ"
        ));
        dengue.governmentRecommendations.put("hi", List.of(
                "सरकारी अस्पतालों और PHC में मुफ्त NS1 एलिसा जांच की सुविधा उपलब्ध है",
                "बिना डॉक्टर की सलाह के एस्पिरिन या आईबुप्रोफेन न लें, केवल पैरासिटामोल का उपयोग करें",
                "मोहल्ले में फॉगिंग और जलजमाव की शिकायत तुरंत स्वास्थ्य अधिकारी को दें"
        ));

        dengue.treatment.put("en", "Bed rest, oral rehydration therapy (ORS, coconut water, soups), close monitoring of platelet count, and prompt hospitalization if warning signs appear.");
        dengue.treatment.put("ta", "முழு ஓய்வு, ORS கரைசல் மற்றும் நீர் ஆகாரங்கள் அதிகம் குடித்தல், பிளேட்லெட் எண்ணிக்கையைக் கண்காணித்தல்.");
        dengue.treatment.put("or", "ପର୍ଯ୍ୟାପ୍ତ ବିଶ୍ରାମ, ଓଆରଏସ୍ (ORS) ଏବଂ ତରଳ ଖାଦ୍ୟ ଗ୍ରହଣ, ନିୟମିତ ପ୍ଲେଟଲେଟ୍ ଯାଞ୍ଚ।");
        dengue.treatment.put("hi", "पर्याप्त आराम, ओआरएस (ORS) और तरल पदार्थों का अधिक सेवन, प्लेटलेट्स की नियमित जांच।");

        dengue.symptomKeywordsEn = List.of("fever", "high fever", "headache", "joint pain", "eye pain", "rash", "vomiting", "platelets");
        dengue.symptomKeywordsTa = List.of("காய்ச்சல்", "தலைவலி", "மூட்டு வலி", "வாந்தி");
        dengue.symptomKeywordsOr = List.of("ଜ୍ୱର", "ମୁଣ୍ଡବିନ୍ଧା", "ବାନ୍ତି", "ଯନ୍ତ୍ରଣା");
        dengue.symptomKeywordsHi = List.of("बुखार", "सिरदर्द", "जोड़ों का दर्द", "उल्टी", "दर्द");
        DISEASE_REGISTRY.add(dengue);

        // 2. MALARIA
        DiseaseRecord malaria = new DiseaseRecord();
        malaria.id = "malaria";
        malaria.nameEn = "Malaria";
        malaria.nameTa = "மலேரியா";
        malaria.nameOr = "ମ୍ୟାଲେରିଆ";
        malaria.nameHi = "मलेरिया";
        malaria.categoryEn = "Parasitic Vector-borne Disease";
        malaria.categoryTa = "ஒட்டுண்ணி கொசு நோய்";
        malaria.categoryOr = "ପରଜୀବୀ ଜନିତ ମଶା ରୋଗ";
        malaria.categoryHi = "परजीवी मच्छर जनित रोग";
        malaria.severity = "High";
        malaria.icon = "ShieldAlert";

        malaria.description.put("en", "Malaria is a life-threatening disease caused by Plasmodium parasites transmitted through bites of infected female Anopheles mosquitoes.");
        malaria.description.put("ta", "அனோபிலிஸ் கொசுக்களால் பரவும் பிளாஸ்மோடியம் ஒட்டுண்ணி தொற்று மலேரியா ஆகும். நடுக்கத்துடன் கூடிய காய்ச்சல் இதன் பிரதான அடையாளம்.");
        dengue.description.put("or", "ମ୍ୟାଲେରିଆ ହେଉଛି ଆନୋଫିଲିସ୍ ମଶା ଦ୍ୱାରା ବ୍ୟାପୁଥିବା ପ୍ଲାଜମୋଡିୟମ୍ ପରଜୀବୀ ରୋଗ। ଥଣ୍ଡା ଲାଗି କମ୍ପ ସହ ଜ୍ୱର ଏହାର ପ୍ରମୁଖ ଲକ୍ଷଣ।");
        malaria.description.put("hi", "मलेरिया एनाफिलीज मच्छर के काटने से फैलने वाला प्लाज्मोडियम परजीवी संक्रमण है। ठंड लगकर तेज बुखार आना इसका मुख्य लक्षण है।");

        malaria.symptoms.put("en", List.of("Shaking chills that can range from moderate to severe", "High fever returning every 24-48 hours", "Profuse sweating as body temperature drops", "Headache, fatigue, and muscle aches"));
        malaria.symptoms.put("ta", List.of("நடுக்கத்துடன் கூடிய குளிர் காய்ச்சல்", "வியர்த்து வடிந்து காய்ச்சல் குறைதல்", "அதிக உடல் சோர்வு மற்றும் தலைவலி", "தசை வலி மற்றும் அஜீரணம்"));
        malaria.symptoms.put("or", List.of("ଥରି ଥରି ପ୍ରବଳ ଜ୍ୱର ଆସିବା", "ପ୍ରଚୁର ଝାଳ ବାହାରି ଜ୍ୱର ଛାଡିବା", "ମୁଣ୍ଡବିନ୍ଧା ଏବଂ ଅତ୍ୟଧିକ ଦୁର୍ବଳତା", "ମାଂସପେଶୀ ଯନ୍ତ୍ରଣା"));
        malaria.symptoms.put("hi", List.of("कंपकंपी के साथ तेज बुखार आना", "पसीना आकर बुखार का उतरना", "गंभीर सिरदर्द और बदन दर्द", "उल्टी और कमजोरी महसूस होना"));

        malaria.prevention.put("en", List.of("Sleep inside Long Lasting Insecticidal Nets (LLINs)", "Eliminate standing water near residences", "Apply mosquito repellents during evening hours", "Indoor residual spraying (IRS)"));
        malaria.prevention.put("ta", List.of("பூச்சிக்கொல்லி பூசப்பட்ட கொசு வலைகளில் உறங்குங்கள்", "வீட்டு வாசலில் நீர் தேங்குவதை தடுத்து வேப்ப எண்ணெய் ஊற்றுங்கள்", "கொசு விரட்டிகளைப் பயன்படுத்துங்கள்"));
        malaria.prevention.put("or", List.of("କୀଟନାଶକ ଯୁକ୍ତ ମଶାରୀ (LLIN) ତଳେ ଶୁଅନ୍ତୁ", "ଡାମଣ (DAMaN) ଅଭିଯାନ ସହାୟତା ନିଅନ୍ତୁ", "ଘର ଚାରିପାଖ ପରିଷ୍କାର ରଖନ୍ତୁ"));
        malaria.prevention.put("hi", List.of("कीटनाशक युक्त मच्छरदानी (LLIN) का इस्तेमाल करें", "शाम के समय खिड़की-दरवाजे बंद रखें", "नालियों में कीटनाशक का छिड़काव करवाएं"));

        malaria.governmentRecommendations.put("en", List.of(
                "National Malaria Elimination Programme (NMEP): Free Rapid Diagnostic Test (RDT) and blood slide examination at all health centers",
                "Complete full course of Artemisinin-based Combination Therapy (ACT) as prescribed; do not stop early",
                "Special surveillance under DAMaN initiative in endemic zones"
        ));
        malaria.governmentRecommendations.put("ta", List.of(
                "ஆரம்ப சுகாதார நிலையங்களில் இலவச மலேரியா ரத்தப் பரிசோதனை மற்றும் மருந்து மாத்திரைகள் பெறலாம்",
                "மருத்துவர் பரிந்துரைத்த ACT மருந்து மாத்திரைகளை முழுமையாக உட்கொள்ள வேண்டும்"
        ));
        malaria.governmentRecommendations.put("or", List.of(
                "ଓଡ଼ିଶା ସରକାରଙ୍କ 'ଦମନ' (DAMaN) ଯୋଜନାରେ ମାଗଣା ଯାଞ୍ଚ ଓ ଔଷଧ ଉପଲବ୍ଧ",
                "ଆଶା ଦିଦିଙ୍କ ଠାରୁ RDT କିଟ୍ ଦ୍ୱାରା ତୁରନ୍ତ ପରୀକ୍ଷା କରାଇ ନିଅନ୍ତୁ"
        ));
        malaria.governmentRecommendations.put("hi", List.of(
                "सभी स्वास्थ्य केंद्रों पर आरडीटी (RDT) किट द्वारा मुफ्त मलेरिया जांच उपलब्ध है",
                "डॉक्टर द्वारा दी गई एसीटी (ACT) दवा का पूरा कोर्स अवश्य समाप्त करें"
        ));

        malaria.treatment.put("en", "Prescription antimalarial therapy (ACT or Chloroquine based on species), supportive antipyretics, and adequate hydration.");
        malaria.treatment.put("ta", "மருத்துவர் பரிந்துரைக்கும் மலேரியா எதிர்ப்பு மருந்துகள் மற்றும் போதுமான நீர்ச்சத்து பராமரிப்பு.");
        malaria.treatment.put("or", "ଡାକ୍ତରୀ ଆଣ୍ଟି-ମ୍ୟାଲେରିଆଲ୍ ଔଷଧ ସେବନ ଓ ପ୍ରଚୁର ବିଶ୍ରାମ।");
        malaria.treatment.put("hi", "एंटी-मलेरियल दवाइयां, बुखार नियंत्रण के उपाय और पौष्टिक आहार।");

        malaria.symptomKeywordsEn = List.of("fever", "chills", "shivering", "sweating", "headache", "cold fever", "malaria");
        malaria.symptomKeywordsTa = List.of("காய்ச்சல்", "குளிர்", "நடுக்கம்", "தலைவலி");
        malaria.symptomKeywordsOr = List.of("ଜ୍ୱର", "ଥଣ୍ଡା", "କମ୍ପ");
        malaria.symptomKeywordsHi = List.of("बुखार", "ठंड", "कंपकंपी", "सिरदर्द");
        DISEASE_REGISTRY.add(malaria);

        // 3. TUBERCULOSIS (TB)
        DiseaseRecord tb = new DiseaseRecord();
        tb.id = "tuberculosis";
        tb.nameEn = "Tuberculosis (TB)";
        tb.nameTa = "காசநோய் (TB)";
        tb.nameOr = "ଯକ୍ଷ୍ମା (TB)";
        tb.nameHi = "तपेदिक / टीबी";
        tb.categoryEn = "Bacterial Respiratory Disease";
        tb.categoryTa = "சுவாச பாக்டீரியா நோய்";
        tb.categoryOr = "ଶ୍ୱାସକ୍ରିୟା ଜନିତ ବ୍ୟାକ୍ଟେରିଆ ରୋଗ";
        tb.categoryHi = "श्वसन जीवाणु रोग";
        tb.severity = "High";
        tb.icon = "Stethoscope";

        tb.description.put("en", "Tuberculosis is an infectious disease caused by Mycobacterium tuberculosis, primarily attacking the lungs. It spreads through microscopic droplets released into the air by coughs or sneezes.");
        tb.description.put("ta", "காசநோய் என்பது மைக்கோபாக்டீரியம் காசநோய் கிருமியால் ஏற்படும் தீவிர தொற்றுநோய். இருமல் மூலமாக காற்றில் பரவுகிறது. இரண்டு வாரத்திற்கு மேல் இருமல் இருந்தால் பரிசோதனை அவசியம்.");
        tb.description.put("or", "ଯକ୍ଷ୍ମା ହେଉଛି ଫୁସଫୁସକୁ ଆକ୍ରାନ୍ତ କରୁଥିବା ଏକ ସଂକ୍ରାମକ ରୋଗ। ଦୁଇ ସପ୍ତାହରୁ ଅଧିକ ସମୟ କାଶ ରହିଲେ ତୁରନ୍ତ ଡାକ୍ତରୀ ପରୀକ୍ଷା କରାଇବା ଉଚିତ।");
        tb.description.put("hi", "टीबी फेफड़ों को प्रभावित करने वाला एक गंभीर संक्रामक रोग है जो हवा में ड्रॉपलेट्स के जरिए फैलता है। 2 हफ्ते से अधिक खांसी होने पर तुरंत जांच जरूरी है।");

        tb.symptoms.put("en", List.of("Persistent cough lasting more than 2 weeks", "Coughing up blood or rust-colored sputum", "Chest pain during breathing or coughing", "Unexplained weight loss and fatigue", "Night sweats and mild evening fever"));
        tb.symptoms.put("ta", List.of("2 வாரங்களுக்கு மேல் தொடரும் இருமல்", "இருமலில் ரத்தம் அல்லது சளி வெளிப்படுதல்", "நெஞ்சு வலி மற்றும் மூச்சு விடுவதில் சிரமம்", "திடீர் எடை இழப்பு மற்றும் இரவு வியர்வை", "மாலை நேர மிதமான காய்ச்சல்"));
        tb.symptoms.put("or", List.of("୨ ସପ୍ତାହରୁ ଅଧିକ କାଶ ଲାଗିରହିବା", "କାଶରେ ରକ୍ତ ପଡିବା", "ଛାତିରେ ଯନ୍ତ୍ରଣା ଏବଂ ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ", "ଓଜନ ହ୍ରାସ ଏବଂ ରାତିରେ ପ୍ରବଳ ଝାଳ ବାହାରିବା"));
        tb.symptoms.put("hi", List.of("2 सप्ताह से अधिक समय तक लगातार खांसी", "खांसी में खून या बलगम आना", "सीने में दर्द और सांस लेने में तकलीफ", "अकारण वजन घटना और कमजोरी", "रात में पसीना आना और हल्का बुखार"));

        tb.prevention.put("en", List.of("BCG vaccination in infants", "Cover mouth and nose when coughing or sneezing", "Ensure adequate ventilation and sunlight in living spaces", "Complete full treatment to avoid Multi-Drug Resistant TB (MDR-TB)"));
        tb.prevention.put("ta", List.of("பச்சிளங்குழந்தைகளுக்கு பிசிஜி (BCG) தடுப்பூசி போடுதல்", "இருமும் போதும் தும்மும் போதும் முகக்கவசம் அணிதல்", "வீட்டில் நல்ல காற்றோட்டம் மற்றும் சூரிய வெளிச்சம் இருப்பதை உறுதிசெய்தல்"));
        tb.prevention.put("or", List.of("ନବଜାତ ଶିଶୁଙ୍କୁ ବିସିଜି (BCG) ଟିକା ଦିଅନ୍ତୁ", "କାଶିବା ସମୟରେ ରୁମାଲ୍ ବ୍ୟବହାର କରନ୍ତୁ", "ଘରେ ଭଲ ବାୟୁ ଚଳାଚଳ ସୁନିଶ୍ଚିତ କରନ୍ତୁ"));
        tb.prevention.put("hi", List.of("शिशुओं को जन्म के समय बीसीजी (BCG) का टीका लगवाएं", "खांसते-छींकते समय मुंह पर रुमाल रखें", "घरों में ताजी हवा और धूप का प्रबंध रखें"));

        tb.governmentRecommendations.put("en", List.of(
                "National TB Elimination Programme (NTEP): Free CBNAAT / Truenat diagnostic testing at all Government TB Centers",
                "Nikshay Poshan Yojana: Financial nutritional support of ₹500/month directly deposited to patient's bank account",
                "Free DOTS (Directly Observed Therapy Short-Course) medicines provided across all PHCs",
                "Call 1800-11-6666 (National TB Helpline) for confidential support"
        ));
        tb.governmentRecommendations.put("ta", List.of(
                "அரசு மருத்துவமனைகளில் இலவச நிக்ஷே (Nikshay) பரிசோதனை மற்றும் DOTS மருந்துகள்",
                "நிக்ஷே போஷன் யோஜனா மூலம் ஊட்டச்சத்துக்காக மாதம் ₹500 வங்கி கணக்கில் வரவு வைக்கப்படுகிறது",
                "தேசிய காசநோய் உதவி எண்: 1800-11-6666"
        ));
        tb.governmentRecommendations.put("or", List.of(
                "ନିକ୍ଷୟ ପୋଷଣ ଯୋଜନା ଅଧୀନରେ ରୋଗୀଙ୍କୁ ପ୍ରତିମାସ ₹୫୦୦ ସିଧାସଳଖ ବ୍ୟାଙ୍କ ଖାତାରେ ମିଳେ",
                "ପ୍ରତ୍ୟେକ ସରକାରୀ ହସ୍ପିଟାଲରେ ମାଗଣା DOTS ଔଷଧ ଉପଲବ୍ଧ"
        ));
        tb.governmentRecommendations.put("hi", List.of(
                "निक्षय पोषण योजना के तहत टीबी मरीजों को हर महीने ₹500 की पोषण सहायता",
                "सभी सरकारी स्वास्थ्य केंद्रों पर मुफ्त सीबीनाट (CBNAAT) जांच और डॉट्स (DOTS) दवाएं उपलब्ध हैं",
                "राष्ट्रीय टीबी टोल-फ्री हेल्पलाइन: 1800-11-6666"
        ));

        tb.treatment.put("en", "6-9 months of standard first-line antibiotic regimen (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol). Must be taken under medical guidance without interruption.");
        tb.treatment.put("ta", "6 முதல் 9 மாதங்கள் வரை தவறாமல் DOTS மாத்திரைகள் எடுத்துக்கொள்ள வேண்டும்.");
        tb.treatment.put("or", "୬ ରୁ ୯ ମାସ ପର୍ଯ୍ୟନ୍ତ ନିରନ୍ତର ଔଷଧ ସେବନ କରନ୍ତୁ। ମଝିରେ ବନ୍ଦ କରନ୍ତୁ ନାହିଁ।");
        tb.treatment.put("hi", "6 से 9 महीने तक लगातार एंटी-टीबी दवाओं का कोर्स पूरा करें। बीच में दवा बिल्कुल न छोड़ें।");

        tb.symptomKeywordsEn = List.of("cough", "persistent cough", "chest pain", "blood in cough", "night sweats", "weight loss", "tuberculosis", "tb");
        tb.symptomKeywordsTa = List.of("இருமல்", "சளி", "நெஞ்சு வலி", "எடை குறைவு");
        tb.symptomKeywordsOr = List.of("କାଶ", "ଛାତି ଯନ୍ତ୍ରଣା", "ରକ୍ତ କାଶ");
        tb.symptomKeywordsHi = List.of("खांसी", "बलगम", "छाती में दर्द", "वजन घटना");
        DISEASE_REGISTRY.add(tb);

        // 4. COVID-19
        DiseaseRecord covid = new DiseaseRecord();
        covid.id = "covid";
        covid.nameEn = "COVID-19 (Coronavirus)";
        covid.nameTa = "கொரோனா (COVID-19)";
        covid.nameOr = "କୋଭିଡ-୧୯ (କରୋନା)";
        covid.nameHi = "कोविड-19 (कोरोना वायरस)";
        covid.categoryEn = "Viral Respiratory Pandemic";
        covid.categoryTa = "சுவாச வைரஸ் தொற்று";
        covid.categoryOr = "ଶ୍ୱାସକ୍ରିୟା ଜନିତ ଭୂତାଣୁ ରୋଗ";
        covid.categoryHi = "श्वसन वायरल रोग";
        covid.severity = "Medium";
        covid.icon = "Biohazard";

        covid.description.put("en", "COVID-19 is a contagious respiratory illness caused by the SARS-CoV-2 coronavirus, spreading primarily via aerosolized droplets.");
        covid.description.put("ta", "கொரோனா வைரஸ் காற்று வழியே பரவும் தீவிர சுவாச தொற்றுநோய். காய்ச்சல், தொடர் இருமல் மற்றும் சுவை/வாசனை இழப்பு இதன் அறிகுறிகள்.");
        covid.description.put("or", "କୋଭିଡ଼-୧୯ ସାର୍ସ-କୋଭ୍-୨ ଭୂତାଣୁ ଦ୍ୱାରା ବ୍ୟାପୁଥିବା ଏକ ସଂକ୍ରାମକ ଶ୍ୱାସ ରୋଗ।");
        covid.description.put("hi", "कोविड-19 सार्स-सीओवी-2 वायरस के कारण होने वाला संक्रामक श्वसन रोग है जो सांस की बूंदों से फैलता है।");

        covid.symptoms.put("en", List.of("Fever or chills", "Dry cough and shortness of breath", "Loss of taste or smell", "Fatigue and sore throat", "Headache and body aches"));
        covid.symptoms.put("ta", List.of("காய்ச்சல் மற்றும் குளிர்", "வறட்டு இருமல் மற்றும் மூச்சுத் திணறல்", "சுவை மற்றும் வாசனை உணர்வு இழப்பு", "தொண்டை வலி மற்றும் அதிக சோர்வு"));
        covid.symptoms.put("or", List.of("ଜ୍ୱର କିମ୍ବା ଥଣ୍ଡା", "ଶୁଖିଲା କାଶ ଓ ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ", "ସ୍ୱାଦ ଏବଂ ବାସ୍ନା ଚାଲିଯିବା", "ଗଳା ଦରଜ ଓ ଶରୀର ଯନ୍ତ୍ରଣା"));
        covid.symptoms.put("hi", List.of("बुखार और ठंड लगना", "सूखी खांसी और सांस लेने में कठिनाई", "स्वाद या गंध की पहचान खो जाना", "गले में खराश और अत्यधिक थकान"));

        covid.prevention.put("en", List.of("Wear well-fitted masks in crowded indoor settings", "Maintain hand hygiene using soap or sanitizer", "Keep vaccinations and booster doses up to date", "Isolate if experiencing symptoms"));
        covid.prevention.put("ta", List.of("கூட்ட நெரிசலில் முகக்கவசம் அணிதல்", "சோப்பு அல்லது சானிடைசரால் கைகளை அடிக்கடி கழுவுதல்", "முழுமையான தடுப்பூசி செலுத்துதல்"));
        covid.prevention.put("or", List.of("ମାସ୍କ ପିନ୍ଧନ୍ତୁ ଏବଂ ସାମାଜିକ ଦୂରତା ରକ୍ଷା କରନ୍ତୁ", "ନିୟମିତ ହାତ ଧୁଅନ୍ତୁ", "ଟୀକାକରଣ ନିଶ୍ଚୟ କରାନ୍ତୁ"));
        covid.prevention.put("hi", List.of("मास्क का प्रयोग करें और भीड़-भाड़ से बचें", "साबुन से बार-बार हाथ धोएं", "टीकाकरण व बूस्टर डोज अवश्य लगवाएं"));

        covid.governmentRecommendations.put("en", List.of(
                "CoWIN vaccination portal records your vaccination digital credentials",
                "Free RT-PCR and RAT testing available at government test centers",
                "Monitor oxygen saturation (SpO2) with pulse oximeter; seek immediate medical care if below 94%"
        ));
        covid.governmentRecommendations.put("ta", List.of(
                "அரசு மருத்துவமனைகளில் இலவச RT-PCR கொரோனா பரிசோதனை செய்யப்படுகிறது",
                "ஆக்சிஜன் அளவு 94% க்குக் கீழே குறைந்தால் அவசர சிகிச்சை பிரிவை அணுகவும்"
        ));
        covid.governmentRecommendations.put("or", List.of(
                "ସରକାରୀ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ରରେ ମାଗଣା RT-PCR ପରୀକ୍ଷା ଉପଲବ୍ଧ",
                "ଅକ୍ସିଜେନ୍ ସ୍ତର ୯୪% ରୁ କମିଲେ ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଯାଆନ୍ତୁ"
        ));
        covid.governmentRecommendations.put("hi", List.of(
                "सरकारी केंद्रों पर मुफ्त आरटी-पीसीआर और एंटीजन जांच की सुविधा है",
                "ऑक्सीजन स्तर (SpO2) 94% से कम होने पर तुरंत अस्पताल से संपर्क करें"
        ));

        covid.treatment.put("en", "Symptomatic treatment, hydration, pulse oximetry monitoring, and physician consultation for antivirals if high-risk.");
        covid.treatment.put("ta", "தனிமைப்படுத்துதல், நீர்ச்சத்து மற்றும் மருத்துவ கண்காணிப்பு.");
        covid.treatment.put("or", "ଆଇସୋଲେସନ୍, ପର୍ଯ୍ୟାପ୍ତ ଜଳପାନ ଓ ଡାକ୍ତରୀ ପରାମର୍ଶ।");
        covid.treatment.put("hi", "आइसोलेशन, पर्याप्त पानी, पेरासिटामोल और डॉक्टर के निर्देशानुसार दवाइयां।");

        covid.symptomKeywordsEn = List.of("fever", "cough", "dry cough", "loss of taste", "loss of smell", "breathlessness", "sore throat", "covid", "corona");
        covid.symptomKeywordsTa = List.of("காய்ச்சல்", "இருமல்", "சுவை இழப்பு", "மூச்சுத்திணறல்");
        covid.symptomKeywordsOr = List.of("ଜ୍ୱର", "କାଶ", "ଶ୍ୱାସକଷ୍ଟ");
        covid.symptomKeywordsHi = List.of("बुखार", "खांसी", "सांस फूलना", "स्वाद न आना");
        DISEASE_REGISTRY.add(covid);

        // 5. TYPHOID
        DiseaseRecord typhoid = new DiseaseRecord();
        typhoid.id = "typhoid";
        typhoid.nameEn = "Typhoid Fever";
        typhoid.nameTa = "டைபாய்டு காய்ச்சல்";
        typhoid.nameOr = "ଟାଇଫଏଡ୍ ଜ୍ୱର";
        typhoid.nameHi = "टाइफाइड (मोतीझरा)";
        typhoid.categoryEn = "Waterborne Bacterial Infection";
        typhoid.categoryTa = "நீர் மற்றும் உணவு தொற்று நோய்";
        typhoid.categoryOr = "ଜଳବାହିତ ଜୀବାଣୁ ରୋଗ";
        typhoid.categoryHi = "जलजनित जीवाणु संक्रमण";
        typhoid.severity = "Medium";
        typhoid.icon = "AlertCircle";

        typhoid.description.put("en", "Typhoid fever is a systemic bacterial infection caused by Salmonella Typhi, usually spread through contaminated water or unhygienic food.");
        typhoid.description.put("ta", "சால்மோனெல்லா டைபி பாக்டீரியாவால் அசுத்தமான நீர் மற்றும் உணவின் மூலம் பரவும் குடல் காய்ச்சல் ஆகும்.");
        typhoid.description.put("or", "ଟାଇଫଏଡ୍ ହେଉଛି ଦୂଷିତ ଜଳ ଏବଂ ଖାଦ୍ୟ ଯୋଗୁଁ ହେଉଥିବା ସାଲମୋନେଲା ଟାଇଫି ବ୍ୟାକ୍ଟେରିଆ ଜନିତ ରୋଗ।");
        typhoid.description.put("hi", "टाइफाइड साल्मोनेला टाइफी बैक्टीरिया से दूषित पानी और भोजन के माध्यम से फैलने वाला संक्रमण है।");

        typhoid.symptoms.put("en", List.of("Prolonged high fever with step-ladder rise pattern", "Severe stomach pain and gastrointestinal upset", "Constipation or diarrhea", "Coated white tongue and loss of appetite"));
        typhoid.symptoms.put("ta", List.of("படிப்படியாக அதிகரிக்கும் நீடித்த காய்ச்சல்", "வயிற்று வலி மற்றும் செரிமானக் கோளாறு", "மலச்சிக்கல் அல்லது வயிற்றுப்போக்கு", "நாக்கில் வெள்ளைப் படலம் மற்றும் பசியின்மை"));
        typhoid.symptoms.put("or", List.of("ଦିନକୁ ଦିନ ବଢୁଥିବା ନିରନ୍ତର ଜ୍ୱର", "ପେଟ ଯନ୍ତ୍ରଣା ଏବଂ ଭୋକ ନଲାଗିବା", "ଝାଡ଼ା କିମ୍ବା କୋଷ୍ଠକାଠିନ୍ୟ", "ଜିଭରେ ଧଳା ପରସ୍ତ ପଡିବା"));
        typhoid.symptoms.put("hi", List.of("लगातार बढ़ता हुआ तेज बुखार", "पेट में तेज दर्द और मरोड़", "कब्ज या दस्त की शिकायत", "जीभ पर सफेद परत जमना और भूख न लगना"));

        typhoid.prevention.put("en", List.of("Drink boiled or reliably filtered water", "Wash hands thoroughly with soap before meals", "Avoid raw, uncovered street food", "Typhoid Conjugate Vaccine (TCV)"));
        typhoid.prevention.put("ta", List.of("நன்றாக கொதிக்க வைத்த ஆறிய நீரையே அருந்தவும்", "சாப்பிடும் முன் கைகளை சோப்பால் கழுவுங்கள்", "திறந்த வெளியில் விற்கப்படும் உணவுகளைத் தவிர்க்கவும்"));
        typhoid.prevention.put("or", List.of("ସର୍ବଦା ଫୁଟା ପାଣି କିମ୍ବା ବିଶୁଦ୍ଧ ପାଣି ପିଅନ୍ତୁ", "ଖାଇବା ପୂର୍ବରୁ ସାବୁନରେ ହାତ ଧୁଅନ୍ତୁ", "ବାସି ଓ ଖୋଲା ଖାଦ୍ୟ ଖାଆନ୍ତୁ ନାହିଁ"));
        typhoid.prevention.put("hi", List.of("उबला या फिल्टर किया हुआ पानी ही पिएं", "खाने से पहले साबुन से हाथ धोएं", "सड़क किनारे खुले में बिकने वाले भोजन से बचें"));

        typhoid.governmentRecommendations.put("en", List.of(
                "Get blood culture or Widal test conducted at recognized government PHC laboratories",
                "Complete full antibiotics course to prevent chronic carrier state",
                "Typhoid conjugate vaccines are recommended in municipal school health drives"
        ));
        typhoid.governmentRecommendations.put("ta", List.of(
                "அரசு ஆரம்ப சுகாதார நிலையங்களில் வைடால் (Widal) மற்றும் ரத்தப் பரிசோதனை வசதி உள்ளது",
                "மருத்துவர் அறிவுரைப்படி முழுமையான ஆண்டிபயாடிக் மாத்திரைகளை உட்கொள்ள வேண்டும்"
        ));
        typhoid.governmentRecommendations.put("or", List.of(
                "ସରକାରୀ ଡାକ୍ତରଖାନାରେ ୱିଡାଲ୍ (Widal) ପରୀକ୍ଷା କରାନ୍ତୁ",
                "ଆଣ୍ଟିବାୟୋଟିକ୍ର ସମ୍ପୂର୍ଣ୍ଣ କୋର୍ସ ନିୟମିତ ଭାବେ ଶେଷ କରନ୍ତୁ"
        ));
        typhoid.governmentRecommendations.put("hi", List.of(
                "सरकारी स्वास्थ्य केंद्र पर विडाल (Widal) या ब्लड कल्चर टेस्ट करवाएं",
                "एंटीबायोटिक्स का कोर्स बीच में न छोड़ें ताकि बीमारी दोबारा न उभरे"
        ));

        typhoid.treatment.put("en", "Targeted antibiotics prescribed by a physician, oral rehydration, easily digestible bland diet.");
        typhoid.treatment.put("ta", "ஆண்டிபயாடிக் மருந்துகள் மற்றும் எளிதில் செரிமானமாகும் உணவுகள்.");
        typhoid.treatment.put("or", "ଡାକ୍ତରଙ୍କ ନିର୍ଦ୍ଦେଶ ଅନୁଯାୟୀ ଆଣ୍ଟିବାୟୋଟିକ୍ ଏବଂ ସହଜ ପାଚ୍ୟ ଖାଦ୍ୟ।");
        typhoid.treatment.put("hi", "डॉक्टर द्वारा अनुशंसित एंटीबायोटिक कोर्स, ओआरएस और हल्का सुपाच्य भोजन।");

        typhoid.symptomKeywordsEn = List.of("fever", "stomach pain", "abdominal pain", "diarrhea", "constipation", "headache", "typhoid");
        typhoid.symptomKeywordsTa = List.of("காய்ச்சல்", "வயிற்று வலி", "வயிற்றுப்போக்கு");
        typhoid.symptomKeywordsOr = List.of("ଜ୍ୱର", "ପେଟ ଯନ୍ତ୍ରଣା", "ଝାଡ଼ା");
        typhoid.symptomKeywordsHi = List.of("बुखार", "पेट दर्द", "दस्त", "कब्ज");
        DISEASE_REGISTRY.add(typhoid);

        // 6. VIRAL FEVER / INFLUENZA
        DiseaseRecord viral = new DiseaseRecord();
        viral.id = "viral_fever";
        viral.nameEn = "Viral Fever & Flu";
        viral.nameTa = "வைரஸ் காய்ச்சல் (ஃப்ளூ)";
        viral.nameOr = "ଭୂତାଣୁ ଜନିତ ଜ୍ୱର (ଫ୍ଲୁ)";
        viral.nameHi = "वायरल बुखार और फ्लू";
        viral.categoryEn = "Acute Viral Illness";
        viral.categoryTa = "பருவகால வைரஸ் காய்ச்சல்";
        viral.categoryOr = "ଋତୁକାଳୀନ ଭୂତାଣୁ ଜ୍ୱର";
        viral.categoryHi = "मौसमी वायरल संक्रमण";
        viral.severity = "Low";
        viral.icon = "Thermometer";

        viral.description.put("en", "Seasonal acute viral illness characterized by fever, body aches, and nasal congestion, resolving usually within 3-5 days with symptomatic support.");
        viral.description.put("ta", "பருவநிலை மாற்றங்களால் ஏற்படும் பொதுவான வைரஸ் காய்ச்சல். உடல் வலி, தொண்டை கரகரப்பு மற்றும் சளி இதன் பொதுவான அறிகுறிகள்.");
        viral.description.put("or", "ଋତୁ ପରିବର୍ତ୍ତନ ସମୟରେ ହେଉଥିବା ସାଧାରଣ ଭୂତାଣୁ ଜ୍ୱର।");
        viral.description.put("hi", "मौसम बदलने पर होने वाला आम वायरल बुखार जो शरीर दर्द, जुकाम और कमजोरी लाता है।");

        viral.symptoms.put("en", List.of("Moderate fever and chills", "Runny nose and sneezing", "Sore throat and mild dry cough", "Body ache and general lethargy"));
        viral.symptoms.put("ta", List.of("மிதமான காய்ச்சல் மற்றும் சளி", "மூக்கொழுகுதல் மற்றும் தும்மல்", "தொண்டை வலி மற்றும் உடல் வலி"));
        viral.symptoms.put("or", List.of("ସାଧାରଣ ଜ୍ୱର ଏବଂ ଥଣ୍ଡା", "ନାକରୁ ପାଣି ବୋହିବା ଏବଂ ଛିଙ୍କ ହେବା", "ଦେହହାତ ବିନ୍ଧିବା"));
        viral.symptoms.put("hi", List.of("मध्यम बुखार और बदन दर्द", "नाक बहना और छींकें आना", "गले में खराश और सुस्ती"));

        viral.prevention.put("en", List.of("Avoid close contact with infected individuals", "Drink warm fluids", "Wash hands regularly", "Annual influenza shot"));
        viral.prevention.put("ta", List.of("வெதுவெதுப்பான நீர் அருந்துங்கள்", "சளி பிடித்தவர்களிடம் இருந்து தனித்திருங்கள்"));
        viral.prevention.put("or", List.of("ଉଷୁମ ପାଣି ପିଅନ୍ତୁ ଏବଂ ନିଜ ହାତ ପରିଷ୍କାର ରଖନ୍ତୁ"));
        viral.prevention.put("hi", List.of("गुनगुना पानी पिएं और संक्रमित व्यक्ति से दूरी बनाकर रखें"));

        viral.governmentRecommendations.put("en", List.of(
                "Antibiotics are ineffective against viral fevers; take only antipyretics and rest",
                "Consult a PHC medical officer if fever exceeds 102°F or lasts beyond 3 days"
        ));
        viral.governmentRecommendations.put("ta", List.of(
                "வைரஸ் காய்ச்சலுக்கு ஆண்டிபயாடிக் மாத்திரைகள் தேவையில்லை; பாராசிட்டமால் மற்றும் ஓய்வு போதுமானது"
        ));
        viral.governmentRecommendations.put("or", List.of(
                "ଭୂତାଣୁ ଜ୍ୱର ପାଇଁ ଅଯଥାରେ ଆଣ୍ଟିବାୟୋଟିକ୍ ଖାଆନ୍ତୁ ନାହିଁ"
        ));
        viral.governmentRecommendations.put("hi", List.of(
                "वायरल बुखार में एंटीबायोटिक दवाओं का अनावश्यक उपयोग न करें, सिर्फ पेरासिटामोल व आराम लें"
        ));

        viral.treatment.put("en", "Rest, plenty of warm fluids, steam inhalation, and Paracetamol for fever relief.");
        viral.treatment.put("ta", "முழு ஓய்வு, ஆவி பிடித்தல் மற்றும் வெதுவெதுப்பான நீர்.");
        viral.treatment.put("or", "ବିଶ୍ରାମ, ବାଷ୍ପ ଗ୍ରହଣ (Steam) ଏବଂ ପାରାସିଟାମଲ୍।");
        viral.treatment.put("hi", "आराम, भाप लेना, गुनगुना पानी और पेरासिटामोल।");

        viral.symptomKeywordsEn = List.of("fever", "flu", "cold", "body ache", "sneezing", "runny nose", "sore throat");
        viral.symptomKeywordsTa = List.of("காய்ச்சல்", "சளி", "தும்மல்");
        viral.symptomKeywordsOr = List.of("ଜ୍ୱର", "ଥଣ୍ଡା", "ଛିଙ୍କ");
        viral.symptomKeywordsHi = List.of("बुखार", "जुकाम", "सर्दी", "छींक");
        DISEASE_REGISTRY.add(viral);

        // 7. BRONCHITIS
        DiseaseRecord bronchitis = new DiseaseRecord();
        bronchitis.id = "bronchitis";
        bronchitis.nameEn = "Bronchitis";
        bronchitis.nameTa = "மூச்சுக்குழாய் அழற்சி (ப்ரோன்கைடிஸ்)";
        bronchitis.nameOr = "ବ୍ରୋଙ୍କାଇଟିସ୍ (ଶ୍ୱାସନଳୀ ପ୍ରଦାହ)";
        bronchitis.nameHi = "ब्रोंकाइटिस (श्वसन नली में सूजन)";
        bronchitis.categoryEn = "Lower Respiratory Tract Condition";
        bronchitis.categoryTa = "சுவாசக்குழாய் அழற்சி";
        bronchitis.categoryOr = "ଶ୍ୱାସନଳୀ ରୋଗ";
        bronchitis.categoryHi = "श्वसन प्रणाली रोग";
        bronchitis.severity = "Medium";
        bronchitis.icon = "Lungs";

        bronchitis.description.put("en", "Inflammation of the lining of bronchial tubes, which carry air to and from your lungs, leading to thick mucus cough and wheezing.");
        bronchitis.description.put("ta", "நுரையீரல் மூச்சுக்குழாய்களில் ஏற்படும் வீக்கம். சளியுடன் கூடிய தொடர் இருமல் மற்றும் மூச்சு வாங்குதல் ஏற்படும்.");
        bronchitis.description.put("or", "ଫୁସଫୁସର ଶ୍ୱାସନଳୀରେ ପ୍ରଦାହ ହୋଇ ଘନ କଫ ସହିତ କାଶ ହେବା ଏହାର ଲକ୍ଷଣ।");
        bronchitis.description.put("hi", "फेफड़ों की श्वासनली में सूजन जिससे लगातार बलगम वाली खांसी और सांस फूलने की समस्या होती है।");

        bronchitis.symptoms.put("en", List.of("Persistent cough producing clear, yellowish, or greenish mucus", "Fatigue and slight fever", "Shortness of breath and chest discomfort", "Wheezing sound during breathing"));
        bronchitis.symptoms.put("ta", List.of("சளியுடன் கூடிய கடுமையான இருமல்", "மூச்சுத்திணறல் மற்றும் மூச்சிரைப்பு", "மார்புச் சளி மற்றும் அசதி"));
        bronchitis.symptoms.put("or", List.of("ଘନ କଫ ସହିତ ଲଗାତାର କାଶ", "ଛାତି ଭାରୀ ଲାଗିବା ଓ ଶ୍ୱାସକଷ୍ଟ", "ଶ୍ୱାସ ନେବା ବେଳେ ଶବ୍ଦ ହେବା"));
        bronchitis.symptoms.put("hi", List.of("गाढ़े बलगम के साथ लगातार खांसी", "सांस लेते समय सीटी जैसी आवाज (घरघराहट)", "सीने में जकड़न और भारीपन"));

        bronchitis.prevention.put("en", List.of("Avoid cigarette smoke and air pollution", "Get vaccinated for flu and pneumonia", "Wear protective masks in dusty environments"));
        bronchitis.prevention.put("ta", List.of("புகைபிடிப்பதை மற்றும் தூசி நிறைந்த இடங்களைத் தவிர்க்கவும்", "முகக்கவசம் அணியுங்கள்"));
        bronchitis.prevention.put("or", List.of("ଧୂମପାନ ଓ ଧୂଳି ମାଟିରୁ ଦୂରେଇ ରୁହନ୍ତୁ"));
        bronchitis.prevention.put("hi", List.of("धूम्रपान और वायु प्रदूषण से बचें, धूल में मास्क पहनें"));

        bronchitis.governmentRecommendations.put("en", List.of(
                "National Programme for Prevention and Control of Cancer, Diabetes, CVD and Stroke (NPCDCS) chronic respiratory screening at PHCs",
                "Seek medical evaluation if cough lasts more than 3 weeks or prevents sleep"
        ));
        bronchitis.governmentRecommendations.put("ta", List.of(
                "3 வாரங்களுக்கு மேல் இருமல் நீடித்தால் நெஞ்சு எக்ஸ்ரே (Chest X-Ray) செய்து பார்க்கவும்"
        ));
        bronchitis.governmentRecommendations.put("or", List.of(
                "୩ ସପ୍ତାହରୁ ଅଧିକ କାଶ ହେଲେ ଛାତିର ଏକ୍ସ-ରେ କରାନ୍ତୁ"
        ));
        bronchitis.governmentRecommendations.put("hi", List.of(
                "3 हफ्ते से अधिक खांसी रहने पर सीने का एक्सरे और डॉक्टर से जांच कराएं"
        ));

        bronchitis.treatment.put("en", "Humidifiers, steam inhalation, bronchodilator inhalers if prescribed, and plenty of fluids.");
        bronchitis.treatment.put("ta", "ஆவி பிடித்தல், இருமல் மருந்துகள் மற்றும் மருத்துவர் பரிந்துரைத்த இன்ஹேலர்.");
        bronchitis.treatment.put("or", "ଉଷୁମ ପାଣି ବାଷ୍ପ ଓ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶିତ ଇନହେଲର।");
        bronchitis.treatment.put("hi", "भाप लेना, तरल पदार्थ पीना और डॉक्टर के परामर्श से इनहेलर का उपयोग।");

        bronchitis.symptomKeywordsEn = List.of("cough", "mucus", "wheezing", "chest tightness", "breathlessness", "bronchitis");
        bronchitis.symptomKeywordsTa = List.of("இருமல்", "சளி", "மூச்சுத்திணறல்");
        bronchitis.symptomKeywordsOr = List.of("କାଶ", "କଫ", "ଶ୍ୱାସକଷ୍ଟ");
        bronchitis.symptomKeywordsHi = List.of("खांसी", "बलगम", "घरघराहट", "सांस फूलना");
        DISEASE_REGISTRY.add(bronchitis);

        // 8. DIABETES
        DiseaseRecord diabetes = new DiseaseRecord();
        diabetes.id = "diabetes";
        diabetes.nameEn = "Diabetes Mellitus";
        diabetes.nameTa = "நீரிழிவு நோய் (சர்க்கரை நோய்)";
        diabetes.nameOr = "ମଧୁମେହ (ଡାଇବେଟିସ୍)";
        diabetes.nameHi = "मधुमेह (डायबिटीज)";
        diabetes.categoryEn = "Metabolic Endocrine Condition";
        diabetes.categoryTa = "வளர்சிதை மாற்ற நோய்";
        diabetes.categoryOr = "ମେଟାବୋଲିକ୍ ରୋଗ";
        diabetes.categoryHi = "मेटाबॉलिक स्थिति";
        diabetes.severity = "Medium";
        diabetes.icon = "Activity";
        diabetes.description.put("en", "Diabetes Mellitus is a chronic metabolic condition characterized by elevated blood glucose levels due to insufficient insulin production or ineffective insulin utilization.");
        diabetes.description.put("ta", "ரத்தத்தில் சர்க்கரை அளவு அதிகரிக்கும் நாள்பட்ட வளர்சிதை மாற்ற நோய். முறையான உணவு கட்டுப்பாடு மற்றும் உடற்பயிற்சி அவசியம்.");
        diabetes.description.put("or", "ମଧୁମେହ ହେଉଛି ରକ୍ତରେ ଶର୍କରା ସ୍ତର ବୃଦ୍ଧି ପାଉଥିବା ଏକ ଦୀର୍ଘକାଳୀନ ରୋଗ। ନିୟମିତ ବ୍ୟାୟାମ ଓ ଖାଦ୍ୟ ନିୟନ୍ତ୍ରଣ ଅତ୍ୟନ୍ତ ଜରୁରୀ।");
        diabetes.description.put("hi", "मधुमेह एक दीर्घकालिक उपापचयी रोग है जिसमें इंसुलिन के असंतुलन से रक्त शर्करा (ब्लड शुगर) बढ़ जाती है।");
        diabetes.symptoms.put("en", List.of("Frequent urination (Polyuria)", "Excessive thirst (Polydipsia)", "Unexplained weight loss despite increased hunger", "Slow-healing sores or frequent infections", "Blurred vision and fatigue"));
        diabetes.symptoms.put("ta", List.of("அடிக்கடி சிறுநீர் கழித்தல்", "அதிக தாகம் மற்றும் பசி", "காரணமின்றி எடை குறைதல்", "புண்கள் தாமதமாக ஆறுதல்", "மங்கலான பார்வை"));
        diabetes.symptoms.put("or", List.of("ବାରମ୍ବାର ପରିସ୍ରା ଲାଗିବା", "ଅତ୍ୟଧିକ ଶୋଷ ଓ ଭୋକ", "ଅସ୍ପଷ୍ଟ ଦୃଷ୍ଟିଶକ୍ତି", "କ୍ଷତ ଶୀଘ୍ର ନ ଶୁଖିବା"));
        diabetes.symptoms.put("hi", List.of("बार-बार पेशाब आना", "अधिक प्यास और भूख लगना", "अकारण वजन कम होना", "घाव देर से भरना", "धुंधला दिखाई देना"));
        diabetes.prevention.put("en", List.of("Adopt a low-glycemic Mediterranean or traditional Indian balanced diet", "Engage in 150 minutes of moderate aerobic exercise weekly", "Maintain healthy BMI below 23 kg/m² for South Asians", "Limit refined carbohydrates, sweets, and sugary drinks"));
        diabetes.prevention.put("ta", List.of("சர்க்கரை மற்றும் துரித உணவுகளைத் தவிர்க்கவும்", "தினமும் 30 நிமிடங்கள் நடைப்பயிற்சி செய்யுங்கள்", "ஆண்டுக்கு ஒருமுறை ரத்த சர்க்கரை அளவு பரிசோதிக்கவும்"));
        diabetes.prevention.put("or", List.of("ମିଠା ଓ ତେଲିଆ ଖାଦ୍ୟ କମାନ୍ତୁ", "ନିୟମିତ ପ୍ରାତଃଭ୍ରମଣ କରନ୍ତୁ", "ରକ୍ତ ଶର୍କରା ନିୟମିତ ଯାଞ୍ଚ କରାନ୍ତୁ"));
        diabetes.prevention.put("hi", List.of("मीठे और जंक फूड से परहेज करें", "रोजाना कम से कम 30 मिनट टहलें", "वजन नियंत्रित रखें"));
        diabetes.governmentRecommendations.put("en", List.of(
                "National Programme for Prevention & Control of NCDs (NP-NCD): Free glucometer testing and HbA1c screening at all Health and Wellness Centres (HWCs)",
                "Free oral hypoglycemic drugs (Metformin, Glimepiride) provided through government PHC pharmacies",
                "Regular annual diabetic retinopathy and foot screening recommended"
        ));
        diabetes.treatment.put("en", "Lifestyle modification, carbohydrate counting, oral hypoglycemic agents, or insulin therapy under endocrinologist guidance with periodic HbA1c testing.");
        diabetes.symptomKeywordsEn = List.of("diabetes", "sugar", "high sugar", "frequent urination", "thirst", "glucose", "insulin");
        diabetes.symptomKeywordsTa = List.of("சர்க்கரை", "நீரிழிவு", "தாகம்");
        diabetes.symptomKeywordsOr = List.of("ମଧୁମେହ", "ଶର୍କରା");
        diabetes.symptomKeywordsHi = List.of("डायबिटीज", "शुगर", "मधुमेह");
        DISEASE_REGISTRY.add(diabetes);

        // 9. HYPERTENSION
        DiseaseRecord hypertension = new DiseaseRecord();
        hypertension.id = "hypertension";
        hypertension.nameEn = "Hypertension (High Blood Pressure)";
        hypertension.nameTa = "உயர் ரத்த அழுத்தம் (Hypertension)";
        hypertension.nameOr = "ଉଚ୍ଚ ରକ୍ତଚାପ (Hypertension)";
        hypertension.nameHi = "उच्च रक्तचाप (हाई ब्लड प्रेशर)";
        hypertension.categoryEn = "Cardiovascular Condition";
        hypertension.categoryTa = "இதய ரத்த நாள நோய்";
        hypertension.categoryOr = "ହୃଦୟ ଓ ରକ୍ତବାହୀ ରୋଗ";
        hypertension.categoryHi = "हृदय वाहिका रोग";
        hypertension.severity = "Medium";
        hypertension.icon = "HeartPulse";
        hypertension.description.put("en", "Hypertension is a silent condition where the force of blood against artery walls is consistently too high (≥140/90 mmHg), increasing risks of heart attacks, stroke, and kidney disease.");
        hypertension.description.put("ta", "அறிகுறிகள் இன்றி அமைதியாக இதயத்தையும் ரத்த நாளங்களையும் பாதிக்கும் உயர் ரத்த அழுத்தம். உப்பு குறைப்பு மற்றும் உடற்பயிற்சி மிக முக்கியம்.");
        hypertension.description.put("or", "ଏହା ଏକ ନୀରବ ଘାତକ ରୋଗ ଯେଉଁଥିରେ ଧମନୀରେ ରକ୍ତଚାପ ବୃଦ୍ଧି ପାଏ।");
        hypertension.description.put("hi", "हाई ब्लड प्रेशर एक गंभीर स्थिति है जिसमें धमनियों में रक्त का दबाव लगातार 140/90 mmHg से अधिक बना रहता है।");
        hypertension.symptoms.put("en", List.of("Often asymptomatic ('Silent Killer')", "Morning headaches and throbbing temple pain", "Shortness of breath on mild exertion", "Occasional nosebleeds (Epistaxis)", "Chest tightness or palpitations"));
        hypertension.symptoms.put("ta", List.of("காலை நேர தலைவலி", "தலைச்சுற்றல் மற்றும் படபடப்பு", "லேசான வேலையிலும் மூச்சு வாங்குதல்", "மூக்கில் ரத்தக் கசிவு"));
        hypertension.symptoms.put("or", List.of("ମୁଣ୍ଡବିନ୍ଧା ଓ ମୁଣ୍ଡ ବୁଲାଇବା", "ଛାତି ଧଡ଼ଧଡ଼ ହେବା", "ଅଣନିଶ୍ୱାସୀ ଲାଗିବା"));
        hypertension.symptoms.put("hi", List.of("सुबह सिरदर्द होना", "सिर चकराना और घबराहट", "सांस फूलना", "नाक से खून आना"));
        hypertension.prevention.put("en", List.of("DASH diet: Restrict dietary sodium to under 5 grams (1 teaspoon) daily", "Increase potassium-rich vegetables, bananas, and coconut water", "Quit smoking and avoid second-hand smoke exposure", "Manage psychological stress through yoga and meditation"));
        hypertension.prevention.put("ta", List.of("உப்பு உட்கொள்ளலைக் கடுமையாகக் குறைக்கவும் (ஒரு நாளைக்கு 1 டீஸ்பூன்)", "தினமும் உடற்பயிற்சி செய்து மன அழுத்தத்தைக் குறைக்கவும்"));
        hypertension.prevention.put("or", List.of("ଖାଦ୍ୟରେ ଲୁଣ ପରିମାଣ କମାନ୍ତୁ", "ଚାପମୁକ୍ତ ରହିବାକୁ ପ୍ରାଣାୟାମ କରନ୍ତୁ"));
        hypertension.prevention.put("hi", List.of("नमक का सेवन कम करें (दिनभर में 1 चम्मच से कम)", "तनावमुक्त रहें और योग करें"));
        hypertension.governmentRecommendations.put("en", List.of(
                "India Hypertension Control Initiative (IHCI): Free monthly BP measurement at HWCs and ASHA wellness kiosks",
                "Free essential antihypertensive medicines (Amlodipine, Telmisartan) supplied through government clinics",
                "Target BP guideline: keep resting blood pressure below 130/80 mmHg"
        ));
        hypertension.treatment.put("en", "Daily prescribed antihypertensive therapy, DASH dietary plan, weight management, and home blood pressure monitoring.");
        hypertension.symptomKeywordsEn = List.of("hypertension", "blood pressure", "high bp", "bp", "palpitations", "dizziness");
        hypertension.symptomKeywordsTa = List.of("ரத்த அழுத்தம்", "உயர் ரத்த அழுத்தம்");
        hypertension.symptomKeywordsOr = List.of("ରକ୍ତଚାପ", "ଉଚ୍ଚ ରକ୍ତଚାପ");
        hypertension.symptomKeywordsHi = List.of("हाई बीपी", "ब्लड प्रेशर", "रक्तचाप");
        DISEASE_REGISTRY.add(hypertension);

        // 10. ASTHMA
        DiseaseRecord asthma = new DiseaseRecord();
        asthma.id = "asthma";
        asthma.nameEn = "Asthma";
        asthma.nameTa = "ஆஸ்துமா (சுவாசக் கோளாறு)";
        asthma.nameOr = "ଆଜମା (ଶ୍ୱାସ ରୋଗ)";
        asthma.nameHi = "अस्थमा (दमा)";
        asthma.categoryEn = "Chronic Inflammatory Airway Disease";
        asthma.categoryTa = "சுவாசக் குழாய் அழற்சி நோய்";
        asthma.categoryOr = "ଶ୍ୱାସକ୍ରିୟା ଜନିତ ରୋଗ";
        asthma.categoryHi = "दीर्घकालिक श्वसन रोग";
        asthma.severity = "Medium";
        asthma.icon = "Wind";
        asthma.description.put("en", "Asthma is a chronic condition in which your airways narrow, swell, and produce extra mucus, making breathing difficult and triggering coughing and wheezing.");
        asthma.description.put("ta", "சுவாசக் குழாய்கள் சுருங்கி வீங்கி சளியால் அடைபடும் நோய். மூச்சிரைப்பு மற்றும் இருமல் இதன் முக்கிய அறிகுறிகள்.");
        asthma.description.put("or", "ଏହା ଏକ ଶ୍ୱାସକଷ୍ଟ ରୋଗ ଯେଉଁଥିରେ ଶ୍ୱାସନଳୀ ସଂକୀର୍ଣ୍ଣ ହୋଇ ଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହୁଏ।");
        asthma.description.put("hi", "अस्थमा फेफड़ों की श्वासनलियों में सूजन और रुकावट की स्थिति है जिससे सांस लेने में कठिनाई और घरघराहट होती है।");
        asthma.symptoms.put("en", List.of("Shortness of breath especially during night or early morning", "Audible wheezing or whistling sound when exhaling", "Chest tightness or painful breathing", "Coughing bouts triggered by cold air or exercise"));
        asthma.symptoms.put("ta", List.of("இரவு மற்றும் அதிகாலை மூச்சுத்திணறல்", "மூச்சு விடும்போது விசில் சத்தம் (மூச்சிரைப்பு)", "மார்பு இறுக்கம் மற்றும் வறட்டு இருமல்"));
        asthma.symptoms.put("or", List.of("ରାତିରେ କିମ୍ବା ସକାଳେ ଶ୍ୱାସକଷ୍ଟ", "ଶ୍ୱାସ ଛାଡିବା ବେଳେ ଶବ୍ଦ ହେବା", "ଛାତି ଜକଡ଼ି ହେବା"));
        asthma.symptoms.put("hi", List.of("रात या सुबह के समय सांस फूलना", "सांस लेते समय सीटी जैसी आवाज आना", "सीने में जकड़न", "धूल व ठंड से खांसी"));
        asthma.prevention.put("en", List.of("Identify and avoid personal allergens: dust mites, pollen, pet dander, and smoke", "Use protective face masks during dusty conditions or seasonal transitions", "Keep quick-relief rescue inhaler (Salbutamol) accessible at all times"));
        asthma.prevention.put("ta", List.of("தூசி, புகை மற்றும் பனிப்புகையிலிருந்து விலகி இருங்கள்", "எப்போதும் இன்ஹேலரை அருகில் வைத்திருக்கவும்"));
        asthma.prevention.put("or", List.of("ଧୂଳି, ଧୂଆଁ ଓ ଥଣ୍ଡା ପବନରୁ ରକ୍ଷା ପାଆନ୍ତୁ"));
        asthma.prevention.put("hi", List.of("धूल, धुएं और परागकणों से बचें", "इनहेलर हमेशा साथ रखें"));
        asthma.governmentRecommendations.put("en", List.of(
                "National Respiratory Health Programme guidelines: Free peak flow meter assessment and maintenance inhalers at District Hospitals",
                "Ensure emergency oxygen and nebulization therapy accessibility at all PHCs"
        ));
        asthma.treatment.put("en", "Inhaled corticosteroids for long-term control, rapid-acting bronchodilators for acute attacks, and avoidance of environmental triggers.");
        asthma.symptomKeywordsEn = List.of("asthma", "wheezing", "breathlessness", "inhaler", "chest tightness");
        asthma.symptomKeywordsTa = List.of("ஆஸ்துமா", "மூச்சிரைப்பு");
        asthma.symptomKeywordsOr = List.of("ଆଜମା", "ଶ୍ୱାସ");
        asthma.symptomKeywordsHi = List.of("अस्थमा", "दमा", "सांस फूलना");
        DISEASE_REGISTRY.add(asthma);

        // 11. ANEMIA
        DiseaseRecord anemia = new DiseaseRecord();
        anemia.id = "anemia";
        anemia.nameEn = "Iron Deficiency Anemia";
        anemia.nameTa = "ரத்த சோகை (அனீமியா)";
        anemia.nameOr = "ରକ୍ତହୀନତା (ଆନିମିଆ)";
        anemia.nameHi = "रक्तअल्पता / एनीमिया";
        anemia.categoryEn = "Hematologic Nutritional Deficiency";
        anemia.categoryTa = "ஊட்டச்சத்து ரத்த சோகை";
        anemia.categoryOr = "ରକ୍ତ କଣିକା ହ୍ରାସ ଜନିତ ରୋଗ";
        anemia.categoryHi = "रक्त संबंधी पोषण की कमी";
        anemia.severity = "Low";
        anemia.icon = "Droplets";
        anemia.description.put("en", "Anemia is a condition marked by a deficiency of red blood cells or hemoglobin in the blood, leading to reduced oxygen flow to organs.");
        anemia.description.put("ta", "ரத்தத்தில் ஹீமோகுளோபின் அளவு குறைவதால் உடலுக்கு போதிய ஆக்சிஜன் கிடைக்காமல் ஏற்படும் சோர்வு நிலை. இரும்புச்சத்து நிறைந்த உணவுகள் தீர்வு.");
        anemia.description.put("or", "ରକ୍ତରେ ହିମୋଗ୍ଲୋବିନ୍ ପରିମାଣ କମିଯିବା ଯୋଗୁଁ ଅତ୍ୟଧିକ ଦୁର୍ବଳତା ଓ ଥକ୍କା ଲାଗିବା ଏହାର ଲକ୍ଷଣ।");
        anemia.description.put("hi", "एनीमिया वह स्थिति है जिसमें खून में हीमोग्लोबिन या लाल रक्त कोशिकाओं की कमी हो जाती है, जिससे कमजोरी और थकान रहती है।");
        anemia.symptoms.put("en", List.of("Extreme persistent fatigue and weakness", "Pale or yellowish skin and conjunctiva", "Cold hands and feet", "Dizziness or lightheadedness upon standing", "Brittle nails and cravings for non-food items (Pica)"));
        anemia.symptoms.put("ta", List.of("அதிக உடல் சோர்வு மற்றும் பலவீனம்", "வெளிறிய தோல், கண்கள் மற்றும் நகங்கள்", "தலைசுற்றல் மற்றும் குளிர்ச்சியான கைகள்", "மூச்சு வாங்குதல்"));
        anemia.symptoms.put("or", List.of("ଅତ୍ୟଧିକ ଥକ୍କାପଣ ଓ ଦୁର୍ବଳତା", "ଚର୍ମ ଧଳା ପଡ଼ିଯିବା", "ମୁଣ୍ଡ ବୁଲାଇବା"));
        anemia.symptoms.put("hi", List.of("अत्यधिक थकान और कमजोरी", "त्वचा और आंखों में पीलापन", "चक्कर आना", "हाथ-पैर ठंडे रहना"));
        anemia.prevention.put("en", List.of("Eat iron-rich foods: green leafy vegetables, jaggery, beetroot, pomegranate, and lentils", "Pair iron with Vitamin C (citrus fruits, amla, lemon) to double absorption", "Avoid drinking tea or coffee immediately after meals as tannins inhibit iron absorption"));
        anemia.prevention.put("ta", List.of("முருங்கைக்கீரை, பேரீச்சம்பழம், வெல்லம், மாதுளை அதிகம் சாப்பிடுங்கள்", "சாப்பிட்டவுடன் டீ, காபி குடிப்பதைத் தவிர்க்கவும்"));
        anemia.prevention.put("or", List.of("ଶାଗ, ଡାଳିମ୍ବ, ଗୁଡ଼ ଓ ଖଜୁରୀ ଖାଆନ୍ତୁ", "ଖାଇବା ପରେ ତୁରନ୍ତ ଚାହା ପିଅନ୍ତୁ ନାହିଁ"));
        anemia.prevention.put("hi", List.of("पालक, गुड़, अनार, चुकंदर और दालों का सेवन करें", "खाने के तुरंत बाद चाय या कॉफी न पिएं"));
        anemia.governmentRecommendations.put("en", List.of(
                "Anemia Mukt Bharat (AMB): Free Iron and Folic Acid (IFA) tablets distributed by ASHA workers across all villages",
                "Free hemoglobin testing (Digital Hemocue) at Anganwadi centers and PHCs for women and children",
                "National Deworming Day (Albendazole) twice annually to eliminate parasitic blood loss"
        ));
        anemia.treatment.put("en", "Oral Iron and Folic Acid supplementation, dietary enhancement, deworming therapy, and clinical monitoring of hemoglobin levels.");
        anemia.symptomKeywordsEn = List.of("anemia", "fatigue", "pale skin", "weakness", "hemoglobin", "iron deficiency", "low blood");
        anemia.symptomKeywordsTa = List.of("ரத்த சோகை", "சோர்வு", "பலவீனம்");
        anemia.symptomKeywordsOr = List.of("ରକ୍ତହୀନତା", "ଦୁର୍ବଳତା");
        anemia.symptomKeywordsHi = List.of("एनीमिया", "खून की कमी", "कमजोरी");
        DISEASE_REGISTRY.add(anemia);

        // 12. JAUNDICE & VIRAL HEPATITIS
        DiseaseRecord jaundice = new DiseaseRecord();
        jaundice.id = "jaundice";
        jaundice.nameEn = "Jaundice & Viral Hepatitis";
        jaundice.nameTa = "மஞ்சள் காமாலை மற்றும் வைரஸ் ஹெபடைடிஸ்";
        jaundice.nameOr = "କାମଳ ଏବଂ ଭୂତାଣୁ ଯକୃତ ରୋଗ";
        jaundice.nameHi = "पीलिया और वायरल हेपेटाइटिस";
        jaundice.categoryEn = "Gastrointestinal & Hepatobiliary Disorder";
        jaundice.categoryTa = "இரைப்பை மற்றும் கல்லீரல் நோய்";
        jaundice.categoryOr = "ପାକସ୍ଥଳୀ ଏବଂ ଯକୃତ ରୋଗ";
        jaundice.categoryHi = "पाचन एवं यकृत (लिवर) संबंधी विकार";
        jaundice.severity = "High";
        jaundice.icon = "Activity";

        jaundice.description.put("en", "Jaundice is a medical condition causing yellow pigmentation of the skin, mucous membranes, and sclera due to elevated serum bilirubin. It frequently indicates acute viral hepatitis (Hepatitis A, B, C, or E), biliary obstruction, or hepatocellular dysfunction.");
        jaundice.description.put("ta", "மஞ்சள் காமாலை என்பது ரத்தத்தில் பிலிரூபின் (Bilirubin) அளவு அதிகரிப்பதால் கண்கள், தோல் மற்றும் சிறுநீர் மஞ்சள் நிறமாக மாறும் கல்லீரல் நோயாகும். இது பெரும்பாலும் ஹெபடைடிஸ் வைரஸ் தொற்று அல்லது பித்தப்பை அடைப்பால் ஏற்படுகிறது.");
        jaundice.description.put("or", "କାମଳ ହେଉଛି ଏକ ଯକୃତ ରୋଗ ଯେଉଁଥିରେ ରକ୍ତରେ ବିଲିରୁବିନ୍ ବୃଦ୍ଧି ପାଇ ଆଖି ଏବଂ ଚର୍ମ ହଳଦିଆ ପଡ଼ିଯାଏ। ଏହା ମୁଖ୍ୟତଃ ହେପାଟାଇଟିସ୍ ଭୂତାଣୁ ସଂକ୍ରମଣ ଯୋଗୁଁ ହୋଇଥାଏ।");
        jaundice.description.put("hi", "पीलिया एक ऐसी स्थिति है जिसमें रक्त में बिलीरुबिन बढ़ने से आंखों का सफेद भाग, त्वचा और पेशाब का रंग पीला हो जाता है। यह अक्सर वायरल हेपेटाइटिस या लिवर की खराबी का संकेत होता है।");

        jaundice.symptoms.put("en", List.of("Yellowing of the whites of eyes (sclera) and skin", "Dark amber or tea-colored urine", "Pale or clay-colored stools", "Fatigue, weakness, nausea, and loss of appetite", "Right upper quadrant abdominal discomfort or fullness"));
        jaundice.symptoms.put("ta", List.of("கண்கள் மற்றும் தோலில் மஞ்சள் நிற மாற்றம்", "அடர் மஞ்சள் அல்லது தேநீர் நிறத்தில் சிறுநீர்", "வெளிறிய மலம்", "சோர்வு, பசியின்மை மற்றும் குமட்டல்", "வலது பக்க வயிற்றுப் பகுதியில் கனமான உணர்வு அல்லது வலி"));
        jaundice.symptoms.put("or", List.of("ଆଖି ଏବଂ ଚର୍ମ ହଳଦିଆ ଦେଖାଯିବା", "ଗାଢ ହଳଦିଆ କିମ୍ବା ଚାହା ରଙ୍ଗର ପରିସ୍ରା", "ଧଳା/ମାଟିଆ ରଙ୍ଗର ଝାଡ଼ା", "ଅତ୍ୟଧିକ ଦୁର୍ବଳତା ଏବଂ ଭୋକ ନ ଲାଗିବା", "ପେଟର ଡାହାଣ ପାର୍ଶ୍ୱରେ ଯନ୍ତ୍ରଣା"));
        jaundice.symptoms.put("hi", List.of("आंखों और त्वचा का पीला पड़ना", "गहरे पीले या चाय जैसे रंग का पेशाब आना", "मिट्टी के रंग का हल्का मल", "थकान, कमजोरी, भूख न लगना और जी मिचलाना", "पेट के ऊपरी दाहिने हिस्से में भारीपन या दर्द"));

        jaundice.prevention.put("en", List.of("Consume only safe, boiled, and purified drinking water", "Practice strict hand hygiene before meals and after toilet use", "Get vaccinated against Hepatitis A and Hepatitis B", "Ensure safe sterile needles and blood transfusion protocols"));
        jaundice.prevention.put("ta", List.of("நன்கு கொதிக்க வைத்த பாதுகாப்பான குடிநீரையே பருகவும்", "உணவருந்தும் முன் கைகளை சோப்பு போட்டு நன்கு கழுவவும்", "ஹெபடைடிஸ் ஏ மற்றும் பி தடுப்பூசி செலுத்திக்கொள்ளவும்", "சுத்தமற்ற உணவுகள் மற்றும் சாலையோர பானங்களைத் தவிர்க்கவும்"));
        jaundice.prevention.put("or", List.of("ସର୍ବଦା ଫୁଟା ପାଣି ପିଅନ୍ତୁ", "ଖାଇବା ପୂର୍ବରୁ ହାତ ସାବୁନରେ ଧୁଅନ୍ତୁ", "ହେପାଟାଇଟିସ୍ ଟୀକାକରଣ କରାନ୍ତୁ", "ଅସ୍ୱାସ୍ଥ୍ୟକର ଖାଦ୍ୟ ଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ"));
        jaundice.prevention.put("hi", List.of("हमेशा उबला हुआ और स्वच्छ पानी पिएं", "खाने से पहले साबुन से अच्छी तरह हाथ धोएं", "हेपेटाइटिस ए और बी का टीका लगवाएं", "खुले में बिकने वाले अस्वच्छ भोजन और पेय से बचें"));

        jaundice.governmentRecommendations.put("en", List.of(
                "National Viral Hepatitis Control Program (NVHCP): Free LFT and Viral Load testing at all District Hospitals & Medical Colleges",
                "Strictly avoid unverified quack medicines, alcohol, and hepatotoxic herbal compounds which can precipitate acute liver failure",
                "Consult Primary Health Centre (PHC) medical officer immediately upon noticing yellow eyes or dark urine",
                "Universal Immunization Programme (UIP) provides free Hepatitis B birth dose vaccination for newborns"
        ));
        jaundice.governmentRecommendations.put("ta", List.of(
                "அரசு மருத்துவமனைகளில் தேசிய வைரஸ் ஹெபடைடிஸ் கட்டுப்பாட்டுத் திட்டத்தின் (NVHCP) கீழ் இலவச கல்லீரல் பரிசோதனை (LFT) கிடைக்கும்",
                "நாட்டு வைத்தியம் அல்லது சுயமாக மாத்திரைகள் சாப்பிடுவதை கட்டாயம் தவிர்க்கவும்; இது கல்லீரலை மேலும் பாதிக்கும்",
                "மஞ்சள் காமாலை அறிகுறி தெரிந்தால் உடனே ஆரம்ப சுகாதார நிலைய மருத்துவரை அணுகவும்"
        ));
        jaundice.governmentRecommendations.put("or", List.of(
                "ସରକାରୀ ଡାକ୍ତରଖାନାରେ ମାଗଣା ଯକୃତ ପରୀକ୍ଷା (LFT) ଉପଲବ୍ଧ",
                "ବିନା ଡାକ୍ତରୀ ପରାମର୍ଶରେ କୌଣସି ଜଡ଼ିବୁଟି ବା ଔଷଧ ସେବନ କରନ୍ତୁ ନାହିଁ",
                "ନିକଟସ୍ଥ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) କୁ ତୁରନ୍ତ ଯାଆନ୍ତୁ"
        ));
        jaundice.governmentRecommendations.put("hi", List.of(
                "राष्ट्रीय वायरल हेपेटाइटिस नियंत्रण कार्यक्रम (NVHCP) के तहत सरकारी अस्पतालों में मुफ्त लिवर फंक्शन टेस्ट (LFT) उपलब्ध है",
                "झाड़-फूंक या नीम-हकीमों की गैर-प्रमाणित दवाओं से बचें, यह लिवर फेलियर का कारण बन सकती हैं",
                "पीलिया के लक्षण दिखते ही तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से संपर्क करें"
        ));

        jaundice.treatment.put("en", "Complete physical bed rest, high-carbohydrate and low-fat bland diet, intravenous hydration if vomiting persists, avoidance of hepatotoxic drugs, and etiology-specific antiviral therapy under gastroenterologist supervision.");
        jaundice.treatment.put("ta", "முழு உடல் ஓய்வு, கொழுப்பு குறைந்த எளிதில் செரிமானமாகும் மாவுச்சத்து உணவுகள், போதிய நீர்ச்சத்து மற்றும் மருத்துவர் கண்காணிப்பில் சிகிச்சை.");
        jaundice.treatment.put("or", "ସମ୍ପୂର୍ଣ୍ଣ ବିଶ୍ରାମ, କମ୍ ତେଲଯୁକ୍ତ ସୁପାଚ୍ୟ ଖାଦ୍ୟ, ପ୍ରଚୁର ତରଳ ପଦାର୍ଥ ଗ୍ରହଣ ଏବଂ ଡାକ୍ତରଙ୍କ ତତ୍ତ୍ୱାବଧାନରେ ଚିକିତ୍ସା।");
        jaundice.treatment.put("hi", "पूर्ण शारीरिक आराम, कम वसा वाला सुपाच्य कार्बोहाइड्रेट युक्त भोजन, पर्याप्त तरल पदार्थ और विशेषज्ञ डॉक्टर की देखरेख में इलाज।");

        jaundice.symptomKeywordsEn = List.of("jaundice", "yellow eyes", "yellow skin", "icterus", "dark urine", "hepatitis", "liver", "bilirubin", "pale stool");
        jaundice.symptomKeywordsTa = List.of("மஞ்சள் காமாலை", "மஞ்சள் கண்", "மஞ்சள் சிறுநீர்", "ஹெபடைடிஸ்", "கல்லீரல்");
        jaundice.symptomKeywordsOr = List.of("କାମଳ", "ହଳଦିଆ ଆଖି", "ହେପାଟାଇଟିସ୍", "ଯକୃତ");
        jaundice.symptomKeywordsHi = List.of("पीलिया", "पीली आंखें", "पीला पेशाब", "हेपेटाइटिस", "लिवर");
        DISEASE_REGISTRY.add(jaundice);
    }

    /**
     * Search disease awareness with smart language detection, symptom reverse search,
     * government recommendations, and real YouTube awareness videos.
     */
    public DiseaseAwarenessResponseDTO searchAwareness(String query, String language) {
        String lang = normalizeLanguage(language);
        String q = query != null ? query.trim().toLowerCase() : "";

        log.info("Performing disease awareness search: query='{}', language='{}'", q, lang);

        if (q.isEmpty()) {
            return getTrendingDiseaseAwareness(lang);
        }

        // 1. Check if the query matches a specific disease by name or keyword
        DiseaseRecord matchedDisease = findDiseaseByNameOrAlias(q);

        // 2. Check if the query matches symptoms (e.g. "fever", "cough", "காய்ச்சல்", "କାଶ", "बुखार")
        List<DiseaseRecord> symptomMatches = findDiseasesBySymptom(q, lang);

        if (matchedDisease == null && !symptomMatches.isEmpty()) {
            matchedDisease = symptomMatches.get(0);
        }

        // If still null, fallback to Dengue as default primary
        if (matchedDisease == null) {
            matchedDisease = DISEASE_REGISTRY.get(0);
        }

        // 3. Search real YouTube awareness videos for this primary disease in user's language
        YouTubeService.VideoSearchResult videoResult = youTubeService.searchAwarenessVideos(matchedDisease.nameEn, lang);

        // 4. Build additional matched disease summaries for multi-disease / symptom queries
        List<DiseaseSummaryDTO> additionalSummaries = new ArrayList<>();
        if (!symptomMatches.isEmpty()) {
            for (DiseaseRecord rec : symptomMatches) {
                additionalSummaries.add(toSummaryDTO(rec, lang));
            }
        }

        return DiseaseAwarenessResponseDTO.builder()
                .diseaseName(matchedDisease.nameEn)
                .nativeName(getNativeName(matchedDisease, lang))
                .category(getCategory(matchedDisease, lang))
                .severity(matchedDisease.severity)
                .description(matchedDisease.description.getOrDefault(lang, matchedDisease.description.get("en")))
                .symptoms(matchedDisease.symptoms.getOrDefault(lang, matchedDisease.symptoms.get("en")))
                .prevention(matchedDisease.prevention.getOrDefault(lang, matchedDisease.prevention.get("en")))
                .governmentRecommendations(matchedDisease.governmentRecommendations.getOrDefault(lang, matchedDisease.governmentRecommendations.get("en")))
                .treatment(matchedDisease.treatment.getOrDefault(lang, matchedDisease.treatment.get("en")))
                .language(lang)
                .videos(videoResult.getVideos())
                .isFallback(videoResult.isFallback())
                .fallbackMessage(videoResult.getFallbackMessage())
                .matchedDiseases(additionalSummaries)
                .build();
    }

    /**
     * Provide fast live suggestions for search box typing (e.g. "den" -> Dengue, "cov" -> COVID-19).
     */
    public List<DiseaseSuggestionDTO> getSuggestions(String prefix, String language) {
        String lang = normalizeLanguage(language);
        if (prefix == null || prefix.trim().isEmpty()) {
            return DISEASE_REGISTRY.stream()
                    .map(d -> DiseaseSuggestionDTO.builder()
                            .id(d.id)
                            .name(d.nameEn)
                            .nativeName(getNativeName(d, lang))
                            .category(getCategory(d, lang))
                            .type("disease")
                            .build())
                    .limit(6)
                    .collect(Collectors.toList());
        }

        String p = prefix.trim().toLowerCase();
        List<DiseaseSuggestionDTO> suggestions = new ArrayList<>();

        // Disease name matches
        for (DiseaseRecord d : DISEASE_REGISTRY) {
            String en = d.nameEn.toLowerCase();
            String nativeName = getNativeName(d, lang).toLowerCase();
            if (en.contains(p) || nativeName.contains(p) || d.id.contains(p)) {
                suggestions.add(DiseaseSuggestionDTO.builder()
                        .id(d.id)
                        .name(d.nameEn)
                        .nativeName(getNativeName(d, lang))
                        .category(getCategory(d, lang))
                        .type("disease")
                        .build());
            }
        }

        // Symptom keyword matches
        List<String[]> commonSymptoms = List.of(
                new String[]{"fever", "காய்ச்சல்", "ଜ୍ୱର", "बुखार"},
                new String[]{"cough", "இருமல்", "କାଶ", "खांसी"},
                new String[]{"headache", "தலைவலி", "ମୁଣ୍ଡବିନ୍ଧା", "सिरदर्द"},
                new String[]{"joint pain", "மூட்டு வலி", "ଗଣ୍ଠି ଯନ୍ତ୍ରଣା", "जोड़ों का दर्द"},
                new String[]{"vomiting", "வாந்தி", "ବାନ୍ତି", "उल्टी"}
        );

        for (String[] sym : commonSymptoms) {
            for (String val : sym) {
                if (val.toLowerCase().contains(p)) {
                    suggestions.add(DiseaseSuggestionDTO.builder()
                            .id("sym_" + sym[0])
                            .name(sym[0].toUpperCase().charAt(0) + sym[0].substring(1))
                            .nativeName(getSymptomNative(sym, lang))
                            .category("Symptom")
                            .type("symptom")
                            .build());
                    break;
                }
            }
        }

        return suggestions;
    }

    /**
     * Get default trending disease awareness (Dengue) when search is empty.
     */
    public DiseaseAwarenessResponseDTO getTrendingDiseaseAwareness(String language) {
        String lang = normalizeLanguage(language);
        DiseaseRecord dengue = DISEASE_REGISTRY.get(0);
        YouTubeService.VideoSearchResult videoResult = youTubeService.searchAwarenessVideos(dengue.nameEn, lang);

        List<DiseaseSummaryDTO> summaries = DISEASE_REGISTRY.stream()
                .map(d -> toSummaryDTO(d, lang))
                .collect(Collectors.toList());

        return DiseaseAwarenessResponseDTO.builder()
                .diseaseName(dengue.nameEn)
                .nativeName(getNativeName(dengue, lang))
                .category(getCategory(dengue, lang))
                .severity(dengue.severity)
                .description(dengue.description.getOrDefault(lang, dengue.description.get("en")))
                .symptoms(dengue.symptoms.getOrDefault(lang, dengue.symptoms.get("en")))
                .prevention(dengue.prevention.getOrDefault(lang, dengue.prevention.get("en")))
                .governmentRecommendations(dengue.governmentRecommendations.getOrDefault(lang, dengue.governmentRecommendations.get("en")))
                .treatment(dengue.treatment.getOrDefault(lang, dengue.treatment.get("en")))
                .language(lang)
                .videos(videoResult.getVideos())
                .isFallback(videoResult.isFallback())
                .fallbackMessage(videoResult.getFallbackMessage())
                .matchedDiseases(summaries)
                .build();
    }

    private DiseaseRecord findDiseaseByNameOrAlias(String q) {
        for (DiseaseRecord d : DISEASE_REGISTRY) {
            if (d.nameEn.toLowerCase().contains(q) ||
                d.nameTa.toLowerCase().contains(q) ||
                d.nameOr.toLowerCase().contains(q) ||
                d.nameHi.toLowerCase().contains(q) ||
                d.id.equalsIgnoreCase(q)) {
                return d;
            }
        }
        return null;
    }

    private List<DiseaseRecord> findDiseasesBySymptom(String q, String lang) {
        List<DiseaseRecord> matches = new ArrayList<>();
        for (DiseaseRecord d : DISEASE_REGISTRY) {
            boolean matched = false;
            if (lang.equals("tamil")) {
                matched = d.symptomKeywordsTa.stream().anyMatch(s -> s.contains(q) || q.contains(s));
            } else if (lang.equals("odia")) {
                matched = d.symptomKeywordsOr.stream().anyMatch(s -> s.contains(q) || q.contains(s));
            } else if (lang.equals("hindi")) {
                matched = d.symptomKeywordsHi.stream().anyMatch(s -> s.contains(q) || q.contains(s));
            }

            if (!matched) {
                matched = d.symptomKeywordsEn.stream().anyMatch(s -> s.contains(q) || q.contains(s));
            }

            if (matched) {
                matches.add(d);
            }
        }
        return matches;
    }

    private DiseaseSummaryDTO toSummaryDTO(DiseaseRecord d, String lang) {
        return DiseaseSummaryDTO.builder()
                .id(d.id)
                .name(d.nameEn)
                .nativeName(getNativeName(d, lang))
                .category(getCategory(d, lang))
                .severity(d.severity)
                .summary(d.description.getOrDefault(lang, d.description.get("en")))
                .symptoms(d.symptoms.getOrDefault(lang, d.symptoms.get("en")))
                .prevention(d.prevention.getOrDefault(lang, d.prevention.get("en")))
                .icon(d.icon)
                .build();
    }

    private String getNativeName(DiseaseRecord d, String lang) {
        switch (lang) {
            case "tamil": return d.nameTa;
            case "odia": return d.nameOr;
            case "hindi": return d.nameHi;
            default: return d.nameEn;
        }
    }

    private String getCategory(DiseaseRecord d, String lang) {
        switch (lang) {
            case "tamil": return d.categoryTa;
            case "odia": return d.categoryOr;
            case "hindi": return d.categoryHi;
            default: return d.categoryEn;
        }
    }

    private String getSymptomNative(String[] sym, String lang) {
        switch (lang) {
            case "tamil": return sym[1];
            case "odia": return sym[2];
            case "hindi": return sym[3];
            default: return sym[0];
        }
    }

    private String normalizeLanguage(String language) {
        if (language == null || language.trim().isEmpty()) return "english";
        String l = language.trim().toLowerCase();
        if (l.equals("ta") || l.contains("tamil") || l.contains("தமிழ்")) return "tamil";
        if (l.equals("hi") || l.contains("hindi") || l.contains("हिन्दी")) return "hindi";
        if (l.equals("or") || l.contains("odia") || l.contains("oriya") || l.contains("ଓଡ଼ିଆ")) return "odia";
        return "english";
    }
}
