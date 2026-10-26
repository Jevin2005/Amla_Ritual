const fs = require('fs');
const path = require('path');

const NEW_CSV_FILE = path.join(__dirname, '..', 'reetha_only_1000_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// Reetha Powder: 200 g / ₹325 (MRP ₹400, 19% off)
// Botanical: Sapindus mukorossi, fruit shell, hair cleansing wash, saponin-based
const PRODUCT_ID = '8498815107258';
const PRODUCT_HANDLE = 'wildcrafted-amla-powder'; // Official handle in Shopify
const TARGET_TOTAL = 1000;

// Seeded PRNG for reproducible, rich randomness
let seed = 123456789;
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
// ENGLISH REVIEW DATA — NEETHA POWDER
// Details: 200g / ₹325 (MRP ₹400), Sapindus mukorossi fruit shell,
// natural saponins, foaming botanical wash, oil & buildup removal,
// eye-sting caution, patch test, dry spoon storage, rinse thoroughly.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "Incredible botanical lather without synthetic sulfates",
  "The ultimate natural scalp and hair wash",
  "Deeply clarifies greasy roots without stripping",
  "Authentic Sapindus mukorossi fruit-shell powder",
  "Featherlight, bouncy roots from the first wash",
  "Pure wildcrafted saponins that actually foam",
  "My weekly clarifying wash routine essential",
  "Replaced my commercial sulfate shampoo completely",
  "Outstanding value at ₹325 (19% off MRP ₹400)",
  "Cleanest scalp feel I have experienced in years",
  "Dissolves stubborn oil and wax buildup effortlessly",
  "The 200g jar is pure Ayurvedic wash perfection",
  "Natural plant saponins make wash day a joy",
  "Gentle on hair lengths and completely residue-free",
  "No synthetic detergents, pure dried fruit shell",
  "Lightweight volume and squeaky-clean roots",
  "Rinses out thoroughly with zero gritty residue",
  "Followed pack directions, lather was surprisingly rich",
  "The ₹325 price tag for 200g is unbeatable value",
  "Perfect clarifying step before conditioning",
  "Keeps excess sebum away for three full days",
  "True zero-chemical hair wash that actually works",
  "Pure earthy botanical scent of wild soapnuts",
  "So refreshing on an oily, stuffy scalp",
  "Airtight jar keeps the fine powder totally dry"
];

const EN_TITLES_4 = [
  "Cleanses thoroughly, but watch out for your eyes",
  "Great natural lather, make sure to follow with conditioner",
  "Very effective oil removal, wish a scoop came inside",
  "Pure Reetha wash, natural saponins sting if it drips",
  "Super clean roots, make sure to use a clean dry spoon",
  "Great ₹325 value, takes a few washes to get mixing ratio right",
  "Leaves scalp light, requires generous water to rinse",
  "Natural foaming wash, discard any leftover mixture",
  "Thorough clarifying, jar lid was tightly sealed upon delivery",
  "Good botanical lather, remember to tilt head back when rinsing"
];

const EN_TITLES_3 = [
  "Authentic soapnut powder, definitely keep away from eyes",
  "Cleanses well, but leaves lengths needing rich conditioner",
  "Pure botanical wash, takes patience to mix fresh each time",
  "Natural saponins foam well, but can sting sensitive eyes",
  "Good clarifying wash, make sure to patch test first",
  "Fine powder quality, application takes a bit of practice"
];

