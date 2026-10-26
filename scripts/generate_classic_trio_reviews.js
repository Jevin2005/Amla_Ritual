const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'classic_trio_only_reviews_judgeme.csv');

// Published verified Shopify catalog details (Checked 24 October 2026)
// NatureMist Classic Trio: 3 x 200 g jars (600 g total) / ₹849
// Includes: Amla (200g fruit pack), Reetha (200g soapnut wash), Shikakai (200g cleansing pod)
// Note: Separately packed jars, not a premixed formula.
const PRODUCT_ID = '10392444928186';
const PRODUCT_HANDLE = 'classic-trio';

// 1k plus random number (e.g. 1052 reviews)
const TARGET_TOTAL = 1052;

// Seeded PRNG for reproducible, rich randomness
let seed = 987123456;
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
// ENGLISH REVIEW DATA — NATUREMIST CLASSIC TRIO
// Details: 3 x 200g jars (600g total) / ₹849
// Includes: Amla Powder, Reetha Powder, Shikakai Powder
// Essential characteristics:
// - Separately packed jars (not a pre-mixed compromise)
// - Reetha + Shikakai for botanical cleansing wash routine
// - Amla for separate traditional hair packs
// - Store tightly closed in dry place, use clean dry spoon, patch test, discard unused wet paste.
// - Strictly external hair-care; no medical/regrowth claims.
// -------------------------------------------------------------
const EN_TITLES_5 = [
  "The ultimate traditional herbal wash and pack trio",
  "Three separate 200g jars give full routine control",
  "Reetha and Shikakai wash clean, Amla packs condition deeply",
  "Pure Ayurvedic trio without premixed shortcuts",
  "Total 600g botanical power at unbeatable ₹849 value",
  "Zero synthetic sulfates, pure botanical hair cleansing",
  "Clean bouncy scalp and naturally conditioned hair lengths",
  "So glad they are separate jars rather than a pre-mix",
  "The gold standard routine for chemical-free hair care",
  "Gentle foaming wash from Reetha and silky detangling Shikakai",
  "My weekly Sunday hair-wash and pack ritual is complete",
  "Rinses out completely with clean water, no residue",
  "Authentic herbal fragrance from all three fresh powders",
  "Replaced all chemical shampoos with this trio",
  "Roots feel ultra light and scalp feels genuinely refreshed",
  "Followed the separate wash and pack directions with fantastic results",
  "Three sturdy 200g jars keep every botanical perfectly fresh",
  "Micro-milled botanicals mix into smooth, lump-free preparations",
  "Pure single-botanical transparency in one convenient set",
  "Worth every single rupee of the ₹849 price tag"
];

const EN_TITLES_4 = [
  "Very good traditional trio, takes time to boil and brew",
  "Great cleansing and conditioning, wish a scoop came inside",
  "High quality 600g set, learning the Reetha ratio takes a try",
  "Leaves scalp fresh, takes plenty of water to rinse all powders",
  "Excellent botanical set, store strictly away from moisture",
  "Very solid ₹849 value for three full 200g jars",
  "Cleanses oils well, remember to discard leftover wet mixture",
  "Gentle on scalp, keep dry spoons for each jar"
];

const EN_TITLES_3 = [
  "Authentic 3-powder collection, requires patience on wash days",
  "Good pure botanicals, herbal prep is messy compared to shampoo bottles",
  "Pure single powders, takes several rinses to clear every particle",
  "Decent traditional trio, adjusting individual proportions takes practice",
  "Fine herbal milling, remember to patch test each powder first"
];

