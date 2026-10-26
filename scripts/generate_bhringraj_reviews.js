const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'bhringraj_only_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// Bhringraj Powder: 200 g / ₹400
// Botanical: Eclipta prostrata, leaves and aerial parts, hair and scalp packs
const PRODUCT_ID = '8531585433786';
const PRODUCT_HANDLE = 'bhringraj-powder'; // Official handle in Shopify

// 1k plus random number (e.g. 1064 reviews)
const TARGET_TOTAL = 1064;

// Seeded PRNG for reproducible, rich randomness
let seed = 321654987;
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
// ENGLISH REVIEW DATA — BHRINGRAJ POWDER
// Details: 200g / ₹400, Eclipta prostrata leaves and aerial parts,
// traditional hair and scalp pack, root conditioning, sectioning application,
// patch test, strand test on grey/light hair, clean dry utensil, rinse/cleanse thoroughly.
// Claim limits: No hair regrowth claims, no medical scalp treatment claims.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "Traditional Keshraj scalp pack at its finest",
  "Pure Eclipta prostrata leaves and aerial parts",
  "Deeply cooling and grounding scalp-pack ritual",
  "Nourishes hair roots and soothes scalp foundation",
  "The 200g jar is pure Ayurvedic heritage",
  "Noticeable richness and natural dark luster",
  "Essential weekly scalp and root conditioning step",
  "Clean roots and touchably soft hair lengths",
  "So grounding and relaxing across the crown",
  "Mixes into a silky smooth botanical paste",
  "Rinses out thoroughly with clean water",
  "Authentic herbal fragrance of dried Bhringraj leaves",
  "My Sunday scalp-care ritual for deep nourishment",
  "Worth every single rupee of the ₹400 price tag",
  "Leaves scalp feeling calm, fresh and revitalized",
  "No synthetic additives, 100% pure botanical leaves",
  "Sectioned application gives roots deep plant care",
  "Strand test gave my dark hair a beautiful sheen",
  "Scalp feels balanced and lengths have healthy bounce",
  "Pure single-botanical quality you can truly trust",
  "Airtight 200g jar keeps the leaf powder fresh",
  "Followed pack directions, results are deeply satisfying"
];

const EN_TITLES_4 = [
  "Very soothing scalp pack, takes plenty of water to rinse",
  "Great root conditioning, make sure to follow with a wash",
  "High quality 200g jar, wish a wooden spatula was included",
  "Leaves roots nourished, earthy aroma takes getting used to",
  "Good hair and scalp pack, store sealed in a dry place",
  "Strand test is important for lighter hair, but results are lovely",
  "Very good ₹400 value for pure aerial parts, mix fresh each time",
  "Nourishes scalp well, make sure to use a clean dry spoon",
  "Noticeable root freshness, discard any leftover wet paste",
  "Traditional herbal pack, sectioning hair makes application easier"
];

const EN_TITLES_3 = [
  "Authentic Bhringraj leaf pack, requires patience to prepare",
  "Nourishing herbal pack, earthy scent lingers slightly",
  "Pure botanical powder, must follow with thorough rinse and wash",
  "Good quality plant powder, application can get slightly messy",
  "Gentle scalp conditioning, requires consistent weekly application",
  "Fine herbal milling, remember to patch test and strand test first"
];

