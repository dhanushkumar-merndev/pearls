/* =========================================================
   Blog content.
   Add a post: append an object here, then `node build/generate.js`.

   ⚠️ AUTHORSHIP — posts are attributed to `author` below. Change this
   to a named clinician once the clinic confirms who is signing off on
   the medical content. Do not attribute to a doctor who has not
   reviewed the article.
   ========================================================= */

const AUTHOR = 'Pearl Aesthetic Clinical Team';

const BLOG = [
  {
    slug: 'choosing-a-plastic-surgeon-in-india',
    title: 'How to Choose a Plastic Surgeon in India: 9 Checks That Actually Matter',
    seoTitle: 'How to Choose a Plastic Surgeon in India',
    excerpt: 'Marketing budgets and follower counts tell you nothing about surgical safety. These are the checks that do — and the red flags worth walking away from.',
    category: 'Choosing Care',
    image: 'blog-1.jpg',
    imageAlt: 'A calm, private clinic treatment room',
    date: '2026-06-12',
    readTime: 8,
    author: AUTHOR,
    keywords: 'choosing a plastic surgeon India, MCh plastic surgery, NMC registration, cosmetic surgery safety Bengaluru',
    body: [
      { p: [
        'Cosmetic surgery in India is a largely unregulated marketplace at the point of advertising. Anyone can run a clinic that looks impressive, and qualifications that sound similar can mean very different things. The gap between a well-marketed practice and a well-qualified one is where most poor outcomes happen.',
        'These are the checks worth doing before you book anything. None of them require medical knowledge — they only require asking directly and being willing to leave if the answers are vague.'
      ]},
      { h: '1. Confirm the actual surgical qualification', p: [
        'In India, the recognised specialist qualification in plastic surgery is an MCh (Plastic Surgery) or DNB (Plastic Surgery), taken after general surgery training. That is a long path, and it is the one that covers reconstructive and aesthetic surgery properly.',
        'What it is not: a diploma, a fellowship of a few months, a certificate from a device manufacturer, or "cosmetologist". Those are real training in their own right, but they are not specialist plastic surgery training. Ask which qualification the surgeon holds and where they took it. A qualified surgeon will answer immediately.'
      ]},
      { h: '2. Check the NMC or State Medical Council registration', p: [
        'Every practising doctor in India has a registration number with the National Medical Commission or a State Medical Council. It is public, it is searchable, and a clinic should give it to you without hesitation.',
        'If a clinic will not provide a registration number, that alone answers the question.'
      ]},
      { h: '3. Ask who administers the anaesthetic', p: [
        'For anything under general anaesthesia, you want a qualified consultant anaesthetist whose only job that day is your airway and your vital signs — not the operating surgeon supervising sedation, and not a technician.',
        'Ask directly: "Who gives the anaesthetic, and what are their qualifications?" This is one of the single largest safety variables in cosmetic surgery, and it is frequently where cheaper quotes are cheaper.'
      ]},
      { h: '4. Ask where the operation actually happens', p: [
        'Some procedures are entirely safe in a well-equipped day-care setting under local anaesthetic. Others need a proper accredited operating theatre with resuscitation equipment, oxygen, monitoring and a plan for transfer if something goes wrong.',
        'Find out which facility your specific procedure will be done in, whether it is accredited, and what the arrangement is if you need to be admitted.'
      ]},
      { h: '5. Look at before-and-afters of people who look like you', p: [
        'Every clinic shows its best results. That is not dishonest, but it is not useful either. What is useful is asking to see cases with a starting point comparable to yours — similar anatomy, similar age, similar skin type, similar severity.',
        'If a surgeon can only show you dramatic transformations of patients who started in a very different place, you have learned nothing about what your result would look like.'
      ]},
      { h: '6. Ask what the revision policy is — before you need one', p: [
        'Revision rates in cosmetic surgery are real and not always a sign of poor work. Rhinoplasty in particular has meaningful revision rates even in excellent hands, because tissue heals unpredictably.',
        'What matters is that the policy exists and is stated in writing before you proceed: under what circumstances a revision is done, who pays for theatre and anaesthetic, and how long the window is.'
      ]},
      { h: '7. Notice whether you are being sold to', p: [
        'A consultation should feel like an assessment. If you are being offered a discount for booking today, quoted a price before anyone has examined you, upsold additional procedures you did not come in asking about, or pushed toward a date before you have had time to think — that is a sales process, not a medical one.',
        'The single best sign of a good clinic is one that tells you not to have something. Surgeons who are comfortable declining cases are surgeons who are not dependent on your booking.'
      ]},
      { h: '8. Get the full quotation in writing', p: [
        'A quotation should cover the surgeon\'s fee, anaesthetic, theatre, implants or consumables, post-operative garments, follow-up appointments and histopathology where relevant. Ask specifically what is not included.',
        'Quotes that come in dramatically below everyone else usually differ on one of those lines — most often the anaesthetist or the facility.'
      ]},
      { h: '9. Check that the person consulting you is the person operating', p: [
        'In higher-volume clinics it is common to be assessed by a counsellor or coordinator, then meet the surgeon briefly on the day. That arrangement makes it very hard for expectations to be set accurately, because the person who understood what you wanted is not the person holding the instruments.',
        'Ask who will perform the surgery, and insist on meeting them before you commit.'
      ]},
      { h: 'The red flags, in short', list: [
        'Won\'t state the surgical qualification or registration number',
        'Prices quoted before any examination',
        'Time-limited discounts on surgery',
        'No named consultant anaesthetist for general anaesthesia',
        'Guaranteed results, or dismissal of risk as "very rare, don\'t worry"',
        'Only shows dramatic before-and-afters unlike your starting point',
        'Pressure to book on the day of consultation',
        'No written quotation and no written revision policy'
      ]},
      { h: 'A reasonable way to decide', p: [
        'Consult more than one surgeon. Compare what each of them told you was realistic, not what each of them quoted. The surgeon who described the limitations most precisely is usually the one who understands the operation best.',
        'And give yourself a gap between the consultation and the decision. Nothing in aesthetic surgery is urgent. A practice that respects that will still be there in three weeks.'
      ]}
    ]
  },

  {
    slug: 'laser-treatment-indian-skin',
    title: 'Laser Treatments on Indian Skin: What Fitzpatrick IV–VI Changes',
    seoTitle: 'Laser Treatment for Indian Skin Types',
    excerpt: 'Most laser protocols were written for pale European skin. On deeper skin tones the same settings can cause the exact pigmentation you came in to treat.',
    category: 'Laser & Skin',
    image: 'blog-3.jpg',
    imageAlt: 'Close-up of healthy, even-toned skin',
    date: '2026-05-28',
    readTime: 7,
    author: AUTHOR,
    keywords: 'laser treatment Indian skin, Fitzpatrick IV V VI, post-inflammatory hyperpigmentation, melasma laser Bengaluru',
    body: [
      { p: [
        'Laser devices do not treat skin. They deliver energy that is absorbed by a target — melanin, haemoglobin, or water — and the clinical result depends entirely on how selectively that happens.',
        'That is why skin tone matters so much. In Fitzpatrick types IV to VI, which covers most Indian skin, there is substantially more melanin sitting in the epidermis, competing for the same energy. Treat that skin with settings designed for Fitzpatrick I–II and the epidermis absorbs energy meant for the target, inflames, and responds the way it always responds to injury: by making more pigment.'
      ]},
      { h: 'Post-inflammatory hyperpigmentation is the main risk', p: [
        'PIH is the dark patch that appears weeks after a treatment, sometimes worse than the problem being treated. It is not an allergic reaction and not usually permanent, but it can take six to twelve months to fade and it is genuinely distressing.',
        'It is also largely preventable. The variables that matter are wavelength selection, fluence, pulse duration, cooling, the interval between sessions, and what you are doing to the skin before and after.'
      ]},
      { h: 'What good practice looks like', list: [
        'A documented Fitzpatrick assessment before the first treatment, not an estimate from a photo',
        'A test patch in a discreet area, reviewed two to four weeks later, before treating a whole face',
        'Longer wavelengths where possible — they penetrate past epidermal melanin more safely',
        'Lower fluences with more sessions, rather than aggressive single treatments',
        'Effective epidermal cooling throughout',
        'Longer intervals between sessions than the device manufacturer\'s default schedule'
      ]},
      { h: 'Melasma deserves its own paragraph', p: [
        'Melasma is common in Indian skin, hormonally driven, and it behaves badly under heat. Aggressive laser treatment can clear it briefly and then trigger a rebound that is worse than the starting point.',
        'Current practice is low-fluence, high-frequency protocols combined with medical topicals and — the part patients most often skip — genuinely strict daily photoprotection. Melasma is managed rather than cured, and any clinic promising permanent clearance in a fixed number of sessions is overselling.'
      ]},
      { h: 'Sun protection is not an upsell', p: [
        'Bengaluru sits at 12° north. UV levels are high year-round, and visible light — which ordinary sunscreens do not block — also drives pigmentation in deeper skin tones.',
        'That is why tinted sunscreens containing iron oxides are recommended after pigment treatments: the tint is what blocks visible light. Broad-spectrum SPF 50, reapplied, plus shade and timing. Without it, the treatment is being undone between sessions.'
      ]},
      { h: 'Which treatments need the most caution', p: [
        'Ablative resurfacing carries the highest PIH risk and needs the most conservative approach and the most thorough pre-conditioning of the skin.',
        'Hair removal on deep skin needs long-wavelength devices; using the wrong wavelength on dark skin risks burns, not just pigment change.',
        'Vascular treatments are generally safer but still need careful cooling.',
        'Non-ablative and fractional approaches sit in the middle — usually well tolerated, but still not something to have done at maximum settings on a first visit.'
      ]},
      { h: 'Realistic expectations', p: [
        'Most pigment and texture concerns need three to six sessions spaced four to six weeks apart, and improvement is gradual. Results that appear after one session on social media are either a different starting point, a different problem, or a filter.',
        'The honest version: deeper skin tones can be treated safely and effectively with lasers, but they need a clinician who adjusts protocol to skin type rather than following the device preset. Ask what settings are being used and why. A clinic that can answer that is a clinic that thought about it.'
      ]}
    ]
  },

  {
    slug: 'rhinoplasty-recovery-timeline',
    title: 'Rhinoplasty Recovery: An Honest Week-by-Week Timeline',
    seoTitle: 'Rhinoplasty Recovery: Week-by-Week Timeline',
    excerpt: 'The splint comes off in a week. The nose takes a year. Here is what actually happens in between, without the marketing gloss.',
    category: 'Recovery',
    image: 'blog-2.jpg',
    imageAlt: 'A single white rose against a pale background',
    date: '2026-05-14',
    readTime: 9,
    author: AUTHOR,
    keywords: 'rhinoplasty recovery timeline, nose job swelling, septorhinoplasty aftercare, rhinoplasty India',
    body: [
      { p: [
        'Rhinoplasty has the longest gap between "healed" and "finished" of any facial procedure. You will look socially presentable in about two weeks and the nose will not be its final shape for a year or more.',
        'Knowing that in advance changes the experience considerably. Most rhinoplasty distress is not caused by complications — it is caused by patients judging a result at six weeks that was never going to be finished at six weeks.'
      ]},
      { h: 'Days 1–3: the worst of it', p: [
        'You will have a splint on the bridge and possibly soft internal splints. Breathing through the nose will be blocked — this is swelling and packing, not damage. Expect to mouth-breathe, which makes the throat dry and sleep poor.',
        'Swelling and bruising around the eyes peak around day two or three. Bruising is usually worse if bone work was done. Sleeping propped up at 30–45 degrees genuinely reduces both. Cold compresses on the cheeks, never pressed on the nose itself.',
        'Pain is generally milder than people expect — more pressure and congestion than sharp pain.'
      ]},
      { h: 'Days 4–7: turning the corner', p: [
        'Bruising starts moving down and yellowing. Swelling begins to settle. Most people stop needing anything stronger than paracetamol.',
        'The splint usually comes off between day six and day eight, along with any external sutures. This is the moment most patients find hardest: the nose that emerges is swollen, often upturned, sometimes asymmetrical, and looks nothing like the final result. That is normal and it is temporary.'
      ]},
      { h: 'Weeks 2–4: socially presentable', p: [
        'Most bruising has resolved and most people return to office work by the end of week two. Residual swelling is still obvious to you and largely invisible to others.',
        'The tip stays swollen and firm — it has the thickest soft tissue and drains slowest. Numbness of the tip and upper lip is common and resolves over months.',
        'No glasses resting on the bridge if bone work was done, typically for four to six weeks. Tape them to the forehead or use contacts. No contact sport, no heavy lifting, no blowing the nose forcefully.'
      ]},
      { h: 'Months 2–4: the plateau that worries people', p: [
        'Roughly 70–80% of swelling is gone. Progress slows dramatically and this is where patients most often panic — the nose looks a bit wide, a bit heavy in the tip, and it has stopped visibly changing week to week.',
        'This is also when minor asymmetries are most apparent, because swelling rarely resolves perfectly evenly. Almost all of it settles. Judging the result here is premature.'
      ]},
      { h: 'Months 6–18: the actual result', p: [
        'The last 10–20% of swelling resolves slowly, mostly in the tip, and thicker skin takes longer than thin skin. Definition sharpens gradually.',
        'Most surgeons will not consider revision before twelve months, and often eighteen for thick-skinned or revision cases, because operating into unsettled tissue makes outcomes worse and unpredictable.'
      ]},
      { h: 'What is normal, and what is not', p: [
        'Normal: swelling that fluctuates with heat, salt, alcohol and time of day; numbness; firmness in the tip; a small amount of bloody discharge in the first days; feeling that one side breathes better than the other early on.',
        'Call the clinic: fever, spreading redness, worsening pain after day three or four, heavy bleeding that does not stop with pressure and elevation, or sudden visual changes. These are uncommon but they are the things not to wait on.'
      ]},
      { h: 'Things that genuinely help', list: [
        'Sleep elevated for the first two weeks',
        'Keep salt low in the first fortnight — it visibly worsens swelling',
        'No alcohol for two weeks; it dilates vessels and prolongs bruising',
        'No smoking, at all, before or after — it directly impairs healing of the skin flap',
        'Sun protection on the nose for at least six months; new scar tissue pigments easily',
        'Take photographs monthly in the same light, so you can see progress you cannot feel'
      ]},
      { h: 'The part worth internalising', p: [
        'Rhinoplasty rewards patience more than any other aesthetic operation. The nose at three months is not the nose at fifteen months, and a large proportion of people who are unhappy at three months are happy at a year without anything further being done.'
      ]}
    ]
  },

  {
    slug: 'gynecomastia-or-chest-fat',
    title: 'Gynecomastia or Chest Fat? How to Tell the Difference',
    seoTitle: 'Gynecomastia or Chest Fat? How to Tell',
    excerpt: 'Liposuction alone leaves the firm disc behind the nipple untouched — which is why so many men need a second operation after their first.',
    category: 'Men\'s Health',
    image: 'blog-4.jpg',
    imageAlt: 'Considered, low-lit clinical interior',
    date: '2026-04-30',
    readTime: 6,
    author: AUTHOR,
    keywords: 'gynecomastia surgery Bengaluru, male breast reduction, chest fat vs gynecomastia, gyno surgery India',
    body: [
      { p: [
        'Male chest enlargement has two quite different causes, and they need different operations. Getting the distinction wrong is the single most common reason men end up having gynecomastia surgery twice.'
      ]},
      { h: 'The physical difference', p: [
        'True gynecomastia is glandular breast tissue. It sits directly behind and around the nipple-areola complex, feels firm and rubbery, is often tender, and has a defined edge you can feel where it stops. It is frequently asymmetrical between the two sides.',
        'Pseudogynecomastia is fat. It is soft, evenly spread across the chest, not tender, and has no discrete disc under the nipple. It tracks with overall body weight.',
        'A simple self-check: lying flat, pinch inward from the edge of the chest toward the nipple. Fat feels uniform the whole way. Glandular tissue feels like a firm, distinct button under the areola.',
        'Many men have both. That combination is the most common presentation in practice.'
      ]},
      { h: 'Why liposuction alone often fails', p: [
        'Liposuction removes fat efficiently. It does not remove fibrous glandular tissue — the cannula simply cannot break it down.',
        'So a chest treated by liposuction alone gets flatter overall while the firm disc behind the nipple remains. Once the surrounding fat is gone, that disc is often more visible, not less, and can leave a puffy, pointed nipple that looks worse than the starting point.',
        'Proper correction usually combines liposuction for the fatty component with direct excision of the gland through a small incision at the lower edge of the areola.'
      ]},
      { h: 'When it should be investigated first', p: [
        'Gynecomastia is usually benign and idiopathic. But it can be a symptom, and there are situations where an endocrine work-up should come before any discussion of surgery:',
      ], list: [
        'Rapid onset over weeks to months rather than gradual development',
        'Significant tenderness or nipple discharge',
        'One side only, particularly with a hard or fixed lump',
        'Onset alongside testicular changes, loss of libido or unexplained weight change',
        'Anabolic steroid use, or medications known to cause it',
        'Onset in an older man with no prior history'
      ], after: [
        'Adolescent gynecomastia in teenage boys is common and resolves on its own in the majority of cases within two years. Surgery is rarely appropriate before that has been given time.'
      ]},
      { h: 'Timing and weight', p: [
        'If you are actively losing weight, wait until you are stable. Fat reduction changes the chest, and the amount of glandular tissue is much easier to judge accurately at a settled weight.',
        'If you are using anabolic steroids, surgery while continuing is likely to be undone. This needs an honest conversation with the surgeon — it changes the plan, and it is not something they are going to judge you for.'
      ]},
      { h: 'What recovery involves', p: [
        'It is a shorter recovery than most men expect: typically one to two weeks off work for a desk job, a compression vest for four to six weeks, and no chest or upper body training for around six weeks.',
        'Scars are small and sit at the border of the areola where the colour change hides them. Swelling settles over two to three months, and the final contour is apparent around the three-month mark.'
      ]},
      { h: 'The short version', p: [
        'Soft and even across the whole chest, moves with your body weight: probably fat. Firm, defined, tender, centred under the nipple: probably glandular. Both together: most people.',
        'The only way to know reliably is an examination. Ask specifically whether your surgeon plans to excise gland as well as liposuction — and if the answer is liposuction alone, ask why.'
      ]}
    ]
  },

  {
    slug: 'fillers-or-surgery',
    title: 'Fillers or Surgery? Where Non-Surgical Treatment Genuinely Stops Working',
    seoTitle: 'Fillers or Surgery? Knowing the Limits',
    excerpt: 'Filler restores volume. It cannot lift tissue that has descended. Understanding that distinction saves a great deal of money and a great deal of disappointment.',
    category: 'Non-Surgical',
    image: 'blog-5.jpg',
    imageAlt: 'A pale pink dahlia, softly lit',
    date: '2026-04-08',
    readTime: 7,
    author: AUTHOR,
    keywords: 'fillers vs facelift, dermal filler limits, when to have a facelift, non-surgical facelift Bengaluru',
    body: [
      { p: [
        'The most useful question in aesthetic medicine is not "what treatment do I want" but "what has actually changed". Faces age through several separate processes, and each one responds to a different intervention. Applying the wrong one produces the results everyone recognises as overdone.'
      ]},
      { h: 'The four things that change', list: [
        'Skin quality — texture, pigment, fine lines, laxity of the skin itself',
        'Volume — fat pads and bone shrink, particularly at the temples, midface and jaw',
        'Descent — the soft tissue that remains slides downward under gravity',
        'Muscle — repeated expression etches lines into the skin above it'
      ], after: [
        'Skin quality responds to lasers, microneedling, boosters and medical topicals. Volume loss responds to filler or fat grafting. Muscle-driven lines respond to relaxing injections. Descent responds to surgery, and only to surgery.'
      ]},
      { h: 'Why filler cannot lift', p: [
        'Filler is a gel. It occupies space and provides some structural support, but it does not reposition tissue that has moved. When it is used to chase descent — repeatedly adding volume to a cheek that has fallen rather than deflated — the outcome is a face that becomes progressively heavier and wider rather than lifted.',
        'This is the mechanism behind the look people describe as "pillow face". It is almost never one bad treatment. It is the accumulation of reasonable-sounding individual decisions, each adding a little more volume to compensate for a problem volume was never going to fix.'
      ]},
      { h: 'A rough guide to where the line sits', p: [
        'Early thirties to mid-forties, with good skin elasticity and volume loss as the main change: non-surgical treatment usually delivers genuinely good value.',
        'Mid-forties onward, with jowling, a softening jawline, and skin that does not spring back when pinched: you are looking at descent. Non-surgical treatment can still improve skin quality and support the result, but it will not produce a lift.',
        'A practical self-test: look in a mirror lying down, or tilt your head back. If the thing that bothers you largely disappears, it is descent, and gravity is the cause. Filler will not reproduce what lying down did.'
      ]},
      { h: 'The cost arithmetic people rarely do', p: [
        'Filler needs maintaining. A meaningful facial filler plan repeated every twelve to eighteen months, sustained over a decade, frequently costs more in total than a single facelift — and the facelift addresses a problem the filler was never going to address.',
        'That is not an argument for surgery. It is an argument for being clear about which problem you are solving, so the money goes somewhere it can work.'
      ]},
      { h: 'What non-surgical treatment is genuinely excellent at', p: [
        'It is easy to read this as dismissive of injectables. It is not. Well-planned non-surgical treatment is outstanding for restoring temple and midface volume in the right candidate, for softening expression lines, for improving skin quality and hydration, for jawline and chin definition, and for camouflaging a nasal hump without surgery.',
        'It is also reversible, which surgery is not. Hyaluronic acid filler can be dissolved. That safety margin has real value, particularly for a first treatment.'
      ]},
      { h: 'The question worth asking at consultation', p: [
        'Ask this: "Is what bothers me volume loss, or is it descent?" A practitioner who can explain which, and show you on your own face, is thinking about anatomy. One who answers by naming a product is thinking about a sale.',
        'And be wary of any plan that only ever recommends what the clinic happens to offer. The value of a practice that does both surgery and non-surgical work is precisely that it has no reason to push you toward either.'
      ]}
    ]
  },

  {
    slug: 'bbl-safety-what-to-ask',
    title: 'BBL Safety: What Changed, and What to Ask Your Surgeon',
    seoTitle: 'BBL Safety: What to Ask Your Surgeon',
    excerpt: 'The Brazilian butt lift once carried the highest mortality rate in cosmetic surgery. The technique that fixed it is specific, and worth asking about by name.',
    category: 'Safety',
    image: 'blog-6.jpg',
    imageAlt: 'Quiet, minimal interior with natural light',
    date: '2026-03-19',
    readTime: 7,
    author: AUTHOR,
    keywords: 'BBL safety, Brazilian butt lift risk, ultrasound guided BBL, fat embolism, buttock augmentation India',
    body: [
      { p: [
        'This is an uncomfortable subject and it is better handled directly than avoided. The Brazilian butt lift has a documented safety history that every prospective patient deserves to understand before consenting.'
      ]},
      { h: 'What the risk actually was', p: [
        'The danger is macroscopic fat embolism. The gluteal region contains large veins running through and beneath the gluteus maximus muscle. If a cannula enters that muscle while fat is being injected under pressure, fat can be forced directly into an open vein, travel to the heart and lungs, and cause a fatal embolism — sometimes on the operating table.',
        'Surveys in the mid-2010s put mortality at roughly 1 in 3,000 procedures. That made it, by a wide margin, the most dangerous elective cosmetic operation being performed.'
      ]},
      { h: 'What changed', p: [
        'The mechanism turned out to be specific and largely avoidable. Multi-society task forces converged on a clear set of recommendations:',
      ], list: [
        'Fat is placed only in the subcutaneous layer — above the muscle, never within or beneath it',
        'The cannula is kept angled away from deep structures and never aimed downward into the muscle',
        'Larger-bore, blunt cannulas are used, which are far less likely to enter a vessel',
        'Injection happens on the withdrawal stroke, at low pressure',
        'Real-time ultrasound is used to confirm the cannula\'s depth throughout the procedure'
      ], after: [
        'Where these are followed — particularly ultrasound guidance — reported mortality has fallen dramatically. Studies of ultrasound-guided subcutaneous-only technique have reported no deaths across large series. The risk is not zero, but it is now in the range of other major body contouring surgery rather than an outlier.'
      ]},
      { h: 'The questions to ask, verbatim', list: [
        '"Do you inject only in the subcutaneous plane, above the muscle?" — the answer must be an unqualified yes',
        '"Do you use intraoperative ultrasound to confirm cannula position?"',
        '"How much fat are you planning to transfer, and is my donor supply enough for that?"',
        '"What is your complication rate, and have you had a fat embolism?"',
        '"Who is the anaesthetist, and what monitoring is in place?"',
        '"What happens if I do not have enough donor fat — what would you recommend instead?"'
      ]},
      { h: 'On donor fat and expectations', p: [
        'Not everyone is a candidate. A BBL is limited by how much fat can be safely harvested, and slimmer patients simply do not have the reserves for a large change. Over-harvesting to reach a target creates contour irregularities at the donor site that are difficult to correct.',
        'Roughly 30–40% of transferred fat does not survive, which is expected and accounted for in planning — but it means the result at three months is smaller than the result on day one. Any surgeon who guarantees a specific final volume is guessing.',
        'If your goals genuinely require more volume than your body can supply, implants are the honest alternative, with their own quite different risk profile. A surgeon who tells you that rather than proceeding anyway is the one to trust.'
      ]},
      { h: 'Recovery is genuinely demanding', p: [
        'This is not a procedure with a light recovery. Expect no direct sitting on the buttocks for two to three weeks, then a cushion for several weeks after; compression garments; limited sleeping positions; and two to three weeks off work minimum.',
        'Pressure on grafted fat in the early weeks reduces how much of it survives — so the positioning restrictions are not comfort advice, they directly determine your result.'
      ]},
      { h: 'The bottom line', p: [
        'A BBL performed with subcutaneous-only placement and ultrasound guidance, by a properly qualified surgeon in an accredited theatre, is a reasonable operation with manageable risk. The same operation performed without those safeguards is not.',
        'You are entitled to ask these questions directly and to receive specific answers. A surgeon who is doing this properly will be glad you asked.'
      ]}
    ]
  }
];

module.exports = { BLOG, AUTHOR };