const EN_HOOKS = [
  "Receiving three separate 200g jars rather than a premixed powder is the smartest design—I can customize my wash and pack routines perfectly.",
  "I brew Reetha and Shikakai together in warm water for a gentle cleansing wash, and keep Amla for a separate nourishing hair pack.",
  "At ₹849 for a total of 600g across three pure botanicals, NatureMist delivers exceptional value for a completely chemical-free routine.",
  "The natural saponins from Reetha produce a pleasant botanical lather that washes away scalp buildup without stripping my hair dry.",
  "I did the recommended patch test with each powder before first use, and then set up my traditional Sunday wash routine.",
  "Shikakai gives the wash mix such smooth slip, while Amla provides rich botanical conditioning that leaves my hair glossy and light.",
  "All three powders are micro-milled to perfection, blending into smooth pastes without stubborn grit or sandy residues.",
  "After washing out the Reetha-Shikakai brew and finishing with an Amla pack, my hair detangles effortlessly with clean running water.",
  "I store the three 200g jars securely in my dry vanity and always scoop each botanical with a separate, clean dry spoon.",
  "This trio has completely replaced synthetic sulfate shampoos and heavy silicone conditioners on my bathroom shelf.",
  "I love that NatureMist transparently provides single botanicals in separate jars instead of hiding behind a generic premix.",
  "Whenever my scalp feels weighed down by city pollution, this herbal wash and conditioning ritual restores natural buoyancy.",
  "I prepare the wash and pack fresh before my bath and discard any leftover wet mixture as advised on the jars.",
  "My hair feels genuinely clean, soft, and bouncy from roots to tips without any artificial plastic film.",
  "The listing recommends using Reetha and Shikakai for cleansing and Amla for packs, which matches classical Ayurvedic practices.",
  "Rinsing is very clean—copious running water washes away the botanical particles without leaving gritty residues in my comb.",
  "My dark wavy hair looks noticeably glossier and feels soft and manageable throughout the work week.",
  "I appreciate that each jar contains 100% pure single botanicals intended strictly for external cosmetic hair care.",
  "The authentic earthy aromas of dried fruit pulp, shell, and pod give a true sensory ritual experience.",
  "The 600g total volume lasts for months of weekly rituals, making it easily the most cost-effective hair care purchase I have made."
];

const EN_MIDDLES = [
  "It rinses away cleanly under running water without leaving any heavy residue or grease on the scalp.",
  "My scalp feels completely calm, balanced, and soothed without any dryness or tight feeling.",
  "The gentle plant saponins clean effectively while preserving the natural lipid moisture of my hair strands.",
  "My roots have natural lift and volume, and my lengths feel touchably soft and easy to detangle.",
  "Using a dry spoon keeps all three jars perfectly fresh, clump-free, and protected from bathroom humidity.",
  "The separate jars allow me to fine-tune more Reetha for oiled hair days or extra Shikakai for dry ends.",
  "It functions perfectly as a complete two-phase ritual: herbal wash first, followed by a separate fruit pack.",
  "My hair feels nourished and refreshed without any synthetic perfumes or chemical foaming agents.",
  "The fine herbal milling makes straining or rinsing the liquid and paste smooth and hassle-free."
];

const EN_CONCLUSIONS_5 = [
  "At ₹849 for 600g of pure botanicals, this Classic Trio is the gold standard of Ayurvedic hair care. Will definitely repurchase!",
  "Such a revitalizing, grounding wash-and-pack ritual. It has earned a permanent place in my weekly routine.",
  "Truly authentic quality with complete ingredient transparency. Highly recommended to anyone ditching chemical shampoos!",
  "My scalp has never felt this clean and balanced. Worth every single rupee of the ₹849 price tag!",
  "100% pure separate botanicals at an honest price. You cannot ask for a more thoughtful hair care collection.",
  "If you want traditional cleansing and conditioning without synthetic additives, this Classic Trio is absolute perfection."
];

const EN_CONCLUSIONS_4 = [
  "Leaves scalp fresh and lengths conditioned. Just remember to rinse with plenty of water to clear all plant particles.",
  "Very effective botanical wash and pack. Make sure to keep the jars sealed tight away from bathroom steam.",
  "Takes a bit of preparation compared to bottled shampoo, but the healthy scalp feel and shine are completely worth it.",
  "High quality 3-jar set. Always prepare fresh mixtures and discard any unused wet brew.",
  "Great ₹849 value for 600g. Using separate clean dry spoons keeps the powders fresh for months."
];

const EN_CONCLUSIONS_3 = [
  "Good pure botanicals that clean nicely, though brewing and rinsing three powders requires dedicated shower time.",
  "Authentic trio that leaves hair soft, but adjusting the exact wash ratio takes a couple of trials.",
  "Fine plant quality, just remember to patch test each powder first and rinse thoroughly with clean water."
];