const EN_HOOKS = [
  "I mix two tablespoons of this fine fruit-shell powder with warm clean water to the exact consistency directed on the pack.",
  "Using this rinse-off botanical wash has allowed me to eliminate conventional sulfate shampoos from my wash day completely.",
  "You can immediately feel the natural saponins activating as you gently work the warm mixture through wet roots.",
  "At ₹325 for a generous 200g jar (saving ₹75 off the ₹400 MRP), NatureMist provides remarkable value for authentic Reetha.",
  "I did a patch test first as directed on the label, and then used it as a clarifying wash on my oily roots.",
  "The micro-milled fruit shell mixes smoothly with warm water in under a minute into a pourable botanical lather.",
  "After working it gently through my wet scalp without rough rubbing, it rinsed out completely with running water.",
  "I keep the 200g jar sealed in a dry cupboard and always scoop the powder with a clean, dry spoon to prevent moisture.",
  "The naturally occurring plant saponins cut right through two days of heavy sebum and styling residue.",
  "I love that NatureMist positions this strictly as a pure single botanical hair wash without synthetic detergents.",
  "Whenever my scalp feels stuffy from urban pollution, this botanical Reetha wash leaves my roots featherlight and fresh.",
  "I prepare a fresh mixture right before showering and discard any leftover wet paste as instructed on the packaging.",
  "My roots feel so airy, buoyant, and clean after rinsing this out and following with my usual conditioner on the lengths.",
  "The listing warns that saponins can sting, so I always tilt my head back while rinsing; it washed out cleanly without issue.",
  "The natural foaming action is surprisingly rich for a 100% pure plant powder with zero chemical lather boosters.",
  "Rinsing is effortless—the botanical mixture flows away completely with water, leaving zero sandy residue on the scalp.",
  "My oily scalp used to require washing every single day; with this Reetha wash, my roots stay fresh for three days.",
  "I appreciate the transparent claim limits—it is an honest botanical wash focused on scalp and hair cleansing.",
  "The earthy herbal aroma is completely authentic, exactly like traditional boiled soapnut washes our grandmothers made.",
  "Working this gentle lather through wet hair in sections leaves follicle openings clear and scalp skin thoroughly refreshed."
];

const EN_MIDDLES = [
  "It washes away cleanly under running water without leaving any slippery residue or sticky film behind.",
  "My scalp feels completely balanced, breathe-easy clean, and light without any harsh stripped feeling.",
  "The natural plant saponins provide just the right amount of cleansing slip to remove oil while protecting hair elasticity.",
  "My roots hold natural volume and lift throughout the day without needing any synthetic dry shampoo.",
  "Using a clean, dry utensil keeps the remaining powder inside the 200g jar completely fresh, dry, and free-flowing.",
  "I followed with my usual conditioner on the mid-lengths and ends as recommended, and the balance was perfect.",
  "Tilting my head back during the rinse ensured none of the saponin lather reached my eyes.",
  "My hair feels bouncy, soft, and genuinely clean without the heavy chemical coating of commercial products.",
  "The fine milling makes applying the liquid mixture through wet roots completely smooth and even."
];

const EN_CONCLUSIONS_5 = [
  "At ₹325 for 200g, this is the gold standard for pure Ayurvedic hair washing. Will definitely repurchase!",
  "Such a refreshing, clarifying wash day ritual. It has earned a permanent place in my hair care routine.",
  "Truly authentic fruit-shell quality. Highly recommended to anyone looking for clean, chemical-free cleansing!",
  "My scalp has never felt this light and buoyant. Worth every single rupee of the ₹325 price tag!",
  "100% pure single-botanical Reetha at an honest price. You cannot ask for better botanical wash quality.",
  "If you want real scalp cleansing without harsh synthetic detergents, this 200g jar is absolute perfection."
];

const EN_CONCLUSIONS_4 = [
  "Leaves roots wonderfully clean and airy. Just be very mindful of your eyes as the natural saponins do sting.",
  "Very effective botanical wash. Remember to follow with a good conditioner on your lengths if your hair is dry.",
  "Takes a wash or two to get the water-to-powder ratio right, but the scalp freshness is completely worth it.",
  "High quality wash powder. Just make sure to keep the lid tightly sealed and use a clean dry spoon every time.",
  "Great ₹325 value with the ₹75 discount. Always rinse with plenty of water for best results."
];