const EN_HOOKS = [
  "I mix two tablespoons of this finely milled Bhringraj leaf powder with clean water into a smooth paste as directed on the pack.",
  "Using this traditional Ayurvedic hair-and-scalp pack before my wash routine has made my scalp foundation feel so balanced.",
  "You can immediately recognize 100% pure Eclipta prostrata from its rich olive-green tone and deep earthy botanical aroma.",
  "At ₹400 for a generous 200g jar, NatureMist delivers authentic single-origin Bhringraj leaves without compromise.",
  "I did a patch test first on my inner arm as recommended, and then applied the smooth paste to my scalp and hair in neat sections.",
  "I have a few silver strands at my temples, so I followed the pack guidance and did a strand test first; it left a gorgeous dark gloss.",
  "The micro-milled aerial parts mix smoothly with clean lukewarm water in under a minute without forming stubborn clumps.",
  "After applying gently in sections and following the pack timing, it rinsed out completely with running water before my usual cleanser.",
  "I keep the 200g jar tightly sealed in a cool, dry cupboard and always scoop the powder with a clean, dry spoon.",
  "This pure Bhringraj pack gives my dark hair a rich, reflective tone that synthetic hair masks could never replicate.",
  "I love that NatureMist positions this strictly as a traditional hair-and-scalp pack without making medical or regrowth promises.",
  "Whenever my scalp feels tired or stressed from heat styling, this cooling Bhringraj pack feels remarkably grounding and calming.",
  "I prepare a fresh mixture right before my weekend shower and discard any leftover wet paste as instructed on the packaging.",
  "My roots feel so firm, buoyant, and conditioned after rinsing this out and following with a gentle botanical cleanse.",
  "The listing recommends sectioning hair during application, which makes coating the entire scalp foundation very easy.",
  "Rinsing is very smooth—plenty of running water washes away the botanical paste without leaving any gritty sand behind.",
  "My dark brown hair looks noticeably richer and full of healthy multidimensional shine after each weekly pack session.",
  "I appreciate that this is strictly pure dried leaves and aerial parts intended for cosmetic hair packs, with zero fillers.",
  "The traditional herbal aroma is completely authentic, reminding me of classical Ayurvedic therapies prepared from fresh herbs.",
  "Working the smooth paste gently through wet hair in sections leaves my scalp feeling soothed, refreshed, and deeply conditioned.",
  "The 200g jar lasts several weeks when used once a week as a focused root-and-scalp conditioning ritual."
];

const EN_MIDDLES = [
  "It washes away cleanly under running water without leaving any gritty residue or oily film behind on the scalp.",
  "My scalp feels completely calm, balanced, and soothed without any tight or uncomfortable feeling.",
  "The cooling botanical sensation across the crown during application is deeply therapeutic, grounding, and relaxing.",
  "My roots have natural lift and buoyancy, and my lengths feel conditioned, smooth, and manageable.",
  "Using a clean, dry utensil keeps the remaining powder inside the 200g jar completely fresh, dry, and lump-free.",
  "The strand check on my grey highlights gave me complete peace of mind before applying the pack across my whole head.",
  "It functions perfectly as a dedicated hair-and-scalp pack step right before my gentle wash routine.",
  "My hair feels genuinely conditioned from roots to lengths without any artificial silicone heaviness.",
  "The fine herbal milling makes spreading the paste from scalp skin to hair tips smooth and effortless."
];

const EN_CONCLUSIONS_5 = [
  "At ₹400 for 200g, this is the gold standard for pure Ayurvedic scalp care. Will definitely repurchase!",
  "Such a calming, grounding hair-and-scalp pack ritual. It has earned a permanent place in my weekly routine.",
  "Truly authentic leaf-and-stem quality. Highly recommended to anyone looking for genuine Ayurvedic root care!",
  "My scalp has never felt this refreshed and balanced. Worth every single rupee of the ₹400 price tag!",
  "100% pure single-botanical Bhringraj at an honest price. You cannot ask for better hair-pack quality.",
  "If you want authentic scalp nourishment without synthetic additives, this 200g jar is pure botanical perfection."
];

const EN_CONCLUSIONS_4 = [
  "Leaves scalp feeling refreshed and lengths conditioned. Just remember to rinse with plenty of water.",
  "Very soothing root-and-scalp pack. Remember to follow with your usual cleanser to remove all traces of paste.",
  "Takes some patience to apply in sections, but the grounding scalp feel and shine are completely worth it.",
  "High quality herbal powder. Just make sure to keep the lid tightly closed away from moisture and direct sunlight.",
  "Great ₹400 value for pure Bhringraj. Always do a strand test first if you have lighter or porous hair."
];