// -------------------------------------------------------------
// HINGLISH REVIEW DATA — NATUREMIST CLASSIC TRIO
// Details: 3 x 200g jars / ₹849, Amla, Reetha, Shikakai separate jars,
// Reetha + Shikakai herbal wash, Amla hair pack, separate jars advantage,
// clean dry spoon, patch test, discard unused paste, no regrowth claims.
// -------------------------------------------------------------
const HI_TITLES_5 = [
  "Amla Reetha Shikakai ka authentic traditional trio",
  "Teen alag-alag 200g jars sabse bada fayda hai",
  "Reetha aur Shikakai se wash, Amla se conditioning pack",
  "Pure Ayurvedic wash routine, chemical shampoo band",
  "Total 600g botanical powder ₹849 me zabardast deal",
  "Bina kisi sulfate ke natural jhaag aur deep cleansing",
  "Scalp ekdum saaf aur baal bina conditioner ke soft",
  "Premixed powder se 100 guna behtar alag jars",
  "Mera Sunday hair wash aur pack ritual ab fix ho gaya",
  "Reetha ka natural saponin lather baalon ko dry nahi karta",
  "Shikakai se silky slip aur Amla se natural shine mili",
  "Pani se easily rinse ho jata hai, zero gritty residue",
  "Teeno powders ki fresh herbal khushboo sach me pure hai",
  "Bottle wale chemical shampoos se hamesha ke liye chhutkara",
  "Roots me halkapan aur scalp par fresh saaf feel",
  "Jar par likhi separate wash aur pack directions follow ki, best result",
  "600g ki quantity mahino chalegi, full paisa wasool",
  "Micro-milled fine powder, paani me smooth mix hota hai",
  "NatureMist ki single-botanical quality sach me lajawab hai",
  "₹849 me teen 200g jars worth every single rupee"
];

const HI_TITLES_4 = [
  "Bahut acha herbal trio hai, brew karne me thoda extra time lagta hai",
  "Cleansing aur conditioning top hai, saath me measuring scoop honi chahiye thi",
  "Quality 600g set badiya hai, Reetha ka ratio adjust karne me 1-2 wash lage",
  "Scalp fresh ho jata hai, teeno powders ko rinse karne me extra pani lagta hai",
  "Traditional hair wash ke liye best, moisture se door tight band karke rakhein",
  "₹849 me 3 full jars ki value bohot solid hai",
  "Tel ache se nikalta hai, bas har baar fresh bana kar bachi paste discard karein",
  "Scalp par gentle hai, har jar ke liye alag sukhi chammach use karein"
];

const HI_TITLES_3 = [
  "Pure herbal trio hai par shampoo bottles ke mukable time zyada lagta hai",
  "Achi botanical quality hai, shower me powder wash karne me patience chahiye",
  "Teeno pure powders hain, kankad nahi hai par rinse 2-3 bar karna padta hai",
  "Thik thak traditional trio, apne baalon ke hisab se ratio sikhna padta hai",
  "Fine herbal powders hain, pehle teeno ka alag patch test zaroor karein"
];

const HI_HOOKS = [
  "Teeno powders alag-alag 200g jars me aate hain, premix nahi hai—yahi is Classic Trio ki sabse badi khasiyat hai.",
  "Main Reetha aur Shikakai ko gungune paani me mix karke natural wash banati hoon, aur Amla ko alag pack ki tarah use karti hoon.",
  "₹849 me poora 600g pure botanical powder milna chemical shampoo ke mukable bohot economical aur safe hai.",
  "Reetha ke natural saponins se itna pyara mild jhaag banta hai jo bina baal dry kiye scalp ka sara tel saaf kar deta hai.",
  "Maine pack ke mutabik pehle teeno powders ka patch test kiya, fir regular wash routine me shuru kiya.",
  "Shikakai baalon ko detangle karta hai aur Amla ek natural bounce aur dark luster deta hai bina kisi synthetic serum ke.",
  "Teeno powders itne micro-milled hain ki pani ke sath bina kisi moti gath ke smooth paste ban jate hain.",
  "Reetha-Shikakai se dhone ke baad jab Amla pack lagaya toh baal itne soft aur manageable ho gaye.",
  "Main teeno jars ko dry shelf me rakhta hoon aur har jar ke liye ek clean dry spoon hi use karta hoon.",
  "Is Classic Trio ne mere bathroom se sulfate shampoos aur chemical conditioners ko poori tarah replace kar diya hai.",
  "Mujhe acha laga ki NatureMist ne koi shortcut premix nahi banaya, har botanical ko uski pure form me diya hai.",
  "Jab bhi scalp par dirt ya oily heaviness lagti hai, ye botanical wash ritual turant fresh halkapan de deta hai.",
  "Main nahane se pehle fresh mixture banata hoon aur bachi hui wet preparation ko jar directions ke hisab se discard kar deta hoon.",
  "Rinse ke baad jab baal sookhte hain toh bina kisi heavy layer ke unme ek natural hawa jaisa bounce rehta hai.",
  "Listing me jaisa likha hai ki Reetha-Shikakai wash ke liye aur Amla pack ke liye hai, ye classic Ayurvedic niyam ke anusaar hai.",
  "Shower me khule pani se wash karne par saare herbal particles bina scalp par chipke cleanly nikal jate hain.",
  "Mere wavy baal pehle se bohot zyada healthy, shiny aur touch karne me silky soft lag rahe hain.",
  "Mujhe pasand aaya ki teeno jars me 100% pure single botanicals hain, koi synthetic preservative ya artificial scent nahi.",
  "Amla ka fruit aroma, Reetha ka shell aroma aur Shikakai ka pod fragrance mil kar ek authentic traditional sensory feel dete hain.",
  "Total 600g quantity itni zyada hai ki mahino tak chalti hai, ₹849 me isse badiya deal nahi mil sakti."
];

