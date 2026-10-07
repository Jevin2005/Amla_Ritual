const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'bulk_reviews_judgeme.csv');

// Products configuration matching live Shopify store & Judge.me mapping
const PRODUCTS = [
  {
    key: 'amla',
    id: '8494763311290',
    handle: 'amla',
    name: 'NatureMist Amla Powder',
    targetCount: 230,
  },
  {
    key: 'reetha',
    id: '8498815107258',
    handle: 'wildcrafted-amla-powder',
    name: 'NatureMist Reetha Powder',
    targetCount: 155,
  },
  {
    key: 'bhringraj',
    id: '8531585433786',
    handle: 'bhringraj-powder',
    name: 'NatureMist Bhringraj Powder',
    targetCount: 155,
  },
  {
    key: 'hibiscus',
    id: '8531585499322',
    handle: 'hibiscus-powder',
    name: 'NatureMist Hibiscus Powder',
    targetCount: 155,
  },
  {
    key: 'indigo',
    id: '8531585368250',
    handle: 'reetha-powder',
    name: 'NatureMist Indigo Powder',
    targetCount: 155,
  },
  {
    key: 'shikakai',
    id: '8531585597626',
    handle: 'indigo-powder',
    name: 'NatureMist Shikakai Powder',
    targetCount: 150,
  },
];

// Seeded PRNG for reproducible, deterministic output
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
  'Vivek', 'Yamini', 'Yash', 'Yashoda', 'Yogesh', 'Zoya'
];

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
  'Varma', 'Verma'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com'
];

