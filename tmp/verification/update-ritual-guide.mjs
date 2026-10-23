import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const bundle = await build({ entryPoints: [root + 'frontend/src/features/rituals/guided-quiz.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
const { ritualQuestions } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const intro = `NATUREMIST - ADAPTIVE RITUAL QUIZ
Question bank and product-routing specification
Aligned with the current local implementation; deployment is separate.

CUSTOMER EXPERIENCE
Heading: Find your ritual.
Four starting interests: Hair Care, Skin Care, Hair & Skin, Hair Colour.
Ask one relevant question at a time, using the previous answers and current product catalogue.
Use positive, practical language. Ordinary uncertainty leads to clarification or a product card with preparation steps.
Show product cards immediately below the result title. Put Your next steps and the expandable Your preferences summary below the products.
Give a specific reason connected to the customer's ingredient preference, care step and routine size.
Keep one-product requests to one product. A requested second step can add one complementary product, up to two distinct products total.
Back preserves answers. Editing an earlier answer clears all dependent answers and checks.
Restart the quiz when product eligibility changes so old checks cannot transfer to another product.

CATALOGUE AND INTENDED USE
Amla, Hibiscus and Bhringraj: traditional hair packs.
Reetha and Shikakai: herbal hair washes.
Indigo: botanical hair colour, within an appropriate complete colouring method.
Use current product identity, ingredient, intended role, directions, variant and stock.
General wash preferences choose the first eligible available product in this order: Shikakai, Reetha.
General pack preferences choose the first eligible available product in this order: Amla, Hibiscus, Bhringraj.
Explicit ingredient preferences take priority. If the exact choice is unavailable, show a labelled available alternative for the same care step.
Alternatives require their own directions and checks; preserve the customer's original preference in the summary.
Skin eligibility requires a Skin Care classification and explicit Face/Facial and/or Body directions, without conflicting restrictions.
A shared Hair & Skin product must meet both sets of intended-use requirements.
Current local product information establishes hair uses. Skin and Both interests therefore offer an explicit choice to explore hair care while confirmed skin-use directions are pending.
Product descriptions, research, traditions and jar illustrations alone do not establish skin-use eligibility.
Read prices, sizes, availability and links from current product data. Preview data is labelled as preview.

ADAPTIVE ROUTING
1. Everyone starts with careArea, then check.
2. check=unsure asks comfortCheck. A comfortable/no-known-reaction answer continues to the selected care branch. Personal-guidance, reaction and active-irritation answers retain their appropriate guidance.
3. Previous reaction asks reactionIngredient. Active irritation, reported reactions and an unexpected strand result remain guidance routes rather than claims of personal suitability.
4. Hair asks hairGoal. Cleanse asks washNeed; pack asks packNeed; scalp asks scalpNeed; unsure asks hairStep.
5. scalpNeed=wash continues to washNeed; pack selects Bhringraj; unsure asks hairStep. Persistent symptoms receive professional guidance.
6. hairStep=wash chooses the wash branch. pack or Choose a simple hair pack for me continues to packNeed.
7. Hair history is asked after choosing the hair ingredient. Treated hair asks treatmentType. An unsure history or treatment answer continues through the routine and strand questions; the product result includes a compatibility-review step.
8. Hair-only routine=one/unsure keeps one product. routine=two asks packAddon for a wash, or washAddon for a pack. Skip keeps the first product.
9. Light, treated or uncertain hair history asks strand for the exact selected hair products. passed continues; notyet/unsure retains the products with preparation guidance; changed receives a personal review result.
10. Skin and Both check catalogue eligibility before asking skin ingredient questions. When a hair alternative is available, bothFallback offers a clear choice: explore a hair-care step or a traditional hair pack. Only that explicit choice changes careArea to hair.
11. bothFallback=hair asks hairGoal; pack goes directly to packNeed. The result is labelled Hair Care, and the summary retains the original skin/Both interest and explicit continuation choice.
12. With eligible skin products, Skin asks skinArea, then skinNeed, then skinChecks. Compare is an alternatives comparison: choose one to start.
13. Eligible Both asks bothPlan. Shared asks skinArea, sharedNeed, hairHistory and any treatmentType, then skinChecks and any strand check. Separate asks skinArea, a hair goal and ingredient, hair history, a single skin ingredient, then the relevant checks. The Both plan replaces the hair-only routine/addon questions.
14. If the selected skin area has no eligible product, offer the explicit hair-care continuation where available. Shared uses require directions for both areas. The same product chosen twice becomes one Both card.
15. Hair Colour asks colourTarget. deeper/grey continues to colourBase. lighter/copper/unsure asks colourFallback: explore deeper tones or a separate hair-care ritual. Never silently present Indigo as a lighter/copper product.
16. colourFallback=deeper explicitly changes the target and continues to colourBase. hair explicitly changes careArea to hair and asks hairGoal. The summary records both answers.
17. Colour asks colourBase, colourHistory and henna. Uncertain or treated/lightened hair retains an Indigo information card with compatibility-review instructions before use.
18. henna=no/unsure shows an Indigo card with a plan-the-method next step. It does not imply the complete method is ready. Henna is a separately sourced product outside this collection.
19. henna=ready asks colourChecks. passed gives the colour-stage result; notyet gives preparation steps; reaction or unwanted strand shade receives review guidance. Compatibility review still applies where indicated by hair history.
20. Every ordinary completed choice path offers products when the catalogue has an eligible item. A completely empty/unavailable catalogue, unsupported intended use without a chosen alternative, or an actual reaction/irritation requires truthful guidance rather than a fabricated match.

RESULT PRESENTATION
Product first: current image, name, intended use, why it fits, product link and directions link.
Candidate title: Your suggested starting ritual.
Hair preparation title: Your ritual, with a little preparation.
Colour preparation title: Explore your colour ritual.
Alternative title: Your available botanical picks.
Show the precise next steps under the products. Conditional cards link to directions for review rather than implying ready-to-use suitability.
Do not promise treatment benefits, guaranteed colour, allergy-safe substitutes or a perfect match.
Pause/review states use calm, actionable wording and preserve the option to edit answers.

QUESTION BANK - EXACT CURRENT UI COPY
`;
const bank = ritualQuestions.map((q) => `${q.id.toUpperCase()} | ${q.label}\nID: ${q.id}\nQuestion: ${q.question}\nHelper: ${q.helper}\nSelection: ${q.multiple ? 'Multiple; exclusive options clear other selections.' : 'Single.'}\n${q.options.map((o) => `  ${o.value} - ${o.label}${o.description ? ` (${o.description})` : ''}${o.exclusive ? ' [exclusive]' : ''}`).join('\n')}`).join('\n\n');
await writeFile(root + 'NatureMist_Adaptive_Ritual_Quiz.txt', intro + '\n' + bank + '\n', 'utf8');