const EN_CONCLUSIONS_3 = [
  "Good pure soapnut wash. It cleanses deeply, but definitely keep it away from eyes and follow with conditioner.",
  "Authentic powder that cleanses oil well, though mixing a fresh paste on busy mornings requires patience.",
  "Fine botanical quality, but be sure to patch test first and rinse thoroughly with eyes closed tightly."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA — NEETHA POWDER
// Details: 200g / ₹325 (MRP ₹400), Sapindus mukorossi, natural saponins,
// oil removal, clean roots, eye-sting caution, dry spoon, fresh mix.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "₹325 me itna pure Reetha powder, scalp bilkul saaf!",
  "Bina kisi chemical sulfate ke natural botanical lather",
  "Pehli baar authentic Sapindus mukorossi fruit shell mila",
  "Oily scalp ke liye sabse best natural hair wash",
  "Ekdum original Ayurvedic wash-day routine",
  "Roots itni light aur airy feel hoti hain wash ke baad",
  "Scalp par jo refreshing clean feel milta hai, awesome!",
  "Wash out karna bohot simple hai, zero grit",
  "200g jar ki quality aur packaging 10/10 hai",
  "Clean water ke saath smooth foaming mixture banta hai",
  "Chemical shampoo hamesha ke liye band kar diya",
  "Mummy ko bhi iski purity bohot pasand aayi",
  "Excess oil aur everyday buildup poora saaf ho gaya",
  "₹325 (MRP ₹400) ke hisab se poora paisa vasool",
  "Ekdum fresh dried reetha ki authentic khushboo aati hai",
  "Bina synthetic detergent ke itna clean feel",
  "Pack ke directions follow kiye, results badiya hain",
  "Pre-wash mask ke baad best clarifying wash",
  "Ghar pe banaya hua traditional soapnut wash feel"
];

const HI_TITLES_4 = [
  "Wash bohot badiya hai, bas aankhon me mat jaane dena",
  "Scalp ekdum clean hoti hai, lengths pe conditioner zaroor lagayein",
  "Quality 10/10 hai, saponins ki wajah se aankh me lagta hai",
  "Roots bilkul fresh ho jaati hain, dry spoon use karein",
  "₹325 me value great hai, mixing ratio samajhne me 1-2 wash lage",
  "Natural foam accha hai, rinse karte waqt sir peeche rakhein",
  "Fresh mixture banana padta hai, par oil poora saaf hota hai"
];

const HI_TITLES_3 = [
  "Pure reetha hai par aankhon me bohot tez lagta hai",
  "Cleansing acchi hai par bina conditioner ke baal thode dry lagenge",
  "Authentic wash hai, par har hafte fresh paste banana tedious hai",
  "Fine powder hai, scoop karte waqt dhyan rakhna padta hai",
  "Patch test zaroor karein aur aankh band rakh ke rinse karein"
];

const HI_HOOKS = [
  "Maine clean warm water ke saath 2 chammach reetha powder mix kiya pack ke directions ke mutabik.",
  "Ye 100% pure Sapindus mukorossi fruit-shell powder hai, paani milate hi natural saponins foam banane lagte hain.",
  "Sunday wash day pe ise botanical rinse-off wash ki tarah use karti hu, scalp ka sara extra oil saaf ho jata hai.",
  "₹325 me 200g pure Reetha powder milna (MRP ₹400 se ₹75 off) bohot honest pricing hai.",
  "Pehle maine inner arm pe patch test kiya jaisa pack pe instruction tha, bilkul safe raha.",
  "Wet scalp pe gently apply kiya bina rough rub kiye, natural plant saponins ne bohot accha lather diya.",
  "Micro-milled powder hai, warm water me mix karte hi bina lumps ke smooth pourable mixture ban jata hai.",
  "Ise scalp pe gently massage karke normal paani se rinse kiya, saara mixture bina kisi residue ke nikal gaya.",
  "200g jar ko hamesha tightly sealed rakhti hu aur clean dry spoon use karti hu taaki andar paani na jaye.",
  "Oily scalp ki wajah se har doosre din baal chipchipe ho jate the, is reetha wash ne roots ko fresh aur bouncy bana diya.",
  "Har baar fresh mixture banati hu aur bacha hua wet paste discard kar deti hu jaisa label pe likha hai.",
  "Scalp par wash karne ke baad jo halka aur clean feel milta hai, wo kisi chemical shampoo se nahi mila.",
  "Pack pe warning thi ki saponins aankhon me lagte hain, isliye rinse karte waqt sir peeche rakha aur aankhein band rakhi.",
  "Bina kisi synthetic chemical ya sulfate ke itni pure Ayurvedic cleansing dekh kar dil khush ho gaya.",
  "Wash karne ke baad lengths pe apna regular conditioner lagaya, baal bilkul silky aur light ho gaye.",
  "Paani se rinse karne ke baad scalp itni saaf feel hoti hai jaise salon me clarifying treatment karwaya ho.",
  "Mummy ne check kiya aur bola ki ekdum authentic reetha ke chhilke ka powder hai, zero milawat.",
  "₹325 ka 200g pack weekly wash pe aaram se 2 mahine chalta hai, value for money 100% hai."
];