// Review content components for each product
const REVIEW_CONTENT = {
  amla: {
    titles_5: [
      "Pure and transformative ritual",
      "Incredible natural shine",
      "Authentic earthy fragrance",
      "Noticeable difference in scalp health",
      "Purest quality amla in India",
      "Remarkable reduction in hair shedding",
      "Silky softness without silicones",
      "My weekly holy grail hair mask",
      "Leaves hair glossy and voluminous",
      "Finest amla powder on the market",
      "Visible reduction in comb breakage",
      "Deeply cooling and refreshing",
      "Restored shine to my dull strands",
      "Zero grit and dissolves smoothly",
      "My curls have never looked glossier",
      "A staple in my Ayurvedic hair routine",
      "Gentle on my sensitive scalp",
      "Unbelievable natural luster",
      "Noticeable new baby hairs",
      "Pure wildcrafted botanical excellence",
      "Best pre-wash treatment ever",
      "Hair feels revitalized and stronger",
      "Natural shine that lasts for days",
      "Far superior to regular store powders",
      "Scalp feels squeaky clean and balanced",
      "Subtle herbal scent and rich texture",
      "My post-partum hair savior",
      "Worth every single rupee",
      "Healthy bounce restored to my waves",
      "Luxurious hair ritual in a jar"
    ],
    titles_4: [
      "Great herbal wash for roots",
      "Very good shine, needs thorough rinse",
      "Nourishing mask for dry ends",
      "Effective results with consistent use",
      "High quality amla, earthy aroma",
      "Leaves hair conditioned and clean",
      "Visible improvement after 3 weeks",
      "Wonderful texture, wish a scoop came inside"
    ],
    titles_3: [
      "Good quality herb, takes patience to prep",
      "Effective mask, aroma is quite earthy",
      "Decent herbal treatment for hair fall"
    ],
    hooks: [
      "After just two weeks of preparing the warm amla paste, my scalp feels deeply nourished and hair shedding has decreased visibly.",
      "I mix two spoonfuls with warm water and a splash of coconut milk; it gives my hair an authentic healthy sheen without synthetic silicone build-up.",
      "You can instantly tell this is wildcrafted from the fine texture and fresh earthy aroma with zero artificial coloring.",
      "Noticeable difference in hair texture within three washes. Scalp feels clean and refreshed without any dryness.",
      "Very potent vitamin C rich powder. I use it as a pre-wash hair mask every Sunday blended with plain curd.",
      "Struggled with heavy hair fall after moving to a city with hard water. This amla mask restored scalp balance remarkably fast.",
      "I have fine, color-treated wavy hair and was worried about staining, but this rinsed out completely and left my lengths radiant.",
      "The micro-milled powder consistency is outstanding. It mixes smoothly into a lump-free paste in under a minute.",
      "Leaves my scalp feeling cool and soothed. The itchiness I used to suffer from between washes has completely disappeared.",
      "Combined with aloe vera gel, this makes the most hydrating pre-wash treatment. My hairbrush collects barely any stray hairs now.",
      "My post-partum hair shedding was causing me anxiety. Consistent weekly use of this amla paste over six weeks visibly strengthened my roots.",
      "The natural luster this gives my dark hair is unbelievable. Sunlight brings out a healthy, mirror-like gloss.",
      "I appreciate that this is 100% pure single-origin amla without any fillers or preservatives. The quality speaks for itself.",
      "I've tried powders from multiple brands, but NatureMist is on another level in terms of fineness and fresh botanical smell.",
      "Noticeably thicker feel along my ponytail and my hair holds natural volume much better throughout the day.",
      "After leaving it on for 25 minutes and rinsing with cool water, my curls feel light, bouncy, and deeply moisturized."
    ],
    middles: [
      "Hair feels significantly denser at the roots and the natural shine catches the light beautifully.",
      "It washes out easily with warm water without leaving any gritty sand behind on the scalp.",
      "My split ends feel sealed and my comb glides through wet hair without snagging or snapping.",
      "The natural antioxidant potency is evident from the first use; my strands feel resilient and bouncy.",
      "I pair this with the NatureMist reetha wash for a complete zero-chemical hair cleansing routine.",
      "The subtle cooling effect on the crown during application is incredibly grounding and therapeutic.",
      "Hair texture has softened noticeably, especially through the dry mid-lengths and ends."
    ],
    conclusions_5: [
      "Definitely ordering the refill jar. Highly recommended to anyone wanting pure Ayurvedic hair care!",
      "Truly premium grade amla. It has earned a permanent place in my weekly self-care ritual.",
      "Exceeded my expectations in every way. My hair hasn't felt this healthy in years.",
      "A must-have for anyone dealing with seasonal hair fall or lack of natural luster.",
      "100% authentic botanical quality. Will definitely repurchase again and again.",
      "Such a joyful, grounding ritual. Worth every single rupee!"
    ],
    conclusions_4: [
      "Leaves roots feeling strengthened. Only wish the jar had a small wooden scoop included.",
      "Very good natural treatment. Just make sure to rinse with plenty of water to remove every bit of paste.",
      "Takes a little patience to mix smoothly, but the resulting shine and scalp freshness make it well worth the time.",
      "High quality powder. The earthy aroma takes a wash or two to get used to, but the results are undeniable."
    ],
    conclusions_3: [
      "Good herbal powder with genuine benefits, though mixing and rinsing takes noticeable time on busy mornings.",
      "Decent quality amla. Takes patience to prepare properly, but works well when combined with yogurt.",
      "Works fine as a scalp mask, though the earthy scent lingers for a while if not washed out with scented shampoo."
    ]
  },

  reetha: {
    titles_5: [
      "Deeply cleansing without stripping oils",
      "Natural lather is wonderful",
      "Clean scalp and bouncy volume",
      "Hair feels naturally clean & light",
      "Completely replaced my bottled shampoo",
      "Amazing clarification for oily roots",
      "Zero scalp itch and cleared dandruff",
      "Pure foaming saponin magic",
      "Scalp feels thoroughly refreshed",
      "My curls have natural bounce again",
      "Best natural clarifying wash",
      "Gentle on sensitive scalp, tough on oil",
      "No chemical buildup ever again",
      "Leaves hair squeaky clean and shiny",
      "Traditional wisdom at its finest",
      "Incredible volume at the roots",
      "Gentle saponins clean perfectly",
      "So easy to prepare weekly wash tea",
      "Cured my oily scalp struggle",
      "A permanent switch to natural hair care"
    ],
    titles_4: [
      "Gentle on sensitive scalp",
      "Great natural wash, keep away from eyes",
      "Clean roots, needs a conditioning rinse",
      "Takes some patience to boil, great clean",
      "Very effective cleanser, mild natural scent",
      "Wonderful clarifying power, watch your eyes"
    ],
    titles_3: [
      "Good herbal cleanser, learning curve required",
      "Cleans well but lather is very mild",
      "Needs a conditioner afterwards for dry ends"
    ],
    hooks: [
      "Reetha completely replaced my harsh commercial sulfate shampoos. It foams gently when prepared with hot water and leaves the scalp grease-free.",
      "Takes a wash or two to get used to natural saponin foam, but my chronic dandruff and oily crown cleared up within three weeks.",
      "I prepare a batch of liquid reetha wash every Sunday. My curls feel springy, soft, and completely free of silicone buildup.",
      "Leaves zero oily residue behind. Works particularly well when combined with shikakai and a touch of amla powder.",
      "If you suffer from product buildup or heavy city pollution, this botanical cleanser cleans the scalp without drying out the lengths.",
      "I boil two tablespoons in two cups of water for five minutes, strain through a muslin cloth, and pour gently over wet roots.",
      "My hair gets oily within 24 hours with regular shampoo, but with this reetha wash my scalp remains balanced and fresh for 4 full days.",
      "Gentle cleansing without stripping my scalp's natural moisture barrier. My fine hair has incredible natural lift and body.",
      "The powder is exceptionally fresh and potent. It creates a rich, delicate foam when shaken in lukewarm water.",
      "After stopping chemical shampoos, my hair went through a detox phase. This pure reetha powder made the transition smooth and soothing."
    ],
    middles: [
      "The hair dries with incredible lightness and natural bounce, without any flat or coated feeling.",
      "Scalp flaking and itching disappeared completely after four consecutive wash days.",
      "It gently lifts oil and hard water mineral deposits without causing any tangling or rough cuticles.",
      "Rinses out effortlessly and leaves the hair feeling authentically clean and weightless.",
      "My natural curl definition has improved dramatically because there is zero heavy wax or silicone weighing it down."
    ],
    conclusions_5: [
      "Extremely satisfied with the purity. NatureMist has earned a customer for life.",
      "Will never go back to synthetic detergent shampoos again. An absolute must-have!",
      "Leaves my hair feeling clean, bouncy, and airy all week long. 10/10 recommendation.",
      "Pure herbal magic. My scalp has never felt this healthy and breatheable.",
      "Worth every bit of effort to prepare. High quality and beautifully packaged."
    ],
    conclusions_4: [
      "Takes some patience to boil and strain, but the chemical-free hair reward is 100% worth it. Just keep away from eyes!",
      "Very good cleanser. Remember to close your eyes tightly while rinsing as natural saponins can sting.",
      "Leaves scalp very clean. Dry hair types will definitely want to follow with a hibiscus or amla conditioning mask.",
      "Great product. Takes a little preparation before shower time, but the healthy scalp results speak for themselves."
    ],
    conclusions_3: [
      "Cleans oil very effectively, but you must follow with conditioner if you have long or bleached ends.",
      "Good natural soapnut powder. Doesn't lather like synthetic surfactants, so expect a different wash experience.",
      "Effective clarifying herb, though straining the wash tea requires a bit of extra kitchen time."
    ]
  },

  bhringraj: {
    titles_5: [
      "Rich natural cooling & nourishment",
      "Noticeable decrease in hair thinning",
      "Finest texture and potent results",
      "High quality Bhringraj herb",
      "Visible baby hair growth",
      "The King of Hair herbs lives up to its name",
      "Strengthened roots and less comb fall",
      "Significant reduction in brush shedding",
      "Crown thinning visibly improved",
      "Deeply calming scalp ritual",
      "Baby hairs sprouting along hairline",
      "Pure, potent, and deep green",
      "Authentic Ayurvedic remedy for hair fall",
      "Scalp feels nourished and grounded",
      "Hair feels noticeably denser",
      "Remarkable follicle strengthening",
      "Earthy fragrance and soothing warmth",
      "Helped restore my post-stress hair loss",
      "Best Bhringraj on the market",
      "My temples are finally filling back in"
    ],
    titles_4: [
      "Good herbal strengthening mask",
      "Visible results after 5 weeks of use",
      "Nourishing mask, needs thorough rinse",
      "Roots feel firmer, very earthy aroma",
      "Solid Ayurvedic hair mask for shedding",
      "Consistent use pays off nicely"
    ],
    titles_3: [
      "Takes 6-8 weeks to see results, but genuine",
      "Potent herbal smell, good for hair fall",
      "Effective but requires dedication and patience"
    ],
    hooks: [
      "The King of Hair herbs lives up to its reputation. Scalp feels cool, soothed, and itch-free after every weekend mask.",
      "Used as a weekly mask combined with warm sesame oil and amla paste. Follicles feel stronger and breakage during combing has dropped significantly.",
      "Very clean packaging and velvety micro-fine powder texture. Absorbs moisture quickly and washes out cleanly without staining.",
      "Roots feel much firmer after four applications. The traditional Ayurvedic earthy aroma is deeply grounding during head massage.",
      "I was skeptical about herbal powders, but after six weeks of consistent weekly use, I can see tiny baby hairs along my receding hairline.",
      "Suffered from diffuse thinning on my crown after a stressful period. This bhringraj powder has noticeably increased my strand density.",
      "I mix this with aloe vera gel and warm coconut oil. It forms a luxurious dark green paste that revives tired hair roots.",
      "The hair fall I used to notice on my bathroom floor after washing has reduced by easily 70% over the last two months.",
      "You can immediately recognize the potency from the rich olive-green color and fresh botanical fragrance with zero moldy smell.",
      "Massaging this warm paste into my scalp on Sundays has become my favorite self-care ritual. Deeply relaxing and restorative."
    ],
    middles: [
      "Comb glides through without collecting clumps of broken hair in the bristles.",
      "My scalp feels deeply stimulated and moisturized, with zero irritation or dry tightness.",
      "The density and grip at the roots feel remarkably reinforced after a month of treatments.",
      "It washes out smoothly with cool water and leaves hair with a rich natural luster.",
      "Baby hairs around my temples are becoming thicker and blending into my main hair length."
    ],
    conclusions_5: [
      "Truly pure Bhringraj. I recommend it to all my family and friends struggling with hair thinning.",
      "Results speak for themselves. My hair hasn't felt this strong and dense since my early twenties.",
      "An essential herb for anyone serious about botanical hair restoration. 5 stars all day!",
      "Superior quality to anything you find in local markets. NatureMist is a game changer.",
      "Remarkable results on both hair fall and scalp comfort. Will keep buying regularly."
    ],
    conclusions_4: [
      "Roots feel much firmer. Takes about 4-5 weeks of discipline to see noticeable baby growth.",
      "Very good product. Make sure to rinse with plenty of water since dark herbal paste needs thorough washing.",
      "Strong traditional herbal fragrance that lingers softly, but the root strengthening makes it worthwhile.",
      "Solid herb for hair fall. Needs consistency and patience, but the purity of this powder is unquestionable."
    ],
    conclusions_3: [
      "Good quality herb, but you won't see results overnight. Took me nearly two months to notice less shedding.",
      "Quite a strong earthy smell, but the powder itself is fine and authentic.",
      "Effective for scalp health, though mixing into a smooth paste takes some effort."
    ]
  },

  hibiscus: {
    titles_5: [
      "Deep conditioning and velvet softness",
      "Gorgeous luster and moisture",
      "Natural hair mask perfection",
      "Restored my dry curls",
      "Incredible slip and detangling",
      "Hydrates parched ends like magic",
      "Silky softness that lasts all week",
      "My curls pop with bounce and shine",
      "Vivid ruby paste and sweet floral note",
      "Goodbye frizz, hello glossy locks",
      "Ultimate conditioning treatment",
      "Repaired my heat-damaged lengths",
      "Feather-soft hair with zero silicones",
      "Pure floral luxury in a jar",
      "Tamed my stubborn flyaways",
      "Natural elasticity restored",
      "Leaves hair touchably soft and lustrous",
      "Soothing hydration for brittle ends",
      "Best natural curl moisturizer",
      "A salon-grade botanical treatment at home"
    ],
    titles_4: [
      "Hydrates dull hair wonderfully",
      "Great slip, needs plenty of water to rinse",
      "Softens curls nicely, mind light towels",
      "Lovely conditioning mask, deep color",
      "Very moisturizing for dry coarse hair",
      "Good frizz control, requires thorough rinse"
    ],
    titles_3: [
      "Good moisture, slight tint on bleached ends",
      "Conditioning is great, takes time to wash out",
      "Nice floral mask, but thick paste needs careful rinse"
    ],
    hooks: [
      "Hibiscus powder gives such an intense conditioning treatment. My 3A curls have never felt this hydrated and manageable.",
      "Adds rich moisture to dry, brittle ends. Mixes into a smooth ruby paste with natural floral mucilage that provides incredible slip.",
      "I blend this with aloe vera gel and yogurt. Leaves hair silky, shiny, and completely tangle-free right after rinsing.",
      "My hair was severely damaged from regular flat ironing. Three weekly hibiscus treatments brought back elasticity and springy bounce.",
      "The natural plant mucilage in this powder coats the hair shaft like a protective shield, locking in moisture for days.",
      "Smells freshly harvested with a subtle floral note. The crimson powder dissolves effortlessly into lukewarm water without clumps.",
      "Transformed my rough, coarse strands into velvet. Even my hairdresser asked what deep conditioning salon treatment I had received.",
      "Frizz has always been my biggest hair struggle in monsoon season. This hibiscus mask keeps my lengths smooth and defined.",
      "I love mixing equal parts hibiscus and amla powder. It provides the perfect balance of deep conditioning and mirror shine.",
      "Gives hair that luxurious, glossy salon feel using nothing but 100% pure dried hibiscus petals."
    ],
    middles: [
      "Curls clump together beautifully with defined ringlets and zero frizzy flyaways.",
      "The slip is unbelievable; I can finger-detangle my thick hair in the shower in seconds.",
      "Split ends appear nourished and sealed, and dry hair absorbs the floral hydration instantly.",
      "Brings out rich multi-dimensional highlights in dark hair while keeping strands ultra-supple.",
      "Scalp feels calm and cooled, while hair lengths retain soft moisture through multiple days."
    ],
    conclusions_5: [
      "Highly recommended for coarse, brittle, or frizzy hair. A permanent staple in my bathroom!",
      "Pure botanical perfection. My curls have never looked this defined and healthy.",
      "Hands down the best natural conditioning powder I've ever experienced. 10/10!",
      "Exceeded all my expectations. My hair is softer than it has ever been.",
      "Worth every single penny. My dry ends are finally completely revitalized."
    ],
    conclusions_4: [
      "Very good conditioning effect. Needs plenty of warm water to wash out completely, but the softness is unmatched.",
      "Leaves hair silky and soft. Be careful with white bathroom towels as the natural red pigment can leave faint marks.",
      "Wonderful hydration for curly hair. Takes a few extra minutes under the shower head to rinse clean.",
      "Great mask for dull hair. Keep in mind that lighter hair colors should do a small strand test first."
    ],
    conclusions_3: [
      "Conditioning power is genuine, though rinsing out the thick floral paste from long thick hair takes patience.",
      "Good hydration for dry ends. Left a faint warm tint on my highlighted strands, so strand test is wise.",
      "Nice herbal conditioning mask, though you need plenty of water to rinse out the micro petals."
    ]
  },

  indigo: {
    titles_5: [
      "Perfect natural black tint with Henna",
      "Pure organic indigo without PPD",
      "Authentic dye release",
      "No scalp burning or allergies",
      "Rich midnight shade",
      "Covers stubborn grey roots completely",
      "Zero chemicals, rich natural black",
      "Gentle alternative to boxed black dye",
      "Shiny, dark, and conditioned hair",
      "Flawless grey coverage at home",
      "Deep dark brown with one-step henna mix",
      "No itching or chemical rash ever again",
      "Fresh grassy aroma, high dye release",
      "Gorgeous cool black tone without brass",
      "Safe, pure plant dye that works",
      "Best natural black color for silver hair",
      "Roots blend seamlessly into my hair",
      "Leaves hair thicker, not brittle like dyes",
      "Freedom from toxic ammonia dyes",
      "My silver strands disappeared naturally"
    ],
    titles_4: [
      "Rich color payoff, requires 2-step process",
      "Good gray coverage, follow directions carefully",
      "Great natural black, needs quick application",
      "Authentic pure indigo, application can be messy",
      "Deep color that lasts 3-4 weeks, chemical-free",
      "Excellent coverage, must apply immediately after mixing"
    ],
    titles_3: [
      "Effective if henna base is used, not on bare gray",
      "Good natural dye, application takes 2 hours",
      "Works well for dark tint, requires strict timing"
    ],
    hooks: [
      "Used in my 2-step herbal coloring ritual. Imparted a rich, natural blue-black tone with zero redness and no chemical irritation.",
      "Zero ammonia or chemical odor. Gives full, even coverage over stubborn grays when applied right after a henna base.",
      "Dye releases quickly in lukewarm water with a pinch of salt. Great color payoff that lasts 3–4 weeks before needing a touch-up.",
      "Had severe allergic reactions to commercial black hair dyes for years. This 100% plant indigo gave me jet black hair safely.",
      "Followed the two-step method carefully: Henna on Saturday, Indigo on Sunday. Hair is glossy, dark, conditioned, and full of body.",
      "The indigo powder is fresh, vibrant green, and smells like fresh hay. When mixed with warm water, the purple sheen appears in 10 minutes.",
      "Completely masked the silver hair around my temples that regular boxed dyes kept washing out of after two shampoos.",
      "Unlike synthetic dyes that leave hair feeling fried and brittle, this botanical powder actually adds volume and cuticle strength.",
      "My dermatologist recommended switching to pure plant dyes after contact dermatitis. NatureMist Indigo has been a true lifesaver.",
      "I mix 60% indigo and 40% henna for a rich dark chocolate brown that looks completely natural in sunlight."
    ],
    middles: [
      "The dark tone stays intact through multiple washes without turning brassy or orange.",
      "Color develops into a deep midnight black over 24-48 hours as it oxidizes naturally in the air.",
      "Scalp feels completely comfortable with zero stinging, redness, or post-dye itchiness.",
      "Grey roots are 100% covered and seamlessly blended with the rest of my dark brown hair.",
      "My hair has a healthy gloss and volume that chemical boxed dyes could never provide."
    ],
    conclusions_5: [
      "Truly pure organic indigo without synthetic adulterants. Highly recommend for safe grey coverage!",
      "I am never going back to chemical dyes. This gives me gorgeous natural black hair safely.",
      "Flawless coverage and remarkable shine. NatureMist indigo is the purest I have found.",
      "A blessing for anyone allergic to PPD or ammonia. 5 stars without hesitation!",
      "Outstanding color payoff that lasts a full month between root touch-ups. Extremely pleased!"
    ],
    conclusions_4: [
      "Jet black coverage with zero allergy! Just remember you must do a henna base first on grey roots.",
      "Authentic pure indigo. Application can be messy and requires gloves, but the non-toxic black shade is worth it.",
      "Deep color that lasts 3-4 weeks. Make sure to apply it within 15 minutes of mixing for maximum dye release.",
      "Very good coverage. Takes some effort to do the 2-step henna-indigo process, but safe results are 100% worth the time."
    ],
    conclusions_3: [
      "Covers grey well if you follow the 2-step method, but direct application on white hair turns greenish-blue as warned.",
      "Takes about two hours to set properly, but completely chemical-free and safe for sensitive scalps.",
      "Good color payoff. Preparation requires precision with water temperature and immediate application."
    ]
  },

  shikakai: {
    titles_5: [
      "Gentle cleanser with natural detangling",
      "Traditional purity at its best",
      "Silky texture and natural softness",
      "Softest hair after washing",
      "Unbelievable slip during wash day",
      "No more tangles or broken combs",
      "Low-pH cleanser that respects scalp",
      "Perfect gentle wash for curly hair",
      "Cleans without stripping natural oils",
      "My sensitive scalp has found peace",
      "Hair is silky, light, and manageable",
      "The holy grail of Ayurvedic cleansers",
      "Comb glides through with zero resistance",
      "Mild cleansing with incredible slip",
      "Scalp stays fresh without dryness",
      "Leaves curls bouncy and defined",
      "Zero residue, 100% pure botanical",
      "Replaced my detangling conditioner",
      "Fresh, soft, and naturally shiny",
      "Gentle everyday herbal cleanser"
    ],
    titles_4: [
      "Great alternative to sulfate shampoo",
      "Leaves hair detangled and glossy",
      "Gentle wash, pair with reetha for oily roots",
      "Soft hair, takes some patience to rinse out",
      "Wonderful slip, mild natural cleansing",
      "Good for sensitive scalp, mild low foam"
    ],
    titles_3: [
      "Mild cleanser, takes getting used to no-foam",
      "Good detangler, doesn't strip oil aggressively",
      "Gentle wash, best combined with reetha"
    ],
    hooks: [
      "Shikakai leaves hair smooth and easy to comb. Great low-pH cleanser that does not disrupt the delicate scalp microbiome.",
      "No sand or grit like other bazaar brands. Pure, fragrant, and gentle on sensitive scalp prone to flaking or redness.",
      "Combines beautifully with amla and reetha for the holy trinity hair wash. Hair has never felt lighter, softer, or cleaner.",
      "I have dense 3B curly hair that easily knots. Washing with this shikakai paste gives so much slip that my fingers glide right through.",
      "Cleans without foaming violently. Scalp stays fresh for 3-4 days straight without oiliness or dry tightness.",
      "Very gentle herb. Leaves hair detangled and glossy. Highly satisfied with NatureMist botanical quality.",
      "I suffered from chronic scalp eczema triggered by surfactants. Switching to this gentle shikakai wash eliminated my irritation completely.",
      "The micro-fine powder dissolves smoothly in warm water into a silky tea that clarifies scalp and conditions lengths simultaneously.",
      "Preserves the natural lipid moisture of hair while removing dirt, sweat, and environmental grime gently.",
      "My daughter hated hair wash days because of tangles. Shikakai makes combing completely painless and tear-free."
    ],
    middles: [
      "Hair dries with noticeable natural shine, soft elasticity, and zero static electricity.",
      "Scalp feels balanced, calm, and free from the dry itchiness caused by harsh detergents.",
      "Fingers slip through wet hair effortlessly without needing any synthetic leave-in conditioners.",
      "Curl patterns are enhanced with bouncy clumping and clean, lightweight separation.",
      "Leaves hair feeling authentically nourished and full of natural movement."
    ],
    conclusions_5: [
      "Silkiest hair I've experienced in years. NatureMist has set a gold standard for Ayurvedic herbs.",
      "A game-changing cleanser for curly and dry hair types. Will repurchase continuously!",
      "Gentle, pure, and deeply effective. Deserves 5 stars without any doubt.",
      "The detangling slip alone makes this worth its weight in gold. 10/10!",
      "Pure traditional goodness. My hair and scalp have never been happier."
    ],
    conclusions_4: [
      "Great alternative to sulfate shampoo. Scalp stays fresh for days without oiliness.",
      "Very gentle herb that leaves hair detangled and glossy. Needs a good stream of water to rinse out micro-particles.",
      "Wonderful natural slip. If your scalp is very oily, combine it with a spoon of reetha for extra cleansing punch.",
      "Leaves hair remarkably soft. Takes a couple of washes to get accustomed to the low-lather texture, but results are worth it."
    ],
    conclusions_3: [
      "Cleans very gently. If you're used to high-foam shampoos, there is definitely a learning curve.",
      "Good detangling action, though very oily roots might need a double wash or reetha blend.",
      "Pleasant herbal wash. Doesn't lather much, but leaves lengths soft and manageable."
    ]
  }
};

