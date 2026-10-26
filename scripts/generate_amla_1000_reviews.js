const fs = require('fs');
const path = require('path');

const NEW_CSV_FILE = path.join(__dirname, '..', 'amla_only_1000_reviews_judgeme.csv');
const BULK_CSV_FILE = path.join(__dirname, '..', 'bulk_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// Amla Powder: 200 g / ₹234 (Phyllanthus emblica, fruit pulp, hair packs)
const PRODUCT_ID = '8494763311290';
const PRODUCT_HANDLE = 'amla';
const TARGET_TOTAL = 1000;

// Seeded PRNG for reproducible, rich randomness
let seed = 987654321;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 200 Indian First Names (Diverse male & female across North, South, East, West India)
const FIRST_NAMES = [
  'Aarav', 'Aakash', 'Aarti', 'Abhinav', 'Aditi', 'Aditya', 'Ajay', 'Akhil', 'Alok', 'Aman',
  'Amrita', 'Ananya', 'Anil', 'Anjali', 'Ankit', 'Ankita', 'Anshul', 'Anuradha', 'Aparna', 'Archana',
  'Arjun', 'Arun', 'Arvind', 'Ashish', 'Ashwini', 'Ayush', 'Balram', 'Bhavna', 'Bhuvan', 'Bindu',
  'Brijesh', 'Champa', 'Chandan', 'Chandrika', 'Charu', 'Chetan', 'Chetna', 'Damodar', 'Deepa', 'Deepak',
  'Deepali', 'Deepti', 'Devendra', 'Devika', 'Dhruv', 'Dinesh', 'Divya', 'Esha', 'Gargi', 'Garima',
  'Gaurav', 'Gautam', 'Gayatri', 'Geeta', 'Girish', 'Gitanjali', 'Harish', 'Harsh', 'Harsha', 'Hemant',
  'Himanshu', 'Hitesh', 'Indira', 'Indu', 'Ishaan', 'Ishita', 'Jagdish', 'Janaki', 'Jatin', 'Jaya',
  'Jitendra', 'Jyoti', 'Kalyani', 'Kamal', 'Kamla', 'Karan', 'Karthik', 'Karuna', 'Kavita', 'Kavya',
  'Kiran', 'Komal', 'Kripa', 'Krishna', 'Kunal', 'Lalita', 'Lavanya', 'Leela', 'Madhav', 'Madhuri',
  'Malini', 'Manish', 'Manisha', 'Manoj', 'Mayank', 'Meera', 'Meenakshi', 'Milan', 'Mohit', 'Monika',
  'Mukesh', 'Nalini', 'Namrata', 'Nandini', 'Naresh', 'Naveen', 'Neelam', 'Neeraj', 'Neha', 'Nidhi',
  'Nikhil', 'Nikita', 'Nisha', 'Nitin', 'Ojas', 'Pallav', 'Pallavi', 'Pankaj', 'Parul', 'Parvati',
  'Payal', 'Pooja', 'Poonam', 'Pradeep', 'Prakash', 'Pranav', 'Prashant', 'Pratibha', 'Preeti', 'Priya',
  'Priyanka', 'Radha', 'Radhika', 'Raghu', 'Rahul', 'Rajesh', 'Rajiv', 'Rakesh', 'Raman', 'Ramesh',
  'Rashmi', 'Ravi', 'Ravindra', 'Rekha', 'Renuka', 'Revathi', 'Rina', 'Rishi', 'Ritu', 'Rohan',
  'Rohit', 'Ruchi', 'Rupal', 'Sachin', 'Sameer', 'Sandeep', 'Sangeeta', 'Sanjay', 'Sanjeev', 'Sanya',
  'Sarita', 'Saurabh', 'Savita', 'Seema', 'Shalini', 'Sharada', 'Shashi', 'Shikha', 'Shilpa', 'Shivani',
  'Shobha', 'Shreya', 'Shruti', 'Siddharth', 'Simran', 'Smriti', 'Sneha', 'Sonali', 'Suman', 'Sumit',
  'Sunil', 'Sunita', 'Suresh', 'Surya', 'Swati', 'Sweta', 'Tanvi', 'Tarini', 'Tarun', 'Tejas',
  'Trisha', 'Tushar', 'Uday', 'Uma', 'Urmila', 'Utkarsh', 'Vaibhav', 'Vandana', 'Vandita', 'Varun',
  'Vasundhara', 'Vidya', 'Vijay', 'Vikas', 'Vikram', 'Vinay', 'Vineet', 'Vinod', 'Vipul', 'Vishal',
  'Vivek', 'Yamini', 'Yash', 'Yashoda', 'Yogesh', 'Zoya', 'Tanmay', 'Mitali', 'Kushagra', 'Suhani'
];

// 120 Surnames
const LAST_NAMES = [
  'Agarwal', 'Agnihotri', 'Awasthi', 'Bajpai', 'Balakrishnan', 'Banerjee', 'Bansal', 'Bhat', 'Bhatia',
  'Bhatnagar', 'Bhattacharya', 'Bhosle', 'Bose', 'Chakraborty', 'Chatterjee', 'Chavan', 'Chitnis', 'Chopra',
  'Choudhury', 'Dasgupta', 'Deshmukh', 'Deshpande', 'Dey', 'Dravid', 'Dubey', 'Dutta', 'Dwivedi', 'Gaikwad',
  'Ganguly', 'Ghosh', 'Gokhale', 'Goswami', 'Gupta', 'Hegde', 'Iyengar', 'Iyer', 'Jadhav', 'Jagtap',
  'Jain', 'Joshi', 'Kadam', 'Kamath', 'Kapoor', 'Kashyap', 'Kaushik', 'Kulkarni', 'Kumar', 'Mahajan',
  'Malhotra', 'Mathur', 'Mehta', 'Menon', 'Mishra', 'More', 'Mukherjee', 'Mukhopadhyay', 'Nadkarni', 'Nair',
  'Nambiar', 'Namboodiri', 'Nayak', 'Pai', 'Pandey', 'Parikh', 'Patel', 'Pathak', 'Pawar', 'Phadke',
  'Pillai', 'Prabhu', 'Prasad', 'Rao', 'Reddy', 'Roy', 'Sahay', 'Salunkhe', 'Sawant', 'Saxena',
  'Sen', 'Senapati', 'Sengupta', 'Shah', 'Sharma', 'Shenoy', 'Shetty', 'Shinde', 'Shukla', 'Singh',
  'Singhania', 'Sinha', 'Somani', 'Srinivas', 'Srivastava', 'Thorat', 'Tiwari', 'Tripathi', 'Trivedi',
  'Varma', 'Verma', 'Khatri', 'Chauhan', 'Meena', 'Rathore', 'Solanki', 'Rawat', 'Negi', 'Bisht',
  'Sood', 'Ahluwalia', 'Sandhu', 'Gill', 'Dhillon', 'Sidhu', 'Grewal', 'Bhardwaj', 'Pundir', 'Chawla'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com'
];

const usedEmails = new Set();
const usedNames = new Set();

function generateUniqueName() {
  let name = '';
  let attempts = 0;
  do {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    name = `${first} ${last}`;
    attempts++;
    if (attempts > 5000) {
      name = `${first} ${last} ${randInt(1, 99)}`;
      break;
    }
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function generateUniqueEmail(name) {
  const parts = name.toLowerCase().split(' ');
  const first = parts[0].replace(/[^a-z]/g, '');
  const last = (parts[1] || 'sharma').replace(/[^a-z]/g, '');

  const patterns = [
    () => `${first}.${last}${randInt(1, 99)}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}${last}${randInt(1980, 2004)}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}_${last}${randInt(10, 99)}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}.${last[0]}${randInt(100, 999)}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}${last[0]}${randInt(1985, 2003)}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}${randInt(10, 99)}.${last}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}.${last}@${pick(EMAIL_DOMAINS)}`,
    () => `${first}${last}${randInt(10, 9999)}@${pick(EMAIL_DOMAINS)}`,
  ];

  let email = '';
  let attempts = 0;
  do {
    const fn = pick(patterns);
    email = fn();
    attempts++;
    if (attempts > 100) {
      email = `${first}.${last}.${randInt(10000, 999999)}@${pick(EMAIL_DOMAINS)}`;
    }
  } while (usedEmails.has(email));

  usedEmails.add(email);
  return email;
}

function randomDate(startYear, startMonth, endYear, endMonth, endDay = 24) {
  const start = new Date(startYear, startMonth - 1, 1).getTime();
  const end = new Date(endYear, endMonth - 1, endDay).getTime();
  const d = new Date(start + rand() * (end - start));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// -------------------------------------------------------------
// ENGLISH REVIEW DATA
// Strictly compliant with NatureMist Amla specifications (24 Oct 2026):
// 200g / ₹234, Phyllanthus emblica, fruit pulp, traditional hair pack,
// separate step before cleansing, patch/strand testing, clean spoon, no medical/regrowth claims.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "Pure fruit pulp with incredible natural shine",
  "The perfect weekly Ayurvedic hair pack",
  "Outstanding mirror gloss on dark hair",
  "Authentic Phyllanthus emblica fruit powder",
  "Leaves lengths silky, soft and manageable",
  "My favorite separate pre-wash ritual",
  "Incredible quality for just ₹234",
  "Zero grit and rinses out effortlessly",
  "Deeply cooling and refreshing on the scalp",
  "A wholesome traditional botanical mask",
  "Silky slip and natural luster without silicones",
  "The 200g jar is pure botanical perfection",
  "Restored healthy gloss to my dull lengths",
  "Pure single-origin amla without any fillers",
  "Mixes into a smooth, lump-free paste",
  "Strand test was perfect, natural dark tones pop",
  "Grounding Sunday hair-pack ritual",
  "Gentle on scalp and leaves lengths radiant",
  "Unbelievable shine after a single thorough rinse",
  "Natural gloss that catches the light beautifully",
  "Pure earthy fragrance of dried amla pulp",
  "Followed the pack directions, stunning results",
  "The ₹234 price tag is unbelievable value",
  "Clean scalp feel and silky soft strands",
  "Lightweight volume and glossy natural bounce",
  "Essential first step before my cleansing routine",
  "Worth every single rupee of ₹234",
  "Subtle herbal aroma and ultra-fine milling",
  "No artificial colors, pure fruit pulp",
  "Such a soothing and grounding hair pack",
  "Completely residue-free after rinsing",
  "Noticeable softness across my dry ends",
  "Pure botanical goodness for hair lengths",
  "Traditional Ayurvedic hair care done right",
  "Leaves my curls soft, defined and lustrous"
];

const EN_TITLES_4 = [
  "Great natural shine, needs thorough water rinse",
  "Very good 200g jar, wish a scoop came inside",
  "Leaves hair conditioned, earthy aroma takes a wash to adjust",
  "Effective hair pack, needs careful mixing with clean water",
  "Silky lengths, make sure to use a clean dry spoon",
  "Strand test is a must on light hair, but results are lovely",
  "Great ₹234 value, takes 20 minutes of patience",
  "Effective conditioning pack, discard leftover paste",
  "Nice slip, best followed by your usual cleanser",
  "Fine powder quality, jar lid was tightly sealed upon arrival",
  "Smooth paste, rinse takes plenty of water on thick hair",
  "Good herbal conditioning, slightly earthy natural scent"
];

const EN_TITLES_3 = [
  "Authentic pure amla, takes time and patience to prepare",
  "Decent hair pack, earthy scent lingers slightly",
  "Pure botanical powder, must follow with usual cleanser",
  "Good quality fruit pulp, application can get slightly messy",
  "Gentle conditioning, requires consistent weekly application",
  "Fine milling, make sure not to inhale the dry powder",
  "Pure product, remember to patch test and strand test first"
];

const EN_HOOKS = [
  "I mix two tablespoons of this finely milled amla fruit pulp with clean water into a smooth paste as directed on the pack.",
  "Using this as a separate hair-pack step before my usual cleansing routine has given my hair an unbelievable natural sheen.",
  "You can immediately tell this is 100% pure Phyllanthus emblica fruit pulp from its authentic tan-green color and fresh earthy aroma.",
  "At ₹234 for a generous 200g jar, NatureMist has made pure Ayurvedic hair packs completely accessible.",
  "I did a patch test first on my inner arm as recommended on the pack, and then applied the smooth paste to my roots and lengths.",
  "I have porous, color-treated ends, so I followed the directions to strand-test first; it left a lovely, rich, glossy tone.",
  "The micro-milled fruit pulp mixes smoothly with clean lukewarm water in under a minute without forming gritty lumps.",
  "After leaving the paste on according to the label's timing, it rinsed out cleanly with water without leaving any sandy residue behind.",
  "I keep the 200g jar tightly sealed in a cool, dry cupboard and always scoop the powder with a clean, dry spoon.",
  "This pure amla fruit pulp pack gives my dark hair a healthy, reflective sheen that synthetic silicone masks never delivered.",
  "I love that NatureMist keeps this strictly as a pure single botanical for hair packs without adding artificial fragrances or fillers.",
  "Whenever my scalp feels stuffy from everyday buildup, applying this soothing amla pack feels delightfully cooling and refreshing.",
  "I prepare a fresh mixture for each Sunday ritual and discard any leftover wet paste as instructed on the packaging.",
  "My strands feel so light, conditioned, and touchably soft after rinsing this out and following with my usual wash routine.",
  "I pair this amla pack with my gentle wash routine, and it has become the most grounding step of my weekend self-care.",
  "The natural fruit tannins impart a deep, healthy gloss to dark hair that catches the sunlight brilliantly.",
  "Rinsing is so clean—just plenty of running water and the botanical paste washes away without clinging to individual strands.",
  "My 2C curls look clumped, bouncy, and remarkably shiny without any heavy silicone product buildup.",
  "I appreciate that this is strictly pure fruit pulp intended for hair packs, with no exaggerated claims or artificial ingredients.",
  "The earthy botanical smell is completely authentic, reminiscent of traditional homemade amla fruit pastes.",
  "Applying this smooth herbal paste in sections allows my scalp and lengths to absorb pure botanical conditioning.",
  "I was paying three times this price for imported masks that left waxy buildup; this pure ₹234 powder is far superior.",
  "The 200g jar lasts over a month when used once a week as a dedicated hair-pack step.",
  "After the thorough water rinse, my comb glides effortlessly through my wet lengths with zero snags or tangles.",
  "I have naturally light-brown hair and did a strand test first as directed; it gave my strands a gorgeous luminous depth.",
  "The packaging is clean and airtight, keeping the dried fruit pulp completely fresh between uses."
];

const EN_MIDDLES = [
  "The natural conditioning properties leave my mid-lengths and ends feeling smooth, supple, and noticeably manageable.",
  "It washes away cleanly under running water without leaving any sandy grit or sticky film behind on the scalp.",
  "The subtle cooling sensation across the crown during application is deeply relaxing, grounding, and therapeutic.",
  "My natural dark hair tones look visibly richer, deeper, and full of multidimensional mirror shine.",
  "My lengths have a natural, airy bounce and silkiness without feeling weighed down in the slightest.",
  "Using a clean, dry utensil keeps the remaining powder inside the 200g jar completely fresh, dry, and lump-free.",
  "The strand check on my grey highlights gave me complete confidence before doing a full hair-pack application.",
  "It works wonderfully as a focused pre-wash step right before my gentle hair cleansing routine.",
  "My comb glides smoothly through wet strands without snagging or tugging at dry ends.",
  "The fine botanical milling makes spreading the paste from roots to lengths completely effortless."
];

const EN_CONCLUSIONS_5 = [
  "At ₹234 for 200g, this is the gold standard for pure Ayurvedic hair care. Will definitely repurchase!",
  "Such a grounding, joyful hair ritual. It has earned a permanent spot in my weekly routine.",
  "Truly authentic botanical quality. Highly recommended to anyone looking for genuine plant-based care!",
  "My mother and grandmother inspected the powder and immediately approved of its pure fruit pulp quality.",
  "Incredible natural gloss and manageability. Worth every single rupee of ₹234!",
  "100% pure single-botanical amla at an honest price. You cannot ask for better hair pack quality.",
  "If you want real botanical results without synthetic silicones, this 200g jar is pure perfection.",
  "Exceeded my expectations for a simple water-mixed herbal pack. My hair has never looked shinier."
];

const EN_CONCLUSIONS_4 = [
  "Leaves hair beautifully soft and glossy. Just wish the 200g jar included a dedicated wooden measuring scoop.",
  "Very effective hair pack. Remember to rinse with plenty of water to ensure every bit of paste is washed away.",
  "Takes some patience to prepare and rinse, but the resulting shine and scalp freshness make it well worth it.",
  "High quality powder. The earthy aroma takes a wash or two to get used to, but the softness is undeniable.",
  "Great ₹234 value. Be sure to keep the lid tightly sealed in a dry place to preserve the powder freshness.",
  "Leaves lengths very soft and manageable. Make sure to use a clean dry spoon so no moisture enters the jar."
];

const EN_CONCLUSIONS_3 = [
  "Good pure amla fruit pulp. Application can be slightly messy, and you definitely need to follow with your usual wash.",
  "Authentic powder, though preparing a fresh paste each week requires dedicated time and patience.",
  "Decent hair pack for shine, but make sure to do a strand test if you have light, porous, or bleached hair.",
  "Fine botanical quality, though the natural earthy scent lingers slightly if not rinsed thoroughly."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA (Natural conversational Hindi-English)
// Fully compliant with Amla specs: 200g / ₹234, Phyllanthus emblica fruit pulp,
// traditional hair pack, patch/strand test, dry spoon, no hair regrowth or cure claims.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "₹234 me itni pure amla fruit pulp, unbelievable!",
  "Dhoop me baal mirror ki tarah shine karte hain",
  "Pehli baar bina milawat ka authentic amla powder mila",
  "Baal bilkul silky, soft aur manageable ho gaye",
  "Ekdum original Ayurvedic hair pack hai",
  "Sunday hair pack ritual ban gaya hai mera",
  "Scalp par jo thanda sukoon milta hai, amazing!",
  "Wash out karna bohot aasan hai, zero grit",
  "200g jar ki quality aur packaging 10/10 hai",
  "Clean water ke saath smooth paste banta hai",
  "Natural black tones me rich gloss dekhne layak hai",
  "Mummy ko bhi iski purity bohot pasand aayi",
  "Dry lengths bilkul soft aur shiny feel hoti hain",
  "Silicone wale mask se lakh guna behtar hai",
  "₹234 ke hisab se poora paisa vasool product",
  "Ekdum fresh dried amla ki earthy khushboo aati hai",
  "Kangi bina kisi uljhan ke smooth glide karti hai",
  "Pack ke directions follow kiye, results awesome hain",
  "Pre-wash hair pack ke liye best botanical powder",
  "Ghar pe banaya hua natural Ayurvedic spa jaisa feel",
  "Dry spoon se use karo, jar me powder ekdum fresh rehta hai",
  "Zero chemical, pure Phyllanthus emblica fruit powder",
  "Lightweight bounce aur natural luster milta hai"
];

const HI_TITLES_4 = [
  "Accha hair pack hai, bas wooden scoop hona chahiye tha",
  "Shine bohot achi aati hai, rinse dhang se karna padta hai",
  "Quality 10/10 hai, earthy khushboo thodi strong hai",
  "Baal bohot soft hote hain, dry spoon use karna zaroori hai",
  "₹234 me value great hai, lagane me thoda time lagta hai",
  "Pehle strand test zaroor karein, baal kafi shiny hote hain",
  "Fresh paste banana padta hai, par softness kamaal ki hai",
  "Airtight jar accha hai, rinse ke waqt thoda zyada paani lagta hai"
];

const HI_TITLES_3 = [
  "Pure amla hai par weekly paste banana thoda tedious hai",
  "Khushboo kaafi earthy hai, aadat hone me time lagta hai",
  "Hair pack accha hai, par normal wash routine alag se chahiye",
  "Fine powder hai, scoop karte waqt dhyan rakhna padta hai",
  "Patience chahiye prepare karne me, par botanical pure hai"
];

const HI_HOOKS = [
  "Maine clean water ke saath 2 chammach amla fruit pulp paste banaya pack ke directions ke mutabik.",
  "Ye 100% pure Phyllanthus emblica fruit pulp hai, open karte hi ekdum fresh earthy aroma aati hai.",
  "Sunday ko cleansing se pehle ise separate hair pack ki tarah lagati hu, baal bohot glossy aur soft ho jate hain.",
  "₹234 me 200g pure amla powder milna aaj kal ke market me bohot honest pricing hai.",
  "Pehle maine inner arm pe patch test kiya jaisa pack pe likha tha, bilkul safe aur gentle raha.",
  "Mere temples pe thode grey baal the toh maine strand test kiya, unpe ek subtle natural rich tone aa gaya.",
  "Micro-milled powder hai, clean paani me mix karte hi bina lumps ke smooth paste ban jata hai.",
  "Ise pack ke timing ke mutabik rakh ke normal paani se rinse kiya, saara paste bina kisi grit ke nikal gaya.",
  "200g jar ko hamesha tightly sealed rakhti hu aur dry spoon use karti hu taaki moisture na jaye.",
  "Heat styling se mere baal bohot dull lag rahe the, is amla pack ne natural mirror-like shine restore kar di.",
  "Har baar fresh paste banati hu aur bacha hua paste discard kar deti hu jaisa label pe instruction hai.",
  "Scalp par lagane ke baad jo thanda-thanda sukoon milta hai, wo poore hafte ka stress mita deta hai.",
  "Ise water se rinse karne ke baad usual cleansing routine karti hu, lengths bilkul featherlight aur soft lagti hain.",
  "Bina kisi chemical perfume ya artificial color ke itni pure Ayurvedic quality dekh kar dil khush ho gaya.",
  "Curly baalon me jo dryness rehti thi, is pack ke baad curls bohot soft, clumped aur bouncy feel hote hain.",
  "Market ke branded hair masks se lakh guna behtar hai, zero silicone buildup ke sath natural gloss milta hai.",
  "Paani se rinse karne ke baad kangi itni aasaani se nikal jaati hai bina kisi uljhan ke.",
  "Mummy ne powder check kiya aur bola ki ekdum authentic amla ki sukhi pulp ka powder hai.",
  "₹234 ka 200g pack weekly use pe aaram se 1.5 - 2 mahine chalta hai, value for money 100% hai.",
  "Is amla pack ko apne regular wash routine se pehle lagana mere weekend self-care ka best hissa ban gaya hai."
];

const HI_MIDDLES = [
  "Wash out karna bohot simple hai, paani dhaalne se hi saara paste bina kisi sand ya residue ke nikal jata hai.",
  "Kangi bina kisi uljhan ke aasaani se nikal jaati hai aur baalon me koi tangling nahi hoti.",
  "Dhoop me baalon ka natural black tone itna rich aur reflective dikhta hai jaise salon treatment karwaya ho.",
  "Scalp par jo thanda-thanda sukoon milta hai lagane ke baad, wo stress poora khatam kar deta hai.",
  "Jar me clean dry spoon use karna zaroori hai taaki andar paani na jaye aur powder fresh rahe.",
  "Grey baalon pe maine strand test karke check kiya, results safe aur bohot natural lage.",
  "Baalon ko chipchipa banaye bina natural volume aur manageable softness deta hai.",
  "Ye separate hair-pack step ki tarah kaam karta hai, iske baad apna regular wash routine kar leti hu.",
  "Lengths bohot soft aur smooth feel hoti hain, cuticles bilkul well-conditioned lagte hain.",
  "Pura botanical powder hai, koi artificial fragrance ya chemicals ka naam-o-nishan nahi hai."
];

const HI_CONCLUSIONS_5 = [
  "Sach me paisa vasool product hai! ₹234 me aisi pure quality milna rare hai. 10/10 recommendation!",
  "Ghar pe banaya hua authentic Ayurvedic hair pack jaisa feel hota hai. Loved it completely!",
  "Best amla powder in the Indian market right now. Quality me koi compromise nahi hai.",
  "Mummy aur meri dono ki favorite ban chuki hai. Dubara order zaroor karenge!",
  "Pure botanical hair pack chahiye toh aankh band karke le lo, totally worth every rupee of ₹234!",
  "Ayurvedic care ke liye NatureMist ka ye 200g jar best investment hai.",
  "Lengths itni soft ho jati hain ki conditioner ki zaroorat hi nahi lagti. Truly awesome!"
];

const HI_CONCLUSIONS_4 = [
  "Product bohot accha hai aur baal soft hote hain. Bas jar me ek chhota wooden spoon hona chahiye tha.",
  "Results kamaal ke hain. Paani se thoroughly rinse karna zaroori hai taaki poora paste nikal jaye.",
  "Earthy aroma shuru me thodi strong lagti hai, par baalon ki softness aur gloss dekh kar worth it lagta hai.",
  "₹234 me bohot accha 200g jar hai. Bas fresh paste banana aur dry spoon use karna dhyan rakhein.",
  "Lid thodi tight thi packaging me, par andar ka powder ekdum pure aur fine fruit pulp quality hai."
];

const HI_CONCLUSIONS_3 = [
  "Pure amla powder hai, par har hafte fresh paste prepare karna aur rinse karna thoda time-consuming hai.",
  "Khushboo kaafi earthy aur traditional hai. Hair pack ke baad usual cleanser se wash zaroor karein.",
  "Accha botanical powder hai, par results ke liye consistent weekly hair pack routine maintain karni padegi."
];

// -------------------------------------------------------------
// REVIEW GENERATION FUNCTION
// -------------------------------------------------------------
function generateSingleReview(isHinglish, rating) {
  let title = '';
  let body = '';

  if (isHinglish) {
    const hook = pick(HI_HOOKS);
    const middle = pick(HI_MIDDLES);
    if (rating === 5) {
      title = pick(HI_TITLES_5);
      const conclusion = pick(HI_CONCLUSIONS_5);
      body = `${hook} ${middle} ${conclusion}`;
    } else if (rating === 4) {
      title = pick(HI_TITLES_4);
      const conclusion = pick(HI_CONCLUSIONS_4);
      body = `${hook} ${conclusion}`;
    } else {
      title = pick(HI_TITLES_3);
      const conclusion = pick(HI_CONCLUSIONS_3);
      body = `${hook} ${conclusion}`;
    }
  } else {
    // English
    const hook = pick(EN_HOOKS);
    const middle = pick(EN_MIDDLES);
    if (rating === 5) {
      title = pick(EN_TITLES_5);
      const conclusion = pick(EN_CONCLUSIONS_5);
      body = `${hook} ${middle} ${conclusion}`;
    } else if (rating === 4) {
      title = pick(EN_TITLES_4);
      const conclusion = pick(EN_CONCLUSIONS_4);
      body = `${hook} ${conclusion}`;
    } else {
      title = pick(EN_TITLES_3);
      const conclusion = pick(EN_CONCLUSIONS_3);
      body = `${hook} ${conclusion}`;
    }
  }

  // Realistic date between Jan 2025 and 24 Oct 2026
  const date = randomDate(2025, 1, 2026, 10, 24);
  const fullName = generateUniqueName();
  const email = generateUniqueEmail(fullName);

  return {
    title,
    body,
    rating,
    review_date: date,
    reviewer_name: fullName,
    reviewer_email: email,
    product_id: PRODUCT_ID,
    product_handle: PRODUCT_HANDLE,
  };
}

function toCsvRow(r) {
  const escapeCsv = (str) => {
    const s = String(str ?? '');
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return `"${s}"`;
  };

  return [
    escapeCsv(r.title),
    escapeCsv(r.body),
    r.rating,
    r.review_date,
    r.reviewer_name.includes(',') ? `"${r.reviewer_name}"` : r.reviewer_name,
    r.reviewer_email,
    r.product_id,
    r.product_handle,
  ].join(',');
}

function main() {
  console.log(`Generating ${TARGET_TOTAL} NatureMist Amla Powder reviews aligned with published details (24 Oct 2026)...`);

  // Target ratings:
  // ~82.5% 5-star (825)
  // ~14.0% 4-star (140)
  // ~3.5%  3-star (35)
  const count5 = 825;
  const count4 = 140;
  const count3 = 35; // 825 + 140 + 35 = 1000

  const ratingsList = [
    ...Array(count5).fill(5),
    ...Array(count4).fill(4),
    ...Array(count3).fill(3),
  ];
  shuffle(ratingsList);

  // Language split: ~52% English, ~48% Hinglish
  const hinglishRatio = 0.48;

  const reviews = [];
  for (let i = 0; i < TARGET_TOTAL; i++) {
    const rating = ratingsList[i];
    const isHinglish = rand() < hinglishRatio;
    const rev = generateSingleReview(isHinglish, rating);
    reviews.push(rev);
  }

  // Shuffle all reviews completely so dates, languages, ratings, and styles are thoroughly interspersed
  shuffle(reviews);

  // Write CSV
  const header = 'title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle';
  const csvContent = [header, ...reviews.map(toCsvRow)].join('\n') + '\n';

  // 1. Write to amla_only_1000_reviews_judgeme.csv
  fs.writeFileSync(NEW_CSV_FILE, csvContent, 'utf8');
  console.log(`Created: ${NEW_CSV_FILE} with ${reviews.length} reviews.`);

  // 2. Also write to bulk_reviews_judgeme.csv
  fs.writeFileSync(BULK_CSV_FILE, csvContent, 'utf8');
  console.log(`Updated: ${BULK_CSV_FILE} with ${reviews.length} reviews.`);

  // Stats
  const ratingsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    ratingsCount[r.rating] = (ratingsCount[r.rating] || 0) + 1;
  }
  const avg = (Object.entries(ratingsCount).reduce((acc, [k, v]) => acc + (k * v), 0) / TARGET_TOTAL).toFixed(2);
  console.log('Final Ratings:', ratingsCount);
  console.log(`Average Rating: ${avg} / 5.00`);
}

main();
