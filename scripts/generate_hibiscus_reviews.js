const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'hibiscus_only_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// Hibiscus Powder: 200 g / ₹450 (MRP ₹500, 10% off)
// Botanical: Hibiscus rosa-sinensis, flowers (petals), hair packs, deep conditioning, gloss
const PRODUCT_ID = '8531585499322';
const PRODUCT_HANDLE = 'hibiscus-powder'; // Official handle in Shopify

// 1k plus random number (e.g. 1048 reviews)
const TARGET_TOTAL = 1048;

// Seeded PRNG for reproducible, rich randomness
let seed = 456789123;
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

// 200 Indian First Names
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
  const last = (parts[1] || 'patel').replace(/[^a-z]/g, '');

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
// ENGLISH REVIEW DATA — HIBISCUS POWDER
// Details: 200g / ₹450 (MRP ₹500), Hibiscus rosa-sinensis shade-dried flower petals,
// botanical hair packs, deep conditioning, smooth texture, glossy slip,
// strand test guidance (especially on bleached/blonde/light hair due to natural floral pigment),
// clean dry spoon, patch test, discard leftover paste, external hair care only.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "Incredible floral conditioning and silky slip",
  "Pure Hibiscus rosa-sinensis shade-dried petals",
  "Deeply nourishing botanical mask for dry lengths",
  "Leaves hair touchably soft with a natural gloss",
  "The 200g pouch is pure flower petal luxury",
  "Rich ruby-tinted powder with zero artificial dyes",
  "Perfect botanical hair pack for coarse ends",
  "Amazing slip and softness when mixed with aloe",
  "My Sunday fruit-and-flower hair pack ritual",
  "Worth every penny of the ₹450 price tag",
  "Rinses out easily leaving hair feather-light",
  "Natural floral cooling sensation on the scalp",
  "Micro-milled flower petals mix into a velvety cream",
  "Gorgeous natural shine without synthetic silicones",
  "Gentle, pure single-botanical care for thirsty hair",
  "Tames roughness and leaves lengths deeply moisturized",
  "Did the recommended strand test and loved the deep gloss",
  "Traditional Gudhal petal care at its finest",
  "Clean botanical ingredients with no chemical fragrance",
  "Sealed 200g pouch keeps floral powder fresh and dry",
  "Noticeable softness right from the very first pack session",
  "Pure plant-based conditioning that truly delivers"
];

const EN_TITLES_4 = [
  "Very good botanical conditioner, takes extra water to rinse",
  "Great softness, natural floral pigment needs a strand test",
  "High quality 200g pouch, wish a measuring scoop was included",
  "Leaves lengths silky, natural earthy-floral scent",
  "Excellent conditioning pack, store strictly away from moisture",
  "Lovely glossy finish, light hair definitely needs a strand test",
  "Good ₹450 value for pure petals, mix fresh before each use",
  "Nourishes dry ends well, make sure to use a clean dry spoon",
  "Noticeable slip and silkiness, discard any leftover paste",
  "Fine floral powder, mixing with warm water prevents tiny lumps"
];

const EN_TITLES_3 = [
  "Pure flower petal powder, takes patience to rinse clean",
  "Good botanical conditioning, slight floral tint on light strands",
  "Authentic Gudhal powder, application can get slightly messy",
  "Decent hair pack, requires consistent weekly application for softness",
  "Fine petal milling, remember to patch test and strand test first",
  "Natural floral powder, needs thorough washing after 30 minutes"
];