const HI_MIDDLES = [
  "Khule paani se rinse karne ke baad scalp par koi residue ya chipchipahat bilkul nahi rehti.",
  "Scalp bohot calm aur refreshed rehti hai, chemical shampoos ki tarah koi dryness ya khujli nahi hoti.",
  "Plant saponins tel ko cleanly nikalte hain bina hair cuticles ko rough ya dry kiye.",
  "Roots me natural lift rehti hai aur lengths itni soft ho jati hain ki kangi smoothly chalti hai.",
  "Sukhi chammach use karne se teeno jars ke andar ka powder bina kisi moisture lump ke fresh rehta hai.",
  "Alag jars hone se oily days par Reetha zyada aur dry days par Shikakai zyada mix karne ki flexibility milti hai.",
  "Pehle herbal cleansing wash aur fir Amla ka conditioning pack—ye 2-step routine sach me kamaal kaam karti hai.",
  "Baal naturally clean aur nourished feel hote hain bina kisi artificial fragrance ya foam booster ke.",
  "Fine micro-milled powder hone ki wajah se pani me ghulte hi uniform consistency ban jati hai."
];

const HI_CONCLUSIONS_5 = [
  "₹849 me 600g pure Ayurvedic trio ke liye best deal hai. Main har bar yahi Classic Trio reorder karungi!",
  "Kitna sukoon dene wala traditional hair wash ritual hai. Mere hair care routine ka permanent hissa ban gaya hai.",
  "Asli separate jars ki quality jisme complete control milta hai. Jo log chemical-free hair care chahte hain unke liye must-have hai!",
  "Mere baal aur scalp itne balanced pehle kabhi nahi the. ₹849 poori tarah wasool hain!",
  "100% pure separate botanicals honest price par. Is Classic Trio se behtar routine market me nahi hai.",
  "Agar aapko bina chemicals ke clean aur soft baal chahiye, toh ye 3-jar Classic Trio bilkul perfect hai."
];

const HI_CONCLUSIONS_4 = [
  "Scalp fresh ho jata hai aur baal soft. Bas dhyan rahe ki shower me achhe se pani se rinse karein.",
  "Bohot effective botanical wash aur pack set hai. Jars ko bathroom ki nami se door dry jagah hi rakhein.",
  "Bottle wale shampoo se thoda extra time lagta hai, par scalp ka clean feel aur hair shine dekh kar sab wasool hai.",
  "High quality 3-jar set hai. Hamesha fresh banayein aur bacha hua wet mixture agle din ke liye na rakhein.",
  "₹849 me 600g ki deal bohot zabardast hai. Dry spoon se use karein taaki powder mahino fresh rahe."
];

const HI_CONCLUSIONS_3 = [
  "Pure herbal powders hain jo baalon ko naturally clean karte hain, par banene aur wash karne me thoda time chahiye.",
  "Authentic trio hai jo baal soft banata hai, bas Reetha aur Shikakai ka apna ratio samajhne me 2-3 wash lagte hain.",
  "Quality achi hai par teeno ka pehle patch test zaroor karein aur shower me thorough rinse karein."
];

// Helper to escape CSV field
function escapeCsv(str) {
  if (typeof str !== 'string') str = String(str);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate the 1,052 reviews
console.log(`Generating ${TARGET_TOTAL} NatureMist Classic Trio reviews aligned with published details (24 Oct 2026)...`);

const reviews = [];

// Breakdown for 1,052 reviews:
// 5 stars: ~862 (81.9%)
// 4 stars: ~153 (14.5%)
// 3 stars: ~37 (3.5%)
// Target total: 862 + 153 + 37 = 1052
const TARGET_5 = 862;
const TARGET_4 = 153;
const TARGET_3 = 37;

// Generate 5-star reviews
for (let i = 0; i < TARGET_5; i++) {
  const isHinglish = rand() < 0.85;
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