const EN_CONCLUSIONS_3 = [
  "Good pure Bhringraj pack. It conditions the scalp nicely, but you definitely need to follow with a thorough wash.",
  "Authentic herbal powder that feels soothing, though preparing a fresh paste each week requires dedicated time.",
  "Fine botanical quality, but be sure to patch test first, avoid irritated areas, and rinse thoroughly."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA — BHRINGRAJ POWDER
// Details: 200g / ₹400, Eclipta prostrata leaves, hair and scalp pack,
// cooling feel, section application, strand test on grey, clean dry spoon.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "₹400 me itna pure Bhringraj powder, scalp bilkul calm!",
  "Asli Keshraj botanical pack, roots itni fresh lagti hain",
  "Pehli baar authentic Eclipta prostrata leaves ka powder mila",
  "Scalp aur roots ke liye sabse best Ayurvedic hair pack",
  "Ekdum original traditional scalp conditioning routine",
  "Roots itni strong aur lengths bilkul soft feel hoti hain",
  "Scalp par jo thanda sukoon milta hai lagane ke baad, amazing!",
  "Wash out karna bohot simple hai, zero grit",
  "200g jar ki quality aur packaging 10/10 hai",
  "Clean water ke saath smooth lump-free paste banta hai",
  "Chemical wale masks se lakh guna behtar aur natural hai",
  "Mummy ko bhi iski purity aur authentic aroma bohot pasand aayi",
  "Baal bina chipchipahat ke natural gloss aur bounce dete hain",
  "₹400 ke hisab se 200g pure Bhringraj poora paisa vasool",
  "Ekdum fresh dried bhringraj leaves ki traditional mehak",
  "Bina synthetic chemicals ke itna deeply nourishing pack",
  "Pack ke directions follow kiye, results bohot badiya hain",
  "Sunday scalp pack ke liye best botanical powder",
  "Ghar pe banaya hua traditional Ayurvedic hair pack feel"
];

const HI_TITLES_4 = [
  "Pack bohot soothing hai, rinse karte waqt kaafi paani lagta hai",
  "Scalp ekdum clean hoti hai, pack ke baad wash zaroor karein",
  "Quality 10/10 hai, khushboo thodi earthy aur herbal hai",
  "Roots bilkul fresh ho jaati hain, dry spoon use karein",
  "₹400 me value great hai, sections me lagana aasan rehta hai",
  "Soothing scalp pack hai, grey baalon pe strand test zaroor karein",
  "Fresh paste banana padta hai, par scalp ka sukoon kamaal ka hai"
];

const HI_TITLES_3 = [
  "Pure bhringraj hai, par har hafte paste banana thoda tedious hai",
  "Nourishing pack hai, khushboo kaafi earthy aur traditional hai",
  "Authentic leaves powder hai, par normal cleanser se wash zaroori hai",
  "Fine herbal powder hai, lagane me thoda time aur patience chahiye",
  "Patch test zaroor karein aur dhyan se paani se rinse karein"
];

const HI_HOOKS = [
  "Maine clean water ke saath 2 chammach bhringraj leaf powder mix kiya pack ke directions ke mutabik.",
  "Ye 100% pure Eclipta prostrata leaves and aerial parts ka powder hai, open karte hi authentic herbal aroma aati hai.",
  "Sunday ko wash routine se pehle ise separate scalp-and-hair pack ki tarah lagati hu, roots bohot fresh ho jati hain.",
  "₹400 me 200g pure Bhringraj powder milna aaj kal ke market me bohot honest pricing hai.",
  "Pehle maine inner arm pe patch test kiya jaisa pack pe instruction tha, bilkul safe aur gentle raha.",
  "Scalp aur hair pe sections bana ke gently apply kiya, bohot cooling aur therapeutic feel hua.",
  "Micro-milled leaf powder hai, clean water me mix karte hi bina lumps ke smooth paste ban jata hai.",
  "Ise scalp pe lagakar pack timing ke mutabik rakha aur normal paani se rinse kiya, saara paste aaram se nikal gaya.",
  "200g jar ko hamesha tightly sealed rakhti hu aur clean dry spoon use karti hu taaki moisture na jaye.",
  "Stress aur pollution ki wajah se scalp bohot tired lagti thi, is bhringraj pack ne roots ko bilkul calm aur refreshed bana diya.",
  "Har baar fresh paste banati hu aur bacha hua wet paste discard kar deti hu jaisa label pe instruction hai.",
  "Scalp par lagane ke baad jo thanda-thanda sukoon milta hai, wo poore hafte ka stress mita deta hai.",
  "Mere temples pe thode grey baal the toh maine strand test kiya, unpe ek subtle natural rich tone aa gaya.",
  "Bina kisi synthetic chemical ya artificial perfume ke itni pure Ayurvedic conditioning dekh kar dil khush ho gaya.",
  "Wash karne ke baad regular cleanser kiya, baal bilkul silky, soft aur manageable ho gaye.",
  "Paani se rinse karne ke baad scalp itni clean aur calm feel hoti hai jaise Ayurvedic clinic me treatment karwaya ho.",
  "Mummy ne powder check kiya aur bola ki ekdum authentic bhringraj ki leaves ka powder hai, zero milawat.",
  "₹400 ka 200g pack weekly use pe aaram se 2 mahine chalta hai, value for money 100% hai."
];