const EN_HOOKS = [
  "I mix two tablespoons of this fine Hibiscus petal powder with warm water into a velvety paste as directed on the pack.",
  "Using this traditional Gudhal flower pack once a week has transformed my dry, coarse lengths into soft, touchable silk.",
  "You can tell this is 100% pure Hibiscus rosa-sinensis petals from its deep magenta-ruby undertone and authentic floral earthiness.",
  "At ₹450 for a generous 200g pack, NatureMist offers unadulterated flower petal quality without artificial fragrance or fillers.",
  "I did the recommended patch test first, and then applied the smooth floral cream from my roots down through my lengths.",
  "I have sun-lightened tips, so I followed the pack guidance and did a strand test first; it imparted a gorgeous glossy luster.",
  "The micro-milled petals blend effortlessly with warm water in under a minute into an ultra-smooth, creamy hair mask.",
  "After letting it sit for 25 minutes as advised, it rinsed away with plenty of clean running water without weighing hair down.",
  "I keep the resealable 200g pouch tightly sealed in a dry cupboard and always scoop with a clean, dry spoon.",
  "This pure flower pack provides natural botanical slip and conditioning that synthetic store masks simply cannot match.",
  "I love that NatureMist emphasizes transparent cosmetic botanical care without making unrealistic hair regrowth claims.",
  "Whenever my hair feels dull or brittle after sun exposure, this soothing Hibiscus floral mask restores natural bounce and vitality.",
  "I prepare the paste fresh right before my weekly bath and discard any leftover wet mixture as advised on the pouch.",
  "My hair feels noticeably softer and detangles effortlessly after rinsing this out and following with a gentle wash routine.",
  "The listing suggests pairing this with Amla or aloe vera gel, and the resulting botanical slip is wonderfully conditioning.",
  "Rinsing is very pleasant—warm running water carries away the fine floral paste, leaving zero greasy or waxy buildup behind.",
  "My dark wavy hair looks noticeably glossier and catches the sunlight with a healthy, natural multidimensional sheen.",
  "I appreciate that this product contains strictly dried flower petals for external cosmetic hair conditioning.",
  "The mild, earthy floral scent is completely genuine—no synthetic perfumes, chemical preservatives, or colorants.",
  "Applying the smooth paste in sections from root to tip leaves both my scalp and hair lengths feeling cooled and nourished.",
  "The 200g pouch lasts several weekly ritual sessions, making it great value for authentic single-origin floral hair care."
];

const EN_MIDDLES = [
  "It washes away completely under running water without leaving any gritty residue or clinging floral sediment.",
  "My scalp feels pleasantly cooled and refreshed, while my mid-lengths and ends feel velvety and intensely hydrated.",
  "The natural conditioning slip helps my fingers glide through my hair easily during the post-pack rinse.",
  "My strands feel light, bouncy, and deeply conditioned without any heavy artificial film or synthetic coating.",
  "Using a clean, dry utensil keeps the remaining flower powder inside the resealable pouch perfectly fresh and dry.",
  "The strand test on a discreet lower lock gave me complete confidence before applying the mask across my full head.",
  "It works brilliantly as a dedicated weekly hair-pack step right before a mild botanical cleanse.",
  "My hair feels genuinely replenished from scalp to ends, retaining moisture and softness throughout the week.",
  "The fine micro-milling ensures the paste spreads evenly across each hair strand without clumping or dragging."
];

const EN_CONCLUSIONS_5 = [
  "At ₹450 for 200g, this is unmatched quality for pure flower-based hair conditioning. Will definitely repurchase!",
  "Such a luxurious, soothing hair-pack ritual. It has become an indispensable part of my weekend self-care routine.",
  "Truly authentic petal quality with exceptional slip and gloss. Highly recommended to anyone craving clean botanical care!",
  "My hair has never felt this soft and manageable without silicone conditioners. Worth every rupee of the ₹450 price tag!",
  "100% pure single-botanical Hibiscus petals at an honest price. You cannot find a better natural hair pack.",
  "If you want deep botanical conditioning and brilliant shine without synthetic additives, this 200g pouch is pure perfection."
];

const EN_CONCLUSIONS_4 = [
  "Leaves hair silky and conditioned. Just remember to rinse with plenty of water to wash away all petal particles.",
  "Very moisturizing flower pack. Make sure to perform a strand test first if you have lighter or porous hair.",
  "Takes a bit of care to mix smoothly, but the natural gloss and soft texture make it completely worth the time.",
  "High quality floral powder. Be sure to keep the resealable pouch zipped tight away from bathroom humidity.",
  "Great ₹450 value for pure shade-dried petals. Always prepare fresh and discard any leftover wet mixture."
];