// Generates a random ISO date between startDate and endDate
function randomDate(startYear, startMonth, endYear, endMonth) {
  const start = new Date(startYear, startMonth - 1, 1).getTime();
  const end = new Date(endYear, endMonth - 1, 28).getTime();
  const d = new Date(start + rand() * (end - start));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generates a unique email based on reviewer name
const usedEmails = new Set();
const usedNames = new Set();

function generateUniqueEmail(firstName, lastName) {
  const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
  
  const formats = [
    () => `${cleanFirst}.${cleanLast}${randInt(1, 99)}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}${cleanLast}${randInt(1975, 2004)}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}_${cleanLast}${randInt(10, 99)}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}.${cleanLast[0]}${randInt(100, 999)}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}${cleanLast[0]}${randInt(1980, 2003)}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}${randInt(10, 99)}.${cleanLast}@${pick(EMAIL_DOMAINS)}`,
    () => `${cleanFirst}.${cleanLast}@${pick(EMAIL_DOMAINS)}`,
  ];

  let email = '';
  let attempts = 0;
  do {
    const fn = pick(formats);
    email = fn();
    attempts++;
    if (attempts > 50) {
      email = `${cleanFirst}.${cleanLast}.${randInt(1000, 99999)}@${pick(EMAIL_DOMAINS)}`;
    }
  } while (usedEmails.has(email));

  usedEmails.add(email);
  return email;
}

function generateUniqueName() {
  let name = '';
  let attempts = 0;
  do {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    name = `${first} ${last}`;
    attempts++;
    if (attempts > 1000) break;
  } while (usedNames.has(name));

  usedNames.add(name);
  return name;
}

// Generates an authentic review for a product with a target rating
function generateReview(productKey, targetRating) {
  const pData = REVIEW_CONTENT[productKey];
  if (!pData) throw new Error(`Missing review content for product ${productKey}`);

  let title = '';
  let body = '';

  const hook = pick(pData.hooks);
  const middle = pick(pData.middles);

  if (targetRating === 5) {
    title = pick(pData.titles_5);
    const conclusion = pick(pData.conclusions_5);
    body = `${hook} ${middle} ${conclusion}`;
  } else if (targetRating === 4) {
    title = pick(pData.titles_4);
    const conclusion = pick(pData.conclusions_4);
    body = `${hook} ${conclusion}`;
  } else {
    // 3 stars
    title = pick(pData.titles_3);
    const conclusion = pick(pData.conclusions_3);
    body = `${hook} ${conclusion}`;
  }

  // Realistic review date between November 2024 and September 2026
  const date = randomDate(2024, 11, 2026, 9);

  const fullName = generateUniqueName();
  const [first, ...rest] = fullName.split(' ');
  const last = rest.join(' ');
  const email = generateUniqueEmail(first, last);

  return {
    title,
    body,
    rating: targetRating,
    review_date: date,
    reviewer_name: fullName,
    reviewer_email: email,
  };
}

// Parse existing CSV
function loadExistingReviews() {
  if (!fs.existsSync(CSV_FILE)) return [];
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const existing = [];
  // Parse CSV line safely
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parser supporting quotes
    const matches = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        matches.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    matches.push(cur.trim());

    if (matches.length >= 8) {
      const review = {
        title: matches[0],
        body: matches[1],
        rating: parseInt(matches[2], 10),
        review_date: matches[3],
        reviewer_name: matches[4],
        reviewer_email: matches[5],
        product_id: matches[6],
        product_handle: matches[7],
      };
      existing.push(review);
      usedNames.add(review.reviewer_name);
      usedEmails.add(review.reviewer_email);
    }
  }

  return existing;
}

