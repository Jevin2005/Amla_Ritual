const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'indigo_only_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// Indigo Powder: 200 g / ₹350 (MRP ₹450, 22% off)
// Botanical: Indigofera tinctoria leaves, botanical hair colouring, two-step henna-indigo routine,
// strand test, patch test, gloves recommendation, rinse without immediate shampoo to allow oxidation.
const PRODUCT_ID = '8531585368250';
const PRODUCT_HANDLE = 'reetha-powder'; // Official handle in Shopify backend for Indigo Powder

// 1k plus random number (e.g. 1036 reviews)
const TARGET_TOTAL = 1036;

// Seeded PRNG for reproducible, rich randomness
let seed = 789456123;
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
  const last = (parts[1] || 'verma').replace(/[^a-z]/g, '');

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
// ENGLISH REVIEW DATA — INDIGO POWDER
// Details: 200g / ₹350 (MRP ₹450, 22% off), Indigofera tinctoria leaf powder,
// botanical hair coloring, two-step henna-indigo process for dark tones,
// patch test, strand test, use gloves, apply immediately after mixing with warm water,
// allow 24-48 hrs for color oxidation before shampooing, external hair care only.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "Flawless natural dark brown tone with zero ammonia",
  "Pure Indigofera tinctoria leaves at exceptional quality",
  "Two-step henna and indigo gave rich black coverage",
  "Deep botanical hair coloring that looks completely natural",
  "The 200g pack gives multiple coloring sessions for ₹350",
  "Fresh grassy green powder that releases rich blue-black pigment",
  "Covers greys naturally when followed after henna",
  "No synthetic PPD, no burning sensation, just pure plant leaves",
  "Did the recommended strand test and loved the depth of shade",
  "Mixes immediately with warm water into an easy-spread paste",
  "Rinses clean with warm water, color oxidized to a gorgeous dark tone",
  "Gentle botanical hair color that respects hair texture",
  "Worth every single rupee of the ₹350 price tag",
  "Authentic leaf powder without chemical dye additives",
  "Glossy, healthy-looking dark locks without scalp irritation",
  "Followed the two-step instructions and results exceeded expectations",
  "Resealable 200g pouch kept the leaf powder fresh and potent",
  "Micro-milled leaf texture applies smoothly without flaking off",
  "Natural botanical darkening ritual I now swear by",
  "Pure single-botanical quality from NatureMist"
];

const EN_TITLES_4 = [
  "Great natural dark tone, remember to wear gloves during application",
  "Deep color payoff, takes 24-48 hours to fully oxidize",
  "High quality 200g pack, must be applied immediately after mixing",
  "Rich dark results, make sure to do a henna base first for grey coverage",
  "Effective botanical coloring, avoid shampoo for 48 hours for best results",
  "Very good ₹350 value, strand test on greys is essential to gauge timing",
  "Leaves hair glossy and dark, rinsing takes plenty of water",
  "Pure plant dye, prepare fresh and discard any leftover wet mixture"
];

const EN_TITLES_3 = [
  "Pure indigo leaf powder, requires two-step henna routine for stubborn greys",
  "Good botanical color, earthiness lingers until the first wash",
  "Authentic Indigofera powder, application requires patience and gloves",
  "Natural darkening without PPD, but takes dedication to prep and rinse",
  "Fine leaf milling, remember to patch test and strand test first"
];

