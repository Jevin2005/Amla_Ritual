module.exports = [
"[project]/frontend/src/features/rituals/recommendation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "goalOptions",
    ()=>goalOptions,
    "hairFeels",
    ()=>hairFeels,
    "recommendRitual",
    ()=>recommendRitual
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/domain/catalog/products.ts [app-ssr] (ecmascript)");
;
const goalOptions = [
    {
        goal: "Cleanse",
        number: "01",
        copy: "A low-lather wash-day reset"
    },
    {
        goal: "Softness + Shine",
        number: "02",
        copy: "A conditioning mask for luminous lengths"
    },
    {
        goal: "Scalp Ritual",
        number: "03",
        copy: "Grounding care from scalp through ends"
    },
    {
        goal: "Botanical Colour",
        number: "04",
        copy: "Informed, carefully strand-tested colour"
    }
];
const hairFeels = [
    "Oily",
    "Balanced",
    "Dry / textured",
    "Very light / coloured"
];
function recommendRitual(goal, hairFeel) {
    if (goal === "Botanical Colour") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("indigo-powder");
    if (goal === "Scalp Ritual") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("bhringraj-powder");
    if (goal === "Cleanse") {
        return hairFeel === "Oily" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("reetha-powder") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("shikakai-powder");
    }
    return hairFeel === "Dry / textured" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("hibiscus-powder") : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$domain$2f$catalog$2f$products$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProduct"])("amla-powder");
}
}),
"[project]/frontend/src/features/rituals/ritual-finder.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RitualFinder",
    ()=>RitualFinder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/catalog/product-jar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/store/store-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$rituals$2f$recommendation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/features/rituals/recommendation.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function RitualFinder() {
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [goal, setGoal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hairFeel, setHairFeel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const { addToCart, track } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$store$2f$store$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])();
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>goal && hairFeel ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$rituals$2f$recommendation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recommendRitual"])(goal, hairFeel) : null, [
        goal,
        hairFeel
    ]);
    const finish = ()=>{
        if (!goal || !hairFeel) return;
        setStep(3);
        track("quiz_completed", {
            recommendation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$rituals$2f$recommendation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recommendRitual"])(goal, hairFeel).slug
        });
    };
    const reset = ()=>{
        setGoal(null);
        setHairFeel(null);
        setStep(1);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ritual-finder",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ritual-finder__progress",
                "aria-label": `Step ${step} of 3`,
                children: [
                    1,
                    2,
                    3
                ].map((number)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: step >= number ? "is-active" : ""
                    }, number, false, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                className: "ritual-finder__step",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "01"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 48,
                                columnNumber: 13
                            }, this),
                            "What would you like your ritual to focus on?"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ritual-options",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$rituals$2f$recommendation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["goalOptions"].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: goal === option.goal ? "is-selected" : "",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "radio",
                                        name: "ritual-goal",
                                        value: option.goal,
                                        checked: goal === option.goal,
                                        onChange: ()=>setGoal(option.goal)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 54,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ritual-options__number",
                                        children: option.number
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 61,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: option.goal
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 62,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: option.copy
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 63,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ritual-options__check",
                                        "aria-hidden": "true",
                                        children: "○"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 64,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, option.goal, true, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 53,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "button button--light",
                        disabled: !goal,
                        onClick: ()=>setStep(2),
                        children: [
                            "Continue ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-hidden": "true",
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 74,
                                columnNumber: 22
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this),
            step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                className: "ritual-finder__step",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("legend", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "02"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            "How do your hair and lengths feel today?"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hair-feel-options",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$rituals$2f$recommendation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hairFeels"].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: hairFeel === option ? "is-selected" : "",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "radio",
                                        name: "hair-feel",
                                        value: option,
                                        checked: hairFeel === option,
                                        onChange: ()=>setHairFeel(option)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 88,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: option
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 95,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, option, true, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 87,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ritual-finder__buttons",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button button--ghost-light",
                                onClick: ()=>setStep(1),
                                children: "Back"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 100,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "button button--light",
                                disabled: !hairFeel,
                                onClick: finish,
                                children: [
                                    "Reveal my ritual ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        "aria-hidden": "true",
                                        children: "→"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 104,
                                        columnNumber: 32
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                lineNumber: 80,
                columnNumber: 9
            }, this),
            step === 3 && result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ritual-result",
                "aria-live": "polite",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ritual-result__visual",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$features$2f$catalog$2f$product$2d$jar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProductJar"], {
                            product: result,
                            size: "large",
                            decorative: true
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                            lineNumber: 113,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 112,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ritual-result__copy",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow eyebrow--light",
                                children: "Your starting ritual"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 116,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                children: result.name
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 117,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: result.shortDescription
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 118,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "ritual-result__safety",
                                children: "This is cosmetic guidance, not a diagnosis. Always read the final pack directions and patch test."
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ritual-result__buttons",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "button button--light",
                                        type: "button",
                                        onClick: ()=>addToCart(result.slug),
                                        children: [
                                            "Add to bag ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                "aria-hidden": "true",
                                                children: "↗"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                                lineNumber: 124,
                                                columnNumber: 28
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 123,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        className: "text-link text-link--light",
                                        href: `/shop/${result.slug}`,
                                        children: "Read the ritual"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                        lineNumber: 126,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "reset-link",
                                type: "button",
                                onClick: reset,
                                children: "Start again"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                        lineNumber: 115,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/src/features/rituals/ritual-finder.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=frontend_src_features_rituals_0t6ce6g._.js.map