const HI_MIDDLES = [
  "Wash out karna bohot simple hai, paani dhaalne se hi saara botanical foam bina kisi residue ke nikal jata hai.",
  "Scalp par jo breathe-easy clean feel milta hai lagane ke baad, wo pura grease aur oil saaf kar deta hai.",
  "Sir peeche karke rinse kiya taaki saponins aankhon me na jayein, bohot aaram se wash out ho gaya.",
  "Jar me hamesha clean dry spoon use karna zaroori hai taaki andar moisture na jaye aur powder fresh rahe.",
  "Roots itni light aur voluminous lagti hain bina kisi sticky ya flat feel ke.",
  "Iske baad lengths pe thoda conditioner laga lo toh roots clean aur lengths soft rehti hain.",
  "Pure botanical fruit-shell powder hai, koi synthetic perfume ya artificial foam booster nahi hai."
];

const HI_CONCLUSIONS_5 = [
  "Sach me paisa vasool product hai! ₹325 me aisi pure quality milna rare hai. 10/10 recommendation!",
  "Ghar pe banaya hua authentic Ayurvedic soapnut wash feel hota hai. Loved it completely!",
  "Best natural hair wash in the Indian market right now. Quality me koi compromise nahi hai.",
  "Mummy aur meri dono ki wash-day favorite ban chuki hai. Dubara order zaroor karenge!",
  "Pure botanical hair cleansing chahiye toh aankh band karke le lo, totally worth every rupee of ₹325!",
  "Chemical shampoo chhod kar natural wash pe switch karne ke liye NatureMist ka ye 200g jar best hai."
];

const HI_CONCLUSIONS_4 = [
  "Wash bohot badiya hai aur scalp fresh ho jaati hai. Bas aankhon ka dhyan rakhein kyunki saponins sting karte hain.",
  "Results kamaal ke hain. Lengths agar dry hain toh wash ke baad conditioner zaroor use karein.",
  "₹325 me bohot accha 200g jar hai. Bas fresh paste banana aur clean dry spoon use karna dhyan rakhein.",
  "Lid thodi tight thi packaging me, par andar ka powder ekdum pure aur fine fruit-shell quality hai."
];

const HI_CONCLUSIONS_3 = [
  "Pure reetha powder hai, cleansing bohot strong hai. Bas aankhon se bachana zaroori hai aur conditioner lagana padta hai.",
  "Accha botanical wash hai, par har hafte fresh paste banana thoda time-consuming lagta hai.",
  "Patch test zaroor karein aur aankh band karke dhoye. Scalp ka extra oil poora nikal deta hai."
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
  console.log(`Generating ${TARGET_TOTAL} NatureMist Reetha Powder reviews aligned with published details (24 Oct 2026)...`);

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

  fs.writeFileSync(NEW_CSV_FILE, csvContent, 'utf8');
  console.log(`Created: ${NEW_CSV_FILE} with ${reviews.length} reviews.`);

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