const EN_HOOKS = [
  "I used this pure Indigo leaf powder as step two immediately after my henna treatment, following the pack directions.",
  "At ₹350 for 200g, NatureMist provides pure Indigofera tinctoria leaves without any harmful PPD, metallic salts, or ammonia.",
  "You can tell this indigo is fresh by its bright grassy green color and authentic hay-like herbal fragrance.",
  "I did the recommended patch test first, and also did a strand test on a hidden section to check the oxidation time.",
  "I mixed the powder with lukewarm water into a smooth paste and applied it immediately, wearing protective gloves.",
  "After leaving the paste under a shower cap for 75 minutes, I rinsed it thoroughly with plain water without shampoo.",
  "Over the next 36 hours, the botanical pigment oxidized in the air into a breathtaking, natural dark black-brown.",
  "My silver strands along the hairline absorbed the two-step color seamlessly and look completely natural.",
  "I keep the resealable 200g pouch stored in a cool, dry cupboard and always scoop out powder with a dry spoon.",
  "Unlike chemical box dyes that irritate my sensitive scalp, this pure plant powder felt soothing and gentle.",
  "I love that NatureMist transparently explains the botanical coloring process without making exaggerated claims.",
  "Preparing the indigo paste right before application ensures the delicate pigment doesn't degrade before it hits your hair.",
  "Rinsing takes plenty of running water, but once washed out, my hair felt soft, conditioned, and full of natural body.",
  "The 200g quantity easily lasts for 3 to 4 root-touchup sessions, making it incredibly economical at ₹350.",
  "Following the advice to avoid shampoo for two days allowed the color to settle into a rich, deep, lustrous shade.",
  "The finely milled leaf powder mixes smoothly without stubborn clumps, spreading easily along parted sections.",
  "My hair looks naturally glossy and healthy, with zero artificial blue tint because I followed a proper henna foundation.",
  "I appreciate that this is 100% single-origin botanical leaf powder intended strictly for external cosmetic hair coloring.",
  "Wearing gloves as advised on the package prevented any temporary staining on my nails or cuticles.",
  "This is the most reliable, clean botanical indigo powder I have tested in years of natural hair care."
];

const EN_MIDDLES = [
  "It rinses away cleanly with warm water, leaving no gritty residue clinging to my scalp or roots.",
  "My scalp feels completely comfortable and calm, with zero tingling or itching that chemical dyes usually cause.",
  "The color oxidation over the following day deepened the shade from greenish-blue into a stunning rich brunette.",
  "My hair feels thickened, nourished, and conditioned rather than stripped or straw-like.",
  "Keeping the pouch zipped tight preserves the dye potency and prevents humidity from degrading the leaf powder.",
  "The strand test gave me exact clarity on leaving it on for 70 minutes to achieve my desired depth.",
  "It integrates seamlessly into my monthly two-step botanical coloring ritual for root maintenance.",
  "My greys blend completely into the rest of my dark hair with authentic multidimensional warmth.",
  "The ultra-fine milling allows the wet paste to coat every single hair strand evenly from root to tip."
];

const EN_CONCLUSIONS_5 = [
  "At ₹350 for 200g, this is hands-down the best pure indigo leaf powder on the market. Will repurchase every month!",
  "Such an empowering, clean botanical hair-coloring ritual. Goodbye chemical box dyes forever!",
  "Truly authentic Indigofera leaf quality that gives rich dark tones without harsh chemicals. Highly recommended!",
  "My hair looks and feels healthier than ever. Worth every single rupee of the ₹350 price tag!",
  "100% pure single-botanical Indigo with honest pricing. You cannot ask for better natural hair coloring.",
  "If you want rich dark hair and grey blending without chemical damage, this 200g pouch is pure perfection."
];

const EN_CONCLUSIONS_4 = [
  "Leaves hair naturally dark and glossy. Just remember to wear gloves and rinse with plain water without shampoo.",
  "Very rich botanical color payoff. Always do a henna foundation first if you are covering noticeable greys.",
  "Takes dedicated time for the two-step process, but the natural results and scalp health are totally worth it.",
  "High quality indigo powder. Make sure to apply immediately after mixing with warm water before the dye expires.",
  "Great ₹350 value for 200g. Give the color 24 to 48 hours to fully oxidize before judging the final tone."
];