const EN_CONCLUSIONS_3 = [
  "Good pure Hibiscus petal pack. It conditions nicely, though rinsing all flower residue requires extra shower time.",
  "Authentic Gudhal powder that softens dry ends, but remember to strand test on light hair to avoid subtle color transfer.",
  "Fine botanical quality, but be sure to patch test first, mix with warm water, and rinse thoroughly with clean water."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA — HIBISCUS POWDER
// Details: 200g / ₹450, Hibiscus rosa-sinensis phool (Gudhal petals),
// natural conditioning, hair pack, smooth slip, shine, strand test warning,
// clean dry spoon, no regrowth/dandruff cure claims.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "Gudhal ke phoolon ka pure conditioning pack",
  "Baalon me aisi softness aur shine pehle kabhi nahi aayi",
  "Pure Hibiscus rosa-sinensis flower petals, superb quality",
  "Dry and frizzy baalon ke liye best herbal pack",
  "200g pouch bilkul authentic shade-dried phool hai",
  "Bina kisi silicone ke natural slip aur conditioning",
  "Natural gloss aur softness dekh kar maza aa gaya",
  "Mera Sunday hair-pack ritual ab complete hai",
  "₹450 me 200g pure Gudhal petal powder worth every rupee",
  "Pani aur dahi ke sath mix kiya, silky smooth paste bani",
  "Rinse karna asaan hai aur baal bilkul silky ho jate hain",
  "Scalp par cooling aur baalon par natural shine",
  "Fine micro-milled petals, koi kankad ya milaawat nahi",
  "Chemical hair mask se 100 guna behtar botanical care",
  "Strand test kiya tha, mere dark baalon par pyari gloss aayi",
  "Hair ends ki dryness bilkul gayab ho gayi",
  "Authentic Gudhal powder, koi artificial rang ya scent nahi",
  "Resealable 200g pack fresh rehta hai aur use karna easy hai",
  "Weekly hair care ke liye perfect single-botanical pack",
  "NatureMist ki flower powder quality sach me lajawab hai",
  "Paani se clean rinse ho gaya, zero chipchipahat",
  "Baal touch karne me itne soft aur silky lagte hain"
];

const HI_TITLES_4 = [
  "Bahut acha conditioning pack hai, rinse karne me thoda extra pani lagta hai",
  "Baal silky ho gaye, light baal wale strand test zaroor karein",
  "Quality 200g pouch bahut badiya hai, saath me chammach hoti toh acha hota",
  "Baal smooth aur manageable banata hai, natural mitti jaisi khushboo hai",
  "Conditioning ke liye top-class, dry spoon se hi powder nikalna",
  "Gloss badiya aayi hai, blonde ya light strands par strand check zaroori hai",
  "₹450 me pure petals, bas har bar fresh bana kar use karein",
  "Dry ends ke liye bahut faydemand, bachi hui paste store mat karein",
  "Silky slip milta hai, gungune pani me mix karein taaki lumps na banein",
  "Authentic Gudhal powder, sectioning karke lagana sabse easy rehta hai"
];

const HI_TITLES_3 = [
  "Asli Gudhal powder hai, baalon se rinse karne me thoda time lagta hai",
  "Conditioning achi milti hai, light baalon par halka pink tint aa sakta hai",
  "Pure floral powder hai par pack lagane me hath thode messy ho jate hain",
  "Thik thak botanical pack, regular 3-4 week lagane ke baad softness aati hai",
  "Fine petal milling hai, use karne se pehle patch test zaroor karein",
  "Natural Gudhal hai, rinse ke baad mild cleanser se clean karna padta hai"
];

const HI_HOOKS = [
  "Maine 2 chammach fine Hibiscus petal powder ko gungune paani me mix kiya, pack par jaise likha tha.",
  "Har Sunday ye traditional Gudhal flower pack lagane se mere dry aur rough baalon me natural softness aa gayi hai.",
  "Pouch kholte hi deep burgundy-ruby color aur authentic floral aroma se pata chalta hai ki ye 100% pure flower petals hain.",
  "₹450 me 200g pure Gudhal powder bina kisi perfume ya chemical color ke milna NatureMist ki badi honesty hai.",
  "Maine pehle pack directions ke hisab se wrist par patch test kiya, fir sections bana kar hair lengths par lagaya.",
  "Mere thode se light-toned highlights hain toh maine pehle strand test kiya; bilkul safe aur glossy finish mila.",
  "Micro-milled flower petals pani ke sath badi aasani se mix ho kar ek silky smooth mask ban jate hain.",
  "25 minute rakhne ke baad jab maine clean tap water se wash kiya toh baal feather-light aur soft mehsus hue.",
  "Main 200g pouch ko moisture se door sukhi almari me rakhti hoon aur hamesha dry spoon se hi powder leti hoon.",
  "Bina kisi silicone ya artificial coating ke ye flower mask baalon ko itni natural slip aur shine deta hai.",
  "Mujhe sabse acha laga ki NatureMist ne koi jhoothe claims nahi kiye, bas genuine botanical hair pack bataya hai.",
  "Dhoop aur pollution ke baad jab baal lifeless lagte hain, ye cooling Gudhal pack lagane se hair fresh lagne lagte hain.",
  "Main nahane se turant pehle fresh paste banata hoon aur bachi hui wet mixture ko pack ke mutabik phenk deta hoon.",
  "Rinse karne ke baad jab baal sookhe toh bina kisi heavy serum ke fingers smoothly baalon se nikal rahi thi.",
  "Pack par mention tha ki isko dahi ya aloe vera ke sath bhi mix kar sakte hain, aur slip sach me kamaal ka mila.",
  "Wash karne me koi problem nahi hui—pani ke dhaar ke neeche flower particles bina kisi residue ke saaf ho gaye.",
  "Mere dark wavy baalon me dhoop me ek bohot healthy aur vibrant natural luster dikhayi deta hai.",
  "Mujhe pasand aaya ki isme sirf shade-dried Gudhal phool ki pattiya hain, koi fillers ya synthetics nahi.",
  "Iska natural earthy-floral fragrance bilkul authentic hai, jaise taaza sukhe huye Gudhal ke phool hon.",
  "Roots se lekar ends tak pack ko lagane ke baad scalp par bohot soothing aur cooling ehsas hota hai.",
  "200g pack mahine bhar se zyada chal jata hai agar aap hafte me ek baar dedicated ritual pack lagate hain."
];

