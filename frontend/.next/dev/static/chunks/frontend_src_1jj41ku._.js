(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/src/domain/catalog/products.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bundles",
    ()=>bundles,
    "formatCurrency",
    ()=>formatCurrency,
    "getBundleProducts",
    ()=>getBundleProducts,
    "getProduct",
    ()=>getProduct,
    "globalSafety",
    ()=>globalSafety,
    "products",
    ()=>products,
    "ritualGoals",
    ()=>ritualGoals
]);
const products = [
    {
        slug: "amla-powder",
        name: "Amla Powder",
        botanical: "Phyllanthus emblica",
        plantPart: "Fruit powder",
        collectionNumber: "01",
        subtitle: "Condition + shine",
        accent: "#6f8f2f",
        accentSoft: "#dce7ad",
        pricePaise: 44900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A versatile pre-wash botanical mask for soft-feeling, smooth and luminous-looking lengths.",
        metaDescription: "Discover the NatureMist Amla ritual: a carefully explained single-botanical pre-wash mask for modern hair care.",
        ingredient: "Amla fruit powder. Botanical identity and batch details are confirmed on the final pack.",
        benefits: [
            "Helps hair feel conditioned and smooth",
            "Supports natural-looking shine",
            "Creates an easy, adaptable pre-wash ritual"
        ],
        howTo: [
            "Scoop enough powder for your hair length into a clean, dry bowl.",
            "Add water gradually and mix until smooth and spreadable.",
            "Apply in sections, follow the final pack timing, then rinse thoroughly."
        ],
        mixers: [
            "Water",
            "Aloe gel",
            "Plain yoghurt",
            "Hibiscus powder"
        ],
        suitableFor: [
            "Dull-looking lengths",
            "Dry-feeling hair",
            "All hair textures"
        ],
        safety: [
            "Patch test before first use.",
            "Strand-test blonde, grey, bleached, porous or colour-treated hair.",
            "For external use only; avoid eyes and broken skin."
        ],
        storage: "Keep sealed in a cool, dry place. Always use a clean, dry spoon.",
        texture: "Finely milled, earthy green botanical powder.",
        concerns: [
            "Softness + Shine",
            "Resilient-Feeling Hair",
            "Scalp Ritual"
        ],
        ritualStep: "Condition",
        experience: "Beginner",
        colorConsiderations: [
            "Grey",
            "Blonde/Bleached",
            "Chemically Coloured"
        ],
        searchTerms: [
            "amla",
            "indian gooseberry",
            "shine",
            "conditioning",
            "mask"
        ],
        faqs: [
            {
                question: "Is Amla a good first botanical ritual?",
                answer: "It can be a simple place to begin because the paste is easy to adapt. Start with water, follow the final pack timing and strand-test very light or porous hair."
            },
            {
                question: "Can I combine Amla with another powder?",
                answer: "Yes. Amla pairs naturally with Shikakai for a wash-day ritual or Hibiscus for a richer conditioning mask. Introduce one new botanical at a time."
            }
        ]
    },
    {
        slug: "reetha-powder",
        name: "Reetha Powder",
        botanical: "Sapindus mukorossi",
        plantPart: "Fruit shell powder",
        collectionNumber: "02",
        subtitle: "Botanical cleanse",
        accent: "#9a5a3d",
        accentSoft: "#ead2c3",
        pricePaise: 39900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A naturally saponin-containing botanical cleanser for a fresh-feeling scalp and lengths.",
        metaDescription: "Explore the NatureMist Reetha wash ritual, with careful preparation, pairing and eye-safety guidance.",
        ingredient: "Reetha fruit shell powder. Exact plant part and batch details are confirmed on the final pack.",
        benefits: [
            "Helps lift excess oil and everyday buildup",
            "Creates a naturally low-foam cleansing ritual",
            "Pairs well with softer wash-day botanicals"
        ],
        howTo: [
            "Mix a small amount with warm water into a thin paste or strained infusion.",
            "Work gently at the roots without splashing.",
            "Rinse extremely well, keeping the mixture strictly away from eyes."
        ],
        mixers: [
            "Water",
            "Shikakai powder",
            "Amla powder"
        ],
        suitableFor: [
            "Oily-to-balanced hair",
            "Wash-day buildup",
            "Experienced ritual users"
        ],
        safety: [
            "Keep strictly away from eyes; natural saponins can sting.",
            "Begin with less on dry, curly or sensitive hair.",
            "Do not use on irritated or broken skin."
        ],
        storage: "Keep sealed and dry. Avoid introducing water into the jar.",
        texture: "Fine, earthy brown cleansing powder.",
        concerns: [
            "Cleanse",
            "Scalp Ritual"
        ],
        ritualStep: "Cleanse",
        experience: "Familiar",
        colorConsiderations: [],
        searchTerms: [
            "reetha",
            "soapnut",
            "soapberry",
            "cleanse",
            "wash"
        ],
        faqs: [
            {
                question: "Why does Reetha create less foam than shampoo?",
                answer: "Reetha contains naturally occurring saponins, so its lather and feel differ from a conventional surfactant formula. More foam does not necessarily mean a better cleanse."
            },
            {
                question: "Can Reetha be used near the face?",
                answer: "No. Keep it strictly away from the eyes and face because the natural saponins can cause significant stinging."
            }
        ]
    },
    {
        slug: "shikakai-powder",
        name: "Shikakai Powder",
        botanical: "Acacia concinna",
        plantPart: "Fruit powder",
        collectionNumber: "03",
        subtitle: "Gentle cleanse + slip",
        accent: "#b18236",
        accentSoft: "#ecdfbf",
        pricePaise: 39900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A traditional low-lather wash that supports soft, manageable-feeling hair and natural slip.",
        metaDescription: "Meet the NatureMist Shikakai ritual, a thoughtful low-lather botanical wash for soft, manageable-feeling hair.",
        ingredient: "Shikakai fruit powder. Botanical identity and plant part are confirmed on the final pack.",
        benefits: [
            "Supports a gentle, low-foam cleanse",
            "Helps hair feel soft and manageable",
            "Offers a considered option for textured hair rituals"
        ],
        howTo: [
            "Mix with water into a smooth, pourable paste.",
            "Apply gently through roots and lengths without rough rubbing.",
            "Rinse thoroughly and follow with your usual conditioning step if needed."
        ],
        mixers: [
            "Water",
            "Reetha powder",
            "Amla powder"
        ],
        suitableFor: [
            "Balanced or dry-feeling hair",
            "Curly and textured hair",
            "Low-foam routines"
        ],
        safety: [
            "Patch test before first use.",
            "Avoid eyes, inhalation and broken skin.",
            "Introduce gradually if your scalp is sensitive."
        ],
        storage: "Store tightly closed away from humidity and direct sunlight.",
        texture: "Soft, warm ochre botanical powder.",
        concerns: [
            "Cleanse",
            "Softness + Shine"
        ],
        ritualStep: "Cleanse",
        experience: "Beginner",
        colorConsiderations: [],
        searchTerms: [
            "shikakai",
            "acacia concinna",
            "gentle wash",
            "slip",
            "curly"
        ],
        faqs: [
            {
                question: "Is Shikakai the same as shampoo?",
                answer: "No. It is a single botanical powder with a low-lather ritual and a different sensory experience from a formulated shampoo."
            },
            {
                question: "Can I combine it with Reetha?",
                answer: "Yes. Shikakai can soften the feel of a Reetha-led wash. Begin with a simple blend and adjust only after observing how your hair feels."
            }
        ]
    },
    {
        slug: "bhringraj-powder",
        name: "Bhringraj Powder",
        botanical: "Eclipta prostrata",
        plantPart: "Whole plant powder",
        collectionNumber: "04",
        subtitle: "Scalp + length ritual",
        accent: "#244c32",
        accentSoft: "#c5d5c7",
        pricePaise: 44900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A grounding deep-green botanical mask for conditioned, cared-for scalp and lengths.",
        metaDescription: "Discover NatureMist Bhringraj, a grounding scalp-and-length botanical ritual explained without exaggerated claims.",
        ingredient: "Bhringraj whole plant powder. Botanical species and plant part are verified on the final pack.",
        benefits: [
            "Creates a grounding scalp-and-length ritual",
            "Supports conditioned, cared-for hair",
            "Blends naturally into richer botanical masks"
        ],
        howTo: [
            "Mix with water until the paste is smooth and easy to spread.",
            "Apply in sections across scalp and lengths.",
            "Follow the final pack timing, then rinse or cleanse out thoroughly."
        ],
        mixers: [
            "Water",
            "Amla powder",
            "Hibiscus powder"
        ],
        suitableFor: [
            "Normal-to-dry hair",
            "Scalp-focused rituals",
            "Rich pre-wash masks"
        ],
        safety: [
            "Patch test before use.",
            "Avoid eyes, inhalation and irritated skin.",
            "This is cosmetic ritual care, not a treatment for scalp conditions."
        ],
        storage: "Keep cool, dry and sealed. Use a clean, dry utensil.",
        texture: "Deep forest-green, finely milled botanical powder.",
        concerns: [
            "Scalp Ritual",
            "Resilient-Feeling Hair",
            "Condition"
        ],
        ritualStep: "Condition",
        experience: "Familiar",
        colorConsiderations: [
            "Grey",
            "Blonde/Bleached"
        ],
        searchTerms: [
            "bhringraj",
            "eclipta",
            "false daisy",
            "scalp ritual",
            "mask"
        ],
        faqs: [
            {
                question: "Does Bhringraj treat hair loss?",
                answer: "NatureMist presents Bhringraj as a cosmetic scalp-and-length ritual only. We do not make hair-growth, hair-loss or medicinal scalp claims."
            },
            {
                question: "What can I pair it with?",
                answer: "Amla makes a versatile companion, while Hibiscus creates a richer softness-focused mask."
            }
        ]
    },
    {
        slug: "hibiscus-powder",
        name: "Hibiscus Powder",
        botanical: "Hibiscus rosa-sinensis",
        plantPart: "Flower powder",
        collectionNumber: "05",
        subtitle: "Softness + luster",
        accent: "#8b3041",
        accentSoft: "#eccbd1",
        pricePaise: 49900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A vivid floral conditioning mask for soft-feeling, smooth and glossy-looking lengths.",
        metaDescription: "Explore NatureMist Hibiscus, a vivid floral powder for softness-focused, glossy-looking hair rituals.",
        ingredient: "Hibiscus flower powder. Species, plant part and cosmetic use are confirmed on the final pack.",
        benefits: [
            "Supports soft-feeling, smooth lengths",
            "Encourages a glossy-looking finish",
            "Adds richness to conditioning botanical masks"
        ],
        howTo: [
            "Mix with water into a silky, smooth mask.",
            "Concentrate the ritual through mid-lengths and ends.",
            "Follow the final pack timing and rinse extremely well."
        ],
        mixers: [
            "Water",
            "Amla powder",
            "Bhringraj powder"
        ],
        suitableFor: [
            "Dry or coarse hair",
            "Curly and textured hair",
            "Softness-focused rituals"
        ],
        safety: [
            "Patch and strand test before use.",
            "Pigment may mark fabric or temporarily affect very light, porous hair.",
            "Avoid eyes, inhalation and broken skin."
        ],
        storage: "Store sealed away from moisture, light and heat.",
        texture: "Finely milled burgundy-red floral powder.",
        concerns: [
            "Softness + Shine",
            "Condition"
        ],
        ritualStep: "Condition",
        experience: "Beginner",
        colorConsiderations: [
            "Grey",
            "Blonde/Bleached",
            "Chemically Coloured"
        ],
        searchTerms: [
            "hibiscus",
            "flower powder",
            "softness",
            "shine",
            "curly"
        ],
        faqs: [
            {
                question: "Can Hibiscus affect very light hair?",
                answer: "Its natural pigment may temporarily affect very light, grey, bleached or porous hair. Always strand-test first."
            },
            {
                question: "Can I use it on my face?",
                answer: "Only use a powder on facial skin when the final product is specifically assessed and labelled for that purpose. This collection is designed around hair rituals."
            }
        ]
    },
    {
        slug: "indigo-powder",
        name: "Indigo Powder",
        botanical: "Indigofera tinctoria",
        plantPart: "Leaf powder",
        collectionNumber: "06",
        subtitle: "Botanical colour",
        accent: "#283c75",
        accentSoft: "#c9d0e7",
        pricePaise: 49900,
        size: "Net weight to be confirmed",
        availability: "Preview catalogue",
        shortDescription: "A colour-depositing leaf powder for informed, carefully strand-tested botanical colour rituals.",
        metaDescription: "Learn the NatureMist Indigo colour ritual, including honest result variables, strand testing and essential safety guidance.",
        ingredient: "Indigo leaf powder. Batch identity and colour-use directions are confirmed on the final pack.",
        benefits: [
            "Deposits botanical colour when prepared correctly",
            "Supports traditional multi-step colour rituals",
            "Includes clear guidance around result variables"
        ],
        howTo: [
            "Read the final pack directions in full before mixing.",
            "Use gloves and the product-tested water ratio, temperature and application window.",
            "Patch and strand test; final tone varies with starting colour, porosity and previous treatments."
        ],
        mixers: [
            "Water only, unless the final pack states otherwise",
            "A separately designed henna step"
        ],
        suitableFor: [
            "Experienced botanical colour users",
            "Hair colour rituals only"
        ],
        safety: [
            "Indigo alone may appear blue or green on light or grey hair.",
            "Avoid eyes, brows, lashes, inhalation, damaged scalp, clothing and surfaces.",
            "Never skip the patch and strand test described on the final pack."
        ],
        storage: "Keep airtight, cool and dry. Protect from humidity and direct light.",
        texture: "Fine deep-indigo-green leaf powder with natural colour variation.",
        concerns: [
            "Botanical Colour"
        ],
        ritualStep: "Colour",
        experience: "Advanced",
        colorConsiderations: [
            "Grey",
            "Blonde/Bleached",
            "Chemically Coloured"
        ],
        searchTerms: [
            "indigo",
            "indigofera tinctoria",
            "leaf powder",
            "botanical colour",
            "grey hair"
        ],
        faqs: [
            {
                question: "Will Indigo alone make grey hair black?",
                answer: "Not reliably. Indigo alone can look blue or green on light or grey hair. Darker results commonly require a properly designed henna-led or two-step process."
            },
            {
                question: "Why is a strand test essential?",
                answer: "Starting colour, porosity, prior treatments, preparation and timing all affect the final tone. A strand test is the safest way to preview your individual result."
            }
        ]
    }
];
const ritualGoals = [
    "Cleanse",
    "Softness + Shine",
    "Resilient-Feeling Hair",
    "Scalp Ritual",
    "Botanical Colour"
];
const bundles = [
    {
        id: "essential-wash-day",
        name: "Essential Wash Day",
        description: "Reetha, Shikakai and Amla for a cleanse-soften-complete ritual.",
        slugs: [
            "reetha-powder",
            "shikakai-powder",
            "amla-powder"
        ]
    },
    {
        id: "softness-luster",
        name: "Softness & Luster Ritual",
        description: "Amla, Hibiscus and Bhringraj to tailor a richer botanical mask.",
        slugs: [
            "amla-powder",
            "hibiscus-powder",
            "bhringraj-powder"
        ]
    },
    {
        id: "botanical-cabinet",
        name: "The Botanical Cabinet",
        description: "All six powders, with dedicated Indigo colour-safety guidance.",
        slugs: products.map((product)=>product.slug)
    }
];
function getProduct(slug) {
    return products.find((product)=>product.slug === slug);
}
function getBundleProducts(slugs) {
    return slugs.map((slug)=>getProduct(slug)).filter((product)=>Boolean(product));
}
function formatCurrency(pricePaise) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(pricePaise / 100);
}
const globalSafety = "For external use only. Pour slowly to minimise airborne powder. Patch test as directed. Stop use if irritation occurs. Avoid eyes and broken skin. Keep away from children. Prepare fresh and discard leftover paste.";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/features/cart/cart-drawer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartDrawer",
    ()=>CartDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/domain/catalog/products.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/catalog/product-jar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/store/store-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/shared/hooks/use-modal-focus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function CartDrawer() {
    _s();
    const { cart, subtotalPaise, isCartOpen, closeCart, updateQuantity, removeFromCart } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const [discount, setDiscount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [discountMessage, setDiscountMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const drawerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"])(isCartOpen, drawerRef, closeCart);
    const applyDiscount = (event)=>{
        event.preventDefault();
        setDiscountMessage(discount.trim() ? "Discount codes will activate when launch terms are confirmed." : "Enter a code to check it.");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `overlay-shell ${isCartOpen ? "is-open" : ""}`,
        "aria-hidden": !isCartOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "overlay-backdrop",
                type: "button",
                onClick: closeCart,
                "aria-label": "Close bag",
                tabIndex: isCartOpen ? 0 : -1
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "cart-drawer",
                ref: drawerRef,
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "bag-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "eyebrow",
                                        children: "Your selection"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 51,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        id: "bag-title",
                                        children: "Ritual bag"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 52,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "close-button",
                                onClick: closeCart,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 55,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "sr-only",
                                        children: "Close bag"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 56,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    cart.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "cart-empty empty-state",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "empty-state__mark",
                                "aria-hidden": "true",
                                children: "◯"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "display-small",
                                children: "Your ritual begins here."
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Explore six single botanicals, each with a clearly explained purpose."
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 66,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                className: "button button--dark",
                                href: "/shop",
                                onClick: closeCart,
                                children: "Shop the collection"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                        lineNumber: 61,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cart-items",
                                children: cart.map((item)=>{
                                    const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(item.slug);
                                    if (!product) return null;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        className: "cart-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "cart-item__visual",
                                                style: {
                                                    backgroundColor: product.accentSoft
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductJar"], {
                                                    product: product,
                                                    size: "small",
                                                    decorative: true
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 79,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "cart-item__details",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `/shop/${product.slug}`,
                                                                onClick: closeCart,
                                                                children: product.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                lineNumber: 87,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: product.subtitle
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                lineNumber: 90,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                        lineNumber: 86,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "cart-item__controls",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "quantity-control",
                                                                "aria-label": `Quantity for ${product.name}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>updateQuantity(product.slug, item.quantity - 1),
                                                                        "aria-label": `Decrease ${product.name} quantity`,
                                                                        children: "−"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                        lineNumber: 97,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        "aria-live": "polite",
                                                                        children: item.quantity
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                        lineNumber: 104,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>updateQuantity(product.slug, item.quantity + 1),
                                                                        "aria-label": `Increase ${product.name} quantity`,
                                                                        children: "+"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                        lineNumber: 105,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                lineNumber: 93,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(product.pricePaise * item.quantity)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                                lineNumber: 113,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                        lineNumber: 92,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "remove-link",
                                                        type: "button",
                                                        onClick: ()=>removeFromCart(product.slug),
                                                        children: "Remove"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                        lineNumber: 115,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 85,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, item.slug, true, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 78,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cart-summary",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        className: "discount-form",
                                        onSubmit: applyDiscount,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "discount-code",
                                                children: "Discount code"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 129,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        id: "discount-code",
                                                        value: discount,
                                                        onChange: (event)=>setDiscount(event.target.value),
                                                        placeholder: "Enter code"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "submit",
                                                        children: "Apply"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                        lineNumber: 137,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 130,
                                                columnNumber: 17
                                            }, this),
                                            discountMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                role: "status",
                                                children: discountMessage
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 139,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "subtotal-line",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Subtotal"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 142,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(subtotalPaise)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 143,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "commercial-note",
                                        children: "Preview pricing only. Final prices, shipping and taxes will be confirmed before launch."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 145,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        className: "button button--dark button--full",
                                        href: "/checkout",
                                        onClick: closeCart,
                                        children: [
                                            "Continue to checkout ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                "aria-hidden": "true",
                                                children: "↗"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                                lineNumber: 153,
                                                columnNumber: 38
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 148,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        className: "text-link text-link--center",
                                        href: "/shop",
                                        onClick: closeCart,
                                        children: "Continue exploring"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                        lineNumber: 155,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                                lineNumber: 127,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/cart/cart-drawer.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_s(CartDrawer, "V08ydSdj5ZJoeEzQTkMMTqWWshI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"]
    ];
});
_c = CartDrawer;
var _c;
__turbopack_context__.k.register(_c, "CartDrawer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/features/catalog/product-jar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProductJar",
    ()=>ProductJar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function ProductJar({ product, size = "medium", decorative = false, className = "" }) {
    const style = {
        "--jar-accent": product.accent,
        "--jar-accent-soft": product.accentSoft
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `product-jar product-jar--${size} ${className}`,
        style: style,
        role: decorative ? undefined : "img",
        "aria-hidden": decorative ? true : undefined,
        "aria-label": decorative ? undefined : `NatureMist ${product.name} ritual jar preview; final packaging artwork to be supplied`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "product-jar__shadow"
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "product-jar__lid",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                    fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "product-jar__glass",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "product-jar__powder"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "product-jar__label",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "product-jar__brand",
                                children: "NatureMist"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "product-jar__rule"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "product-jar__name",
                                children: product.name.replace(" Powder", "")
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                                lineNumber: 43,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "product-jar__botanical",
                                children: "Botanical powder"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "product-jar__number",
                                children: [
                                    "Ritual ",
                                    product.collectionNumber
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "product-jar__shine"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/catalog/product-jar.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = ProductJar;
var _c;
__turbopack_context__.k.register(_c, "ProductJar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/features/newsletter/newsletter-form.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NewsletterForm",
    ()=>NewsletterForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/store/store-provider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function NewsletterForm() {
    _s();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const { track } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const submit = (event)=>{
        event.preventDefault();
        if (!email.trim() || !email.includes("@")) {
            setMessage("Enter a valid email address.");
            return;
        }
        setMessage("Thank you. Sign-up is ready to connect; your email was not stored in this preview.");
        setEmail("");
        track("newsletter_signup", {
            status: "preview_validated"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        className: "newsletter-form",
        onSubmit: submit,
        noValidate: true,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: "newsletter-email",
                children: "Email address"
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "newsletter-email",
                        type: "email",
                        value: email,
                        onChange: (event)=>setEmail(event.target.value),
                        placeholder: "you@example.com",
                        "aria-describedby": "newsletter-note",
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        "aria-label": "Join the NatureMist newsletter",
                        children: "↗"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                id: "newsletter-note",
                role: "status",
                children: message || "No noise. Just thoughtful ritual notes."
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/newsletter/newsletter-form.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(NewsletterForm, "Js2OSl/NDuTU5TitOGiUXYaNDWo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"]
    ];
});
_c = NewsletterForm;
var _c;
__turbopack_context__.k.register(_c, "NewsletterForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/features/search/search-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchDialog",
    ()=>SearchDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/domain/catalog/products.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/catalog/product-jar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/store/store-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/shared/hooks/use-modal-focus.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function SearchDialog() {
    _s();
    const { isSearchOpen, closeSearch, track } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const dialogRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const closeDialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SearchDialog.useCallback[closeDialog]": ()=>{
            setQuery("");
            closeSearch();
        }
    }["SearchDialog.useCallback[closeDialog]"], [
        closeSearch
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"])(isSearchOpen, dialogRef, closeDialog);
    const results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SearchDialog.useMemo[results]": ()=>{
            const normalized = query.trim().toLowerCase();
            if (!normalized) return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"];
            return __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"].filter({
                "SearchDialog.useMemo[results]": (product)=>[
                        product.name,
                        product.botanical,
                        product.subtitle,
                        ...product.searchTerms
                    ].join(" ").toLowerCase().includes(normalized)
            }["SearchDialog.useMemo[results]"]);
        }
    }["SearchDialog.useMemo[results]"], [
        query
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `overlay-shell ${isSearchOpen ? "is-open" : ""}`,
        "aria-hidden": !isSearchOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "overlay-backdrop",
                type: "button",
                onClick: closeDialog,
                "aria-label": "Close search",
                tabIndex: isSearchOpen ? 0 : -1
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "search-dialog",
                ref: dialogRef,
                role: "dialog",
                "aria-modal": "true",
                "aria-labelledby": "search-title",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "search-dialog__topline",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                id: "search-title",
                                children: "Search NatureMist"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "close-button",
                                onClick: closeDialog,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                        lineNumber: 52,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "sr-only",
                                        children: "Close search"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                        lineNumber: 53,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "search-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Search botanicals and ritual goals"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                "data-autofocus": true,
                                type: "search",
                                value: query,
                                onChange: (event)=>setQuery(event.target.value),
                                placeholder: "Try 'shine', 'soapnut' or 'colour'",
                                autoComplete: "off"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "↗"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "search-dialog__meta",
                        "aria-live": "polite",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    results.length,
                                    " botanical",
                                    results.length === 1 ? "" : "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            query && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setQuery(""),
                                children: "Clear search"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "search-results",
                        children: [
                            results.map((product)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    className: "search-result",
                                    href: `/shop/${product.slug}`,
                                    onClick: ()=>{
                                        track("search", {
                                            result_count: results.length,
                                            selected_item: product.slug
                                        });
                                        closeDialog();
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "search-result__swatch",
                                            style: {
                                                backgroundColor: product.accentSoft
                                            },
                                            "aria-hidden": "true",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProductJar"], {
                                                product: product,
                                                size: "small",
                                                decorative: true
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                                lineNumber: 97,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                            lineNumber: 92,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: product.name
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                                    lineNumber: 100,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                    children: product.subtitle
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                            lineNumber: 99,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            "aria-hidden": "true",
                                            children: "↗"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                            lineNumber: 103,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, product.slug, true, {
                                    fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                    lineNumber: 80,
                                    columnNumber: 13
                                }, this)),
                            results.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "empty-state",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "display-small",
                                        children: "No ritual found."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Try a botanical name or a goal such as cleanse, softness or colour."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                        lineNumber: 109,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "text-link",
                                        type: "button",
                                        onClick: ()=>setQuery(""),
                                        children: "See all botanicals"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                        lineNumber: 110,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                                lineNumber: 107,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/search/search-dialog.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(SearchDialog, "fJMPhpwaEmhw6SS4UhpNa5Khgzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"]
    ];
});
_c = SearchDialog;
var _c;
__turbopack_context__.k.register(_c, "SearchDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/features/store/store-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/domain/catalog/products.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const StoreContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const CART_KEY = "naturemist-cart-v1";
const WISHLIST_KEY = "naturemist-wishlist-v1";
function readStoredArray(key) {
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value : [];
    } catch  {
        return [];
    }
}
function StoreProvider({ children }) {
    _s();
    const [cart, setCart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [wishlist, setWishlist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isCartOpen, setIsCartOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSearchOpen, setIsSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [announcement, setAnnouncement] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoreProvider.useEffect": ()=>{
            const timer = window.setTimeout({
                "StoreProvider.useEffect.timer": ()=>{
                    const savedCart = readStoredArray(CART_KEY).filter({
                        "StoreProvider.useEffect.timer.savedCart": (item)=>typeof item?.slug === "string" && Number.isFinite(item?.quantity) && item.quantity > 0 && Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(item.slug))
                    }["StoreProvider.useEffect.timer.savedCart"]);
                    const savedWishlist = readStoredArray(WISHLIST_KEY).filter({
                        "StoreProvider.useEffect.timer.savedWishlist": (slug)=>typeof slug === "string" && Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(slug))
                    }["StoreProvider.useEffect.timer.savedWishlist"]);
                    setCart(savedCart);
                    setWishlist([
                        ...new Set(savedWishlist)
                    ]);
                    setHydrated(true);
                }
            }["StoreProvider.useEffect.timer"], 0);
            return ({
                "StoreProvider.useEffect": ()=>window.clearTimeout(timer)
            })["StoreProvider.useEffect"];
        }
    }["StoreProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoreProvider.useEffect": ()=>{
            if (!hydrated) return;
            try {
                window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
            } catch  {
            // Storage is a progressive enhancement; the session still works without it.
            }
        }
    }["StoreProvider.useEffect"], [
        cart,
        hydrated
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StoreProvider.useEffect": ()=>{
            if (!hydrated) return;
            try {
                window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
            } catch  {
            // Storage is a progressive enhancement; the session still works without it.
            }
        }
    }["StoreProvider.useEffect"], [
        wishlist,
        hydrated
    ]);
    const track = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[track]": (event, payload = {})=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const detail = {
                event,
                ...payload
            };
            window.dispatchEvent(new CustomEvent("naturemist:analytics", {
                detail
            }));
            const analyticsWindow = window;
            analyticsWindow.dataLayer?.push(detail);
        }
    }["StoreProvider.useCallback[track]"], []);
    const addToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[addToCart]": (slug, quantity = 1, openDrawer = true)=>{
            const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(slug);
            if (!product) return;
            const safeQuantity = Math.max(1, Math.min(12, Math.floor(quantity)));
            setCart({
                "StoreProvider.useCallback[addToCart]": (current)=>{
                    const existing = current.find({
                        "StoreProvider.useCallback[addToCart].existing": (item)=>item.slug === slug
                    }["StoreProvider.useCallback[addToCart].existing"]);
                    if (existing) {
                        return current.map({
                            "StoreProvider.useCallback[addToCart]": (item)=>item.slug === slug ? {
                                    ...item,
                                    quantity: Math.min(12, item.quantity + safeQuantity)
                                } : item
                        }["StoreProvider.useCallback[addToCart]"]);
                    }
                    return [
                        ...current,
                        {
                            slug,
                            quantity: safeQuantity
                        }
                    ];
                }
            }["StoreProvider.useCallback[addToCart]"]);
            setAnnouncement(`${product.name} added to your bag.`);
            track("add_to_cart", {
                item_id: slug,
                quantity: safeQuantity,
                value: product.pricePaise / 100,
                currency: "INR"
            });
            if (openDrawer) setIsCartOpen(true);
        }
    }["StoreProvider.useCallback[addToCart]"], [
        track
    ]);
    const addManyToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[addManyToCart]": (slugs)=>{
            slugs.forEach({
                "StoreProvider.useCallback[addManyToCart]": (slug)=>addToCart(slug, 1, false)
            }["StoreProvider.useCallback[addManyToCart]"]);
            setAnnouncement(`${slugs.length} ritual jars added to your bag.`);
            setIsCartOpen(true);
        }
    }["StoreProvider.useCallback[addManyToCart]"], [
        addToCart
    ]);
    const updateQuantity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[updateQuantity]": (slug, quantity)=>{
            if (quantity <= 0) {
                setCart({
                    "StoreProvider.useCallback[updateQuantity]": (current)=>current.filter({
                            "StoreProvider.useCallback[updateQuantity]": (item)=>item.slug !== slug
                        }["StoreProvider.useCallback[updateQuantity]"])
                }["StoreProvider.useCallback[updateQuantity]"]);
                const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(slug);
                if (product) setAnnouncement(`${product.name} removed from your bag.`);
                track("remove_from_cart", {
                    item_id: slug
                });
                return;
            }
            const safeQuantity = Math.max(1, Math.min(12, Math.floor(quantity)));
            setCart({
                "StoreProvider.useCallback[updateQuantity]": (current)=>current.map({
                        "StoreProvider.useCallback[updateQuantity]": (item)=>item.slug === slug ? {
                                ...item,
                                quantity: safeQuantity
                            } : item
                    }["StoreProvider.useCallback[updateQuantity]"])
            }["StoreProvider.useCallback[updateQuantity]"]);
        }
    }["StoreProvider.useCallback[updateQuantity]"], [
        track
    ]);
    const removeFromCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[removeFromCart]": (slug)=>updateQuantity(slug, 0)
    }["StoreProvider.useCallback[removeFromCart]"], [
        updateQuantity
    ]);
    const clearCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[clearCart]": ()=>{
            setCart([]);
            setAnnouncement("Your bag is now empty.");
        }
    }["StoreProvider.useCallback[clearCart]"], []);
    const toggleWishlist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "StoreProvider.useCallback[toggleWishlist]": (slug)=>{
            const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProduct"])(slug);
            if (!product) return;
            const exists = wishlist.includes(slug);
            setWishlist({
                "StoreProvider.useCallback[toggleWishlist]": (current)=>current.includes(slug) ? current.filter({
                        "StoreProvider.useCallback[toggleWishlist]": (item)=>item !== slug
                    }["StoreProvider.useCallback[toggleWishlist]"]) : [
                        ...current,
                        slug
                    ]
            }["StoreProvider.useCallback[toggleWishlist]"]);
            setAnnouncement(`${product.name} ${exists ? "removed from" : "saved to"} your wishlist.`);
            track(exists ? "remove_from_wishlist" : "add_to_wishlist", {
                item_id: slug
            });
        }
    }["StoreProvider.useCallback[toggleWishlist]"], [
        track,
        wishlist
    ]);
    const subtotalPaise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "StoreProvider.useMemo[subtotalPaise]": ()=>cart.reduce({
                "StoreProvider.useMemo[subtotalPaise]": (total, item)=>{
                    const product = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["products"].find({
                        "StoreProvider.useMemo[subtotalPaise].product": (entry)=>entry.slug === item.slug
                    }["StoreProvider.useMemo[subtotalPaise].product"]);
                    return total + (product?.pricePaise ?? 0) * item.quantity;
                }
            }["StoreProvider.useMemo[subtotalPaise]"], 0)
    }["StoreProvider.useMemo[subtotalPaise]"], [
        cart
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "StoreProvider.useMemo[value]": ()=>({
                cart,
                cartCount: cart.reduce({
                    "StoreProvider.useMemo[value]": (total, item)=>total + item.quantity
                }["StoreProvider.useMemo[value]"], 0),
                subtotalPaise,
                wishlist,
                isCartOpen,
                isSearchOpen,
                announcement,
                addToCart,
                addManyToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                toggleWishlist,
                isWishlisted: ({
                    "StoreProvider.useMemo[value]": (slug)=>wishlist.includes(slug)
                })["StoreProvider.useMemo[value]"],
                openCart: ({
                    "StoreProvider.useMemo[value]": ()=>{
                        setIsSearchOpen(false);
                        setIsCartOpen(true);
                        track("view_cart");
                    }
                })["StoreProvider.useMemo[value]"],
                closeCart: ({
                    "StoreProvider.useMemo[value]": ()=>setIsCartOpen(false)
                })["StoreProvider.useMemo[value]"],
                openSearch: ({
                    "StoreProvider.useMemo[value]": ()=>{
                        setIsCartOpen(false);
                        setIsSearchOpen(true);
                    }
                })["StoreProvider.useMemo[value]"],
                closeSearch: ({
                    "StoreProvider.useMemo[value]": ()=>setIsSearchOpen(false)
                })["StoreProvider.useMemo[value]"],
                track
            })
    }["StoreProvider.useMemo[value]"], [
        addManyToCart,
        addToCart,
        announcement,
        cart,
        clearCart,
        isCartOpen,
        isSearchOpen,
        removeFromCart,
        subtotalPaise,
        toggleWishlist,
        track,
        updateQuantity,
        wishlist
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StoreContext.Provider, {
        value: value,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "sr-only",
                "aria-live": "polite",
                "aria-atomic": "true",
                children: announcement
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/store/store-provider.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/store/store-provider.tsx",
        lineNumber: 256,
        columnNumber: 5
    }, this);
}
_s(StoreProvider, "1a9DOTRfNAe5l/Q3Sg9dKuBOjks=");
_c = StoreProvider;
function useStore() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(StoreContext);
    if (!context) throw new Error("useStore must be used inside StoreProvider");
    return context;
}
_s1(useStore, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "StoreProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/shared/hooks/use-modal-focus.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useModalFocus",
    ()=>useModalFocus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function useModalFocus(active, ref, onClose) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useModalFocus.useEffect": ()=>{
            if (!active) return;
            const previousFocus = document.activeElement;
            const node = ref.current;
            const focusables = node?.querySelectorAll(focusableSelector);
            const preferredFocus = node?.querySelector("[data-autofocus]");
            (preferredFocus || focusables?.[0])?.focus();
            const handleKey = {
                "useModalFocus.useEffect.handleKey": (event)=>{
                    if (event.key === "Escape") {
                        event.preventDefault();
                        onClose();
                        return;
                    }
                    if (event.key !== "Tab" || !focusables?.length) return;
                    const first = focusables[0];
                    const last = focusables[focusables.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            }["useModalFocus.useEffect.handleKey"];
            document.addEventListener("keydown", handleKey);
            document.body.classList.add("has-overlay");
            return ({
                "useModalFocus.useEffect": ()=>{
                    document.removeEventListener("keydown", handleKey);
                    document.body.classList.remove("has-overlay");
                    previousFocus?.focus();
                }
            })["useModalFocus.useEffect"];
        }
    }["useModalFocus.useEffect"], [
        active,
        onClose,
        ref
    ]);
}
_s(useModalFocus, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/widgets/site-chrome/brand-mark.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BrandMark",
    ()=>BrandMark
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function BrandMark() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "brand-lockup",
        "aria-label": "NatureMist home",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "brand-mark",
                "aria-hidden": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
                        lineNumber: 5,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {}, void 0, false, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
                        lineNumber: 6,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "brand-word",
                children: "NatureMist"
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "brand-subline",
                children: "Botanical rituals"
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
                lineNumber: 9,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/widgets/site-chrome/brand-mark.tsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
_c = BrandMark;
var _c;
__turbopack_context__.k.register(_c, "BrandMark");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MobileMenu",
    ()=>MobileMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$brand$2d$mark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/widgets/site-chrome/brand-mark.tsx [app-client] (ecmascript)");
;
;
;
function MobileMenu({ open, wishlistCount, menuRef, onClose, onSearch }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `overlay-shell ${open ? "is-open" : ""}`,
        "aria-hidden": !open,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "overlay-backdrop",
                type: "button",
                onClick: onClose,
                "aria-label": "Close menu",
                tabIndex: open ? 0 : -1
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "mobile-menu",
                ref: menuRef,
                role: "dialog",
                "aria-modal": "true",
                "aria-label": "Mobile navigation",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panel-header",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$brand$2d$mark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BrandMark"], {}, void 0, false, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "close-button",
                                onClick: onClose,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "×"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 39,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "sr-only",
                                        children: "Close menu"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 40,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mobile-menu__links",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/shop",
                                onClick: onClose,
                                children: [
                                    "Shop the botanicals ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "01"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 45,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/rituals",
                                onClick: onClose,
                                children: [
                                    "Choose your ritual ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "02"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 48,
                                        columnNumber: 32
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/our-story",
                                onClick: onClose,
                                children: [
                                    "Our story ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "03"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 51,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/wishlist",
                                onClick: onClose,
                                children: [
                                    "Saved rituals ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: wishlistCount.toString().padStart(2, "0")
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                        lineNumber: 54,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button button--outline button--full",
                        onClick: ()=>{
                            onClose();
                            onSearch();
                        },
                        children: "Search botanicals"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mobile-menu__note",
                        children: "One ingredient. Clearly explained."
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = MobileMenu;
var _c;
__turbopack_context__.k.register(_c, "MobileMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/widgets/site-chrome/site-header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteHeader",
    ()=>SiteHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/store/store-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/shared/hooks/use-modal-focus.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$brand$2d$mark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/widgets/site-chrome/brand-mark.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$mobile$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/widgets/site-chrome/mobile-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function SiteHeader() {
    _s();
    const { cartCount, wishlist, openCart, openSearch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"])();
    const wishlistCount = wishlist.length;
    const [compact, setCompact] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mobileOpen, setMobileOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const mobileRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const closeMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SiteHeader.useCallback[closeMobile]": ()=>setMobileOpen(false)
    }["SiteHeader.useCallback[closeMobile]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SiteHeader.useEffect": ()=>{
            const onScroll = {
                "SiteHeader.useEffect.onScroll": ()=>setCompact(window.scrollY > 28)
            }["SiteHeader.useEffect.onScroll"];
            onScroll();
            window.addEventListener("scroll", onScroll, {
                passive: true
            });
            return ({
                "SiteHeader.useEffect": ()=>window.removeEventListener("scroll", onScroll)
            })["SiteHeader.useEffect"];
        }
    }["SiteHeader.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"])(mobileOpen, mobileRef, closeMobile);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                className: "skip-link",
                href: "#main-content",
                children: "Skip to content"
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "announcement-bar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "Rooted in Ayurveda ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "•"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                lineNumber: 34,
                                columnNumber: 30
                            }, this),
                            " Made for modern rituals"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/rituals",
                        children: [
                            "Find your ritual ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "↗"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                lineNumber: 37,
                                columnNumber: 28
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: `site-header ${compact ? "is-compact" : ""}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    className: "site-nav",
                    "aria-label": "Primary navigation",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "site-nav__left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    className: "nav-link",
                                    href: "/shop",
                                    children: "Shop"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    className: "nav-link",
                                    href: "/rituals",
                                    children: "Rituals"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    className: "nav-link",
                                    href: "/our-story",
                                    children: "Our Story"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 49,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                            lineNumber: 42,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            className: "site-nav__logo",
                            href: "/",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$brand$2d$mark$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BrandMark"], {}, void 0, false, {
                                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                lineNumber: 54,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "site-nav__actions",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-action desktop-action",
                                    type: "button",
                                    onClick: openSearch,
                                    children: "Search"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    className: "text-action desktop-action",
                                    href: "/wishlist",
                                    children: [
                                        "Wishlist ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "count-badge",
                                            children: wishlistCount
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                            lineNumber: 61,
                                            columnNumber: 24
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-action",
                                    type: "button",
                                    onClick: openCart,
                                    children: [
                                        "Bag ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "count-badge",
                                            children: cartCount
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                            lineNumber: 64,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "menu-button",
                                    type: "button",
                                    onClick: ()=>setMobileOpen(true),
                                    "aria-label": "Open menu",
                                    "aria-expanded": mobileOpen,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                            lineNumber: 73,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                            lineNumber: 74,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$widgets$2f$site$2d$chrome$2f$mobile$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MobileMenu"], {
                open: mobileOpen,
                wishlistCount: wishlistCount,
                menuRef: mobileRef,
                onClose: closeMobile,
                onSearch: openSearch
            }, void 0, false, {
                fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/widgets/site-chrome/site-header.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_s(SiteHeader, "T2CGtuljFwxXE0ObiSEYRYnCFcU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$shared$2f$hooks$2f$use$2d$modal$2d$focus$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModalFocus"]
    ];
});
_c = SiteHeader;
var _c;
__turbopack_context__.k.register(_c, "SiteHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_src_1jj41ku._.js.map