const EN_CONCLUSIONS_3 = [
  "Good pure indigo powder for hair coloring, but you must follow a two-step henna process for grey coverage.",
  "Authentic leaf quality that darkens nicely, though the botanical prep and application require patience.",
  "Fine plant powder, just be sure to patch test first, use gloves, and allow 48 hours for oxidation."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA — INDIGO POWDER
// Details: 200g / ₹350, Indigofera tinctoria pattiya (Neel leaves),
// two-step henna-indigo routine for dark brown/black hair,
// strand test, patch test, gloves use, apply immediately, 24-48 hrs oxidation,
// clean dry spoon, no regrowth claims.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "Henna ke baad ye indigo lagaya, natural dark black color mila",
  "Pure Indigofera tinctoria leaves, chemical dyes se mukti",
  "Two-step coloring routine ke liye best authentic Indigo powder",
  "Grey hair naturally blend ho gaye bina kisi ammonia ke",
  "200g pouch ₹350 me sach me bohot economical aur pure hai",
  "Ekdum fresh hari patti ka powder jo naturally dark tone deta hai",
  "Zero itching, zero burning, scalp bilkul safe aur calm rahi",
  "Pehle strand test kiya tha, color output sach me kamaal ka aaya",
  "Gungune pani me mix karte hi silky paste bani aur smooth apply hui",
  "48 ghante me color naturally oxidize ho kar rich black ban gaya",
  "Baal dry nahi hue balki natural shine aur body mil gayi",
  "Henna ke step 2 me use kiya, perfect dark brown black shade aaya",
  "₹350 me 200g pure botanical leaf powder worth every single rupee",
  "NatureMist ki indigo quality sach me 100% pure aur authentic hai",
  "Gloves pehan kar lagaya, koi mess ya hath par stain nahi hua",
  "Resealable 200g pouch fresh rehta hai, dry spoon se use kiya",
  "White hair naturally cover ho gaye, artificial feel bilkul nahi",
  "Pure single-botanical quality, koi synthetic dye ya PPD nahi",
  "Baal touch karne me soft aur naturally dense lagte hain",
  "Mera regular monthly botanical coloring ritual ban chuka hai"
];

const HI_TITLES_4 = [
  "Bahut acha dark color deta hai, application ke waqt gloves zaroor pehnein",
  "Deep color payoff hai, final black tone aane me 24-48 ghante lagte hain",
  "Quality 200g pouch badiya hai, mix karne ke turant baad lagana zaroori hai",
  "Grey baalon par pehle henna lagana padega, fir indigo se dark color aayega",
  "Effective botanical color hai, 2 din tak shampoo avoid karein taaki color pakka ho",
  "₹350 me pure Indigofera leaves, grey baal par timing check karne ke liye strand test karein",
  "Baal shiny aur dark ho jate hain, wash karne me thoda extra pani lagta hai",
  "Pure plant dye hai, har baar fresh paste banayein aur bachi hui phenk dein"
];

const HI_TITLES_3 = [
  "Pure indigo powder hai, par white baal cover karne ke liye 2-step henna zaroori hai",
  "Acha botanical color hai, patti ki natural smell pehle wash tak thodi rehti hai",
  "Asli Indigofera hai, lagane me thoda patience aur gloves ka use karna padta hai",
  "Bina PPD ka natural darkening pack hai, bas prepare aur rinse karne me time lagta hai",
  "Fine leaf milling hai, use karne se pehle patch test aur strand test zaroor karein"
];

const HI_HOOKS = [
  "Maine henna lagane ke turant baad step two me ye pure Indigo powder lagaya, jaise instructions me diya tha.",
  "₹350 me 200g pure Indigofera tinctoria leaf powder bina PPD ya ammonia ke milna NatureMist ka bohot bada plus point hai.",
  "Pouch kholte hi fresh green leaf powder aur sukhi ghaas jaisi authentic khushboo se pata chalta hai ki ye bilkul taaza hai.",
  "Maine pehle pack ke hisab se patch test kiya aur ek hidden strand par color test karke timing check ki.",
  "Maine gungune pani ke sath smooth paste banayi aur bina der kiye turant gloves pehan kar baalon me lagayi.",
  "Shower cap laga kar 75 minute rakha aur fir sirf saade taaza paani se achhe se rinse kar liya.",
  "Agli subah tak hawa lagne se color oxidize ho kar ekdum pyara natural dark brown-black ban gaya.",
  "Mere aage ke silver strands henna aur indigo ke 2-step se aisi natural tarah blend hue ki koi keh hi nahi sakta.",
  "Main 200g pouch ko moisture se door sukhi jagah rakhta hoon aur hamesha dry spoon se powder nikalta hoon.",
  "Chemical hair color se jo scalp par jalan hoti thi, is pure botanical powder se bilkul aaram raha.",
  "Mujhe pasand aaya ki NatureMist ne process bohot honestly samjhaya hai bina jhoothe promises ke.",
  "Indigo paste ko banate hi lagana hota hai taaki natural dye release baalon par hi oxidize ho sake.",
  "Paani se wash karne ke baad baal rough ya dry nahi hue, balki unme ek natural bounce aur softness thi.",
  "200g pack se aaram se 3 se 4 baar root touch-up ho jata hai, ₹350 me bohot hi economical hai.",
  "Pack ki advice follow karte huye maine 2 din shampoo nahi kiya, jisse color bohot deep aur lasting ho gaya.",
  "Powder itna finely milled hai ki bina kisi moti gath ke smooth paste ban jati hai aur easily lagti hai.",
  "Mere baalon me koi blue ya ajeeb shade nahi aaya kyunki maine pehle proper henna base lagaya tha.",
  "Mujhe acha laga ki ye sirf sukhi patti ka pure powder hai jo cosmetic hair coloring ke liye banaya gaya hai.",
  "Gloves pehan kar lagane se hathon aur nakhunon par koi rang nahi chadha aur application clean raha.",
  "Years of experimenting ke baad mujhe ye sabse reliable aur clean botanical indigo powder laga hai."
];