const HI_MIDDLES = [
  "Pani se wash karne ke baad scalp par koi chipchipahat ya gritty residue bilkul nahi bachta.",
  "Scalp par ek bohot pyara cooling soothing feel rehta hai aur hair lengths touchably soft ho jati hain.",
  "Natural botanical slip ki wajah se wash karte waqt baal bilkul aapas me ulajhte nahi hain.",
  "Baalon me koi artificial silicone jaisi bhari layer nahi banti, hair ekdum natural aur bouncy rehte hain.",
  "Sukhi chammach use karne ki wajah se pouch ke andar bacha hua flower powder ekdum fresh aur dry rehta hai.",
  "Hidden strand par pehle test kar liya tha, isliye poore baalon me lagate waqt koi tension nahi hui.",
  "Weekly hair care routine me normal wash se pehle ye dedicated botanical mask step bohot lajawab kaam karta hai.",
  "Baalon me root se lekar tip tak hydration aur smooth texture retain rehta hai poore hafte.",
  "Itna fine powder hai ki paste baalon me smoothly spread hoti hai bina kisi gath ke."
];

const HI_CONCLUSIONS_5 = [
  "₹450 me 200g pure Gudhal petal powder ke liye best investment hai. Definitely repeat purchase karungi!",
  "Kitna relaxing aur conditioning ritual hai. Ab ye mere weekend hair-care routine ka sabse zaroori part ban gaya hai.",
  "Asli flower petal quality jisme aisi natural shine aur softness milti hai. Jo log pure Ayurveda chahte hain zaroor lein!",
  "Chemical conditioners se 100 times better hai. ₹450 ki price har hisab se poori tarah justified hai!",
  "100% pure single-botanical Hibiscus bina kisi milaawat ke. Isse behtar hair pack market me milna mushkil hai.",
  "Agar aapko silky soft baal aur natural gloss chahiye bina chemicals ke, toh ye 200g pouch ekdum perfect hai."
];

const HI_CONCLUSIONS_4 = [
  "Baal bohot silky aur soft ho jate hain. Bas dhyan rahe ki rinse karne ke liye thoda extra pani use karein.",
  "Bohot badiya conditioning pack hai. Light ya porous baal wale pehle strand test zaroor karein.",
  "Paste banane me thoda time lagta hai, par baalon ki softness aur gloss dekh kar saari mehnat wasool ho jati hai.",
  "High quality flower powder hai. Pouch ko bathroom ke moisture se door tight band karke hi rakhein.",
  "₹450 me pure shade-dried petals ki deal bohot badiya hai. Fresh banayein aur bachi paste discard karein."
];

const HI_CONCLUSIONS_3 = [
  "Pure Gudhal powder hai jo baalon ko soft banata hai, par shower me flower residue saaf karne me extra pani lagta hai.",
  "Authentic petal powder hai, bas light ya bleached baalon par halka pinkish tint na aaye isliye strand test zaroor karein.",
  "Quality achi hai par patch test zaroor karein, gungune pani me mix karein aur achhe se wash karein."
];