const HI_MIDDLES = [
  "Wash out karna bohot simple hai, paani dhaalne se hi saara botanical paste bina kisi residue ke nikal jata hai.",
  "Scalp par jo calm aur clean feel milta hai lagane ke baad, wo bina kisi dryness ke roots ko fresh kar deta hai.",
  "Sections me apply kiya, baalon ki roots aur lengths dono pe even coverage mil gayi.",
  "Jar me hamesha clean dry spoon use karna zaroori hai taaki andar moisture na jaye aur powder fresh rahe.",
  "Roots itni light aur buoyant lagti hain bina kisi sticky ya flat feel ke.",
  "Iske baad normal wash kar lo toh roots clean aur lengths soft aur manageable rehti hain.",
  "Pure botanical leaf powder hai, koi synthetic perfume ya chemicals ka naam-o-nishan nahi hai."
];

const HI_CONCLUSIONS_5 = [
  "Sach me paisa vasool product hai! ₹400 me aisi pure Keshraj quality milna rare hai. 10/10 recommendation!",
  "Ghar pe banaya hua authentic Ayurvedic bhringraj pack feel hota hai. Loved it completely!",
  "Best scalp conditioning pack in the Indian market right now. Quality me koi compromise nahi hai.",
  "Mummy aur meri dono ki Sunday scalp favorite ban chuki hai. Dubara order zaroor karenge!",
  "Pure botanical scalp care chahiye toh aankh band karke le lo, totally worth every rupee of ₹400!",
  "Ayurvedic root nourishment ke liye NatureMist ka ye 200g jar best investment hai."
];

const HI_CONCLUSIONS_4 = [
  "Pack bohot soothing hai aur scalp calm rehti hai. Bas rinse karte waqt paani se acche se wash karein.",
  "Results bohot badiya hain. Pack ke baad apna regular wash zaroor karein taaki saara paste nikal jaye.",
  "₹400 me bohot accha 200g jar hai. Bas fresh paste banana aur clean dry spoon use karna dhyan rakhein.",
  "Jar ka lid tightly closed rakhein away from sunlight. Andar ka powder ekdum pure aur fine leaf quality hai."
];

const HI_CONCLUSIONS_3 = [
  "Pure bhringraj leaf powder hai, scalp conditioning bohot achi hai. Bas rinse achhe se karein aur wash follow karein.",
  "Accha botanical pack hai, par har hafte fresh paste banana aur rinse karna thoda time-consuming lagta hai.",
  "Patch test zaroor karein aur sections me lagayein. Scalp ko deeply soothe karta hai."
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
  console.log(`Generating ${TARGET_TOTAL} NatureMist Bhringraj Powder reviews aligned with published details (24 Oct 2026)...`);

  // Target ratings for 1064 reviews:
  // ~81.9% 5-star (872)
  // ~14.4% 4-star (153)
  // ~3.7%  3-star (39)
  const count5 = 872;
  const count4 = 153;
  const count3 = 39; // 872 + 153 + 39 = 1064

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

  // Shuffle all reviews completely
  shuffle(reviews);

  // Write CSV
  const header = 'title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle';
  const csvContent = [header, ...reviews.map(toCsvRow)].join('\n') + '\n';

  fs.writeFileSync(CSV_FILE, csvContent, 'utf8');
  console.log(`Created: ${CSV_FILE} with ${reviews.length} reviews.`);

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