// Convert review object to CSV row
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
  const existingReviews = loadExistingReviews();
  console.log(`Loaded ${existingReviews.length} existing reviews.`);

  // Group existing by product_id
  const existingByProduct = {};
  for (const p of PRODUCTS) {
    existingByProduct[p.id] = existingReviews.filter(r => r.product_id === p.id);
  }

  const allReviews = [];

  for (const product of PRODUCTS) {
    const existing = existingByProduct[product.id] || [];
    allReviews.push(...existing);

    const needed = product.targetCount - existing.length;
    console.log(`Product ${product.name} (${product.handle}): existing=${existing.length}, generating=${needed}`);

    // Generate needed reviews with rating distribution:
    // ~83% 5-star, ~14% 4-star, ~3% 3-star
    const count5 = Math.round(needed * 0.83);
    const count4 = Math.round(needed * 0.14);
    const count3 = needed - count5 - count4;

    const ratingPlan = [
      ...Array(count5).fill(5),
      ...Array(count4).fill(4),
      ...Array(count3).fill(3),
    ];

    // Shuffle the rating plan
    for (let i = ratingPlan.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [ratingPlan[i], ratingPlan[j]] = [ratingPlan[j], ratingPlan[i]];
    }

    for (let i = 0; i < needed; i++) {
      const rating = ratingPlan[i];
      const r = generateReview(product.key, rating);
      allReviews.push({
        ...r,
        product_id: product.id,
        product_handle: product.handle,
      });
    }
  }

  console.log(`Total generated reviews: ${allReviews.length}`);

  // Sort reviews chronologically by review_date ascending so review timeline is natural
  // Or keep grouped / sorted. Let's sort by review_date ascending so it reflects historical order
  allReviews.sort((a, b) => new Date(a.review_date) - new Date(b.review_date));

  // Write out to CSV
  const header = 'title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle';
  const csvLines = [header, ...allReviews.map(toCsvRow)];
  const outputContent = csvLines.join('\n') + '\n';

  fs.writeFileSync(CSV_FILE, outputContent, 'utf8');
  console.log(`Successfully wrote ${allReviews.length} reviews to ${CSV_FILE}`);

  // Summary stats
  const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const byProduct = {};
  for (const r of allReviews) {
    ratings[r.rating] = (ratings[r.rating] || 0) + 1;
    byProduct[r.product_handle] = (byProduct[r.product_handle] || 0) + 1;
  }
  console.log('Ratings distribution:', ratings);
  console.log('Product distribution:', byProduct);
  const avgRating = (Object.entries(ratings).reduce((acc, [k, v]) => acc + (k * v), 0) / allReviews.length).toFixed(2);
  console.log(`Average rating: ${avgRating} / 5.00`);
}

main();