// Helper to escape CSV field
function escapeCsv(str) {
  if (typeof str !== 'string') str = String(str);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate the 1,048 reviews
console.log(`Generating ${TARGET_TOTAL} NatureMist Hibiscus Powder reviews aligned with published details (24 Oct 2026)...`);

const reviews = [];

// Breakdown for 1,048 reviews:
// 5 stars: ~858 (81.9%)
// 4 stars: ~153 (14.6%)
// 3 stars: ~37 (3.5%)
// Target total: 858 + 153 + 37 = 1048
const TARGET_5 = 858;
const TARGET_4 = 153;
const TARGET_3 = 37;

// Generate 5-star reviews
for (let i = 0; i < TARGET_5; i++) {
  const isHinglish = rand() < 0.85; // 85% Hinglish, 15% English
  const name = generateUniqueName();
  const email = generateUniqueEmail(name);
  const date = randomDate(2025, 10, 2026, 10, 24);

  let title, body;
  if (isHinglish) {
    title = pick(HI_TITLES_5);
    const hook = pick(HI_HOOKS);
    const mid = pick(HI_MIDDLES);
    const conc = pick(HI_CONCLUSIONS_5);
    body = `${hook} ${mid} ${conc}`;
  } else {
    title = pick(EN_TITLES_5);
    const hook = pick(EN_HOOKS);
    const mid = pick(EN_MIDDLES);
    const conc = pick(EN_CONCLUSIONS_5);
    body = `${hook} ${mid} ${conc}`;
  }

  reviews.push({
    title,
    body,
    rating: 5,
    review_date: date,
    reviewer_name: name,
    reviewer_email: email,
    product_id: PRODUCT_ID,
    product_handle: PRODUCT_HANDLE
  });
}

// Generate 4-star reviews
for (let i = 0; i < TARGET_4; i++) {
  const isHinglish = rand() < 0.85;
  const name = generateUniqueName();
  const email = generateUniqueEmail(name);
  const date = randomDate(2025, 10, 2026, 10, 24);

  let title, body;
  if (isHinglish) {
    title = pick(HI_TITLES_4);
    const hook = pick(HI_HOOKS);
    const mid = pick(HI_MIDDLES);
    const conc = pick(HI_CONCLUSIONS_4);
    body = `${hook} ${mid} ${conc}`;
  } else {
    title = pick(EN_TITLES_4);
    const hook = pick(EN_HOOKS);
    const mid = pick(EN_MIDDLES);
    const conc = pick(EN_CONCLUSIONS_4);
    body = `${hook} ${mid} ${conc}`;
  }

  reviews.push({
    title,
    body,
    rating: 4,
    review_date: date,
    reviewer_name: name,
    reviewer_email: email,
    product_id: PRODUCT_ID,
    product_handle: PRODUCT_HANDLE
  });
}

// Generate 3-star reviews
for (let i = 0; i < TARGET_3; i++) {
  const isHinglish = rand() < 0.85;
  const name = generateUniqueName();
  const email = generateUniqueEmail(name);
  const date = randomDate(2025, 10, 2026, 10, 24);

  let title, body;
  if (isHinglish) {
    title = pick(HI_TITLES_3);
    const hook = pick(HI_HOOKS);
    const mid = pick(HI_MIDDLES);
    const conc = pick(HI_CONCLUSIONS_3);
    body = `${hook} ${mid} ${conc}`;
  } else {
    title = pick(EN_TITLES_3);
    const hook = pick(EN_HOOKS);
    const mid = pick(EN_MIDDLES);
    const conc = pick(EN_CONCLUSIONS_3);
    body = `${hook} ${mid} ${conc}`;
  }

  reviews.push({
    title,
    body,
    rating: 3,
    review_date: date,
    reviewer_name: name,
    reviewer_email: email,
    product_id: PRODUCT_ID,
    product_handle: PRODUCT_HANDLE
  });
}

// Shuffle reviews so ratings and dates are naturally interspersed
shuffle(reviews);

// Write to CSV
const csvRows = [
  'title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle'
];

for (const r of reviews) {
  csvRows.push([
    escapeCsv(r.title),
    escapeCsv(r.body),
    r.rating,
    r.review_date,
    escapeCsv(r.reviewer_name),
    escapeCsv(r.reviewer_email),
    r.product_id,
    r.product_handle
  ].join(','));
}

fs.writeFileSync(CSV_FILE, csvRows.join('\n'), 'utf8');

console.log(`Created: ${CSV_FILE} with ${reviews.length} reviews.`);

// Summary stats
const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
reviews.forEach(r => ratingCounts[r.rating]++);
console.log('Final Ratings:', ratingCounts);
const avg = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2);
console.log(`Average Rating: ${avg} / 5.00`);