const HI_MIDDLES = [
  "Gungune paani se rinse karne ke baad scalp bilkul saaf ho gayi, koi kankad ya residue nahi bacha.",
  "Scalp par koi khujli ya jalan bilkul nahi hui, pure herbal product ka yahi sabse bada fayda hai.",
  "Ek din ke andar air exposure se rang deepen ho kar natural dark black-brown me badal gaya.",
  "Baal chemically dry hone ke bajaye naturally conditioned aur hydrated mehsus huye.",
  "Pouch ko tight band rakhne se bacha hua indigo powder moisture se bacha rehta hai aur agle use ke liye fresh rehta hai.",
  "Hidden strand test pehle karne ki wajah se mujhe pata chal gaya tha ki kitni der pack ko rakhna hai.",
  "Monthly root touch-up ke 2-step ritual me ye powder perfect fit hota hai.",
  "Grey hair natural black baalon ke sath seamlessly match ho gaye bina kisi artificial look ke.",
  "Fine micro-milled powder ki wajah se paste baalon ke har ek strand par evenly coat ho gayi."
];

const HI_CONCLUSIONS_5 = [
  "₹350 me 200g pure indigo powder ke liye best option hai. Har mahine isi ko order karunga!",
  "Chemical dyes ko hamesha ke liye bye bolne ka best tarika hai. Aisa natural dark shade milna mushkil hai!",
  "Asli Indigofera patti ki quality jo scalp ko bina damage kiye pyara dark tone deti hai. Highly recommended!",
  "Mere baal pehle se bohot zyada healthy aur glossy lag rahe hain. ₹350 poori tarah wasool hain!",
  "100% pure single-botanical Indigo bina kisi chemical milaawat ke. Best natural hair coloring!",
  "Agar aapko chemical ke bina natural dark baal chahiye, toh ye 200g pouch ekdum perfect choice hai."
];

const HI_CONCLUSIONS_4 = [
  "Baal naturally dark aur shiny ho jate hain. Bas gloves zaroor pehnein aur plain water se hi rinse karein.",
  "Bohot acha color payoff hai. Grey baal wale pehle henna ka base zaroor lagayein tabhi dark tone aayega.",
  "2-step process me time lagta hai, par natural healthy result dekh kar poori mehnat safal lagti hai.",
  "High quality indigo powder hai. Gungune paani me mix karte hi turant lagana zaroori hai.",
  "₹350 me 200g ki deal bohot badiya hai. Final shade dekhne ke liye 24 se 48 ghante ka time zaroor dein."
];

const HI_CONCLUSIONS_3 = [
  "Pure indigo powder hai par white baal cover karne ke liye henna ke sath 2-step routine hi follow karni padegi.",
  "Achi quality hai jo baalon ko naturally dark karti hai, bas prepare karne aur lagane me thoda patience chahiye.",
  "Natural powder hai, pehle patch test karein, gloves pehnein aur 48 hours tak shampoo use na karein."
];

// Helper to escape CSV field
function escapeCsv(str) {
  if (typeof str !== 'string') str = String(str);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate the 1,036 reviews
console.log(`Generating ${TARGET_TOTAL} NatureMist Indigo Powder reviews aligned with published details (24 Oct 2026)...`);

const reviews = [];

// Breakdown for 1,036 reviews:
// 5 stars: ~848 (81.9%)
// 4 stars: ~151 (14.6%)
// 3 stars: ~37 (3.5%)
// Target total: 848 + 151 + 37 = 1036
const TARGET_5 = 848;
const TARGET_4 = 151;
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
