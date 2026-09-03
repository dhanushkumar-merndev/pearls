/* =========================================================
   Pearl Aesthetic & Wellness — site content
   Single source of truth for the 16 procedure categories.
   Edit here, then run:  node build/generate.js
   ========================================================= */

const CLINIC = {
  name: 'Pearl Aesthetic & Wellness',
  shortName: 'Pearl Aesthetic',
  tagline: 'Where Science Meets Artistry',
  surgeon: 'Dr. Praveen Chandra K',
  surgeonReg: 'KMC Reg. No. 74573',
  phoneDisplay: '+91 79008 02060',
  phoneRaw: '+917900802060',
  whatsapp: '917900802060',
  email: 'info@pearlaesthetic.in',
  addressLine1: '#755, K.P. Aspire, 1st Floor',
  addressLine2: '80ft Road, 4th Block, Koramangala',
  addressLine3: 'Bengaluru, Karnataka 560034',
  hours: 'Mon – Sun · 10:00 am – 8:00 pm',
  mapsUrl: 'https://maps.app.goo.gl/dRnyZZ2ZxAvV4HAy7',
  /* Google Business Profile listing name. The embedded map is queried by this,
     not by the street address — the address alone geocodes the building and
     pins "K.P.Aspire" instead of the clinic. */
  mapsQuery: 'Pearl Aesthetic & Wellness clinic, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034',
  /* Taken from the Business Profile listing that mapsUrl resolves to. These
     must match the GBP pin — a schema geo that disagrees with the profile
     undercuts the local signal it is meant to reinforce. */
  lat: 12.9324785,
  lng: 77.6314766,
  /* Social profiles. `instagram` is the clinic account used in the site-wide
     social rows; the surgeon keeps a separate personal practice account
     (`instagramDoctor`), linked only from the surgeon page so the two are
     not confused for one another. */
  facebook: 'https://www.facebook.com/PearlAestheticBengaluru',
  instagram: 'https://www.instagram.com/pearl_aesthetic_clinic/',
  instagramDoctor: 'https://www.instagram.com/drpraveenklinik/',
  youtube: 'https://www.youtube.com/@Pearl_Aesthetic_Clinic'
};

/* Stroke icons (24×24, currentColor) */
const ICONS = {
  laser:   '<path d="M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"/><circle cx="12" cy="12" r="2.5"/>',
  syringe: '<path d="m18 2 4 4M17 7 7 17M15 5l4 4M9 11l4 4M11.5 8.5 15 12M3 21l3-3M6 14l4 4"/>',
  scalpel: '<path d="M20 4 8.5 15.5 4 20l2-6.5L17.5 2z"/><path d="M12 12 4 20"/>',
  nose:    '<path d="M12 3v6c0 2-2 3-2 5a3 3 0 0 0 3 3h1"/><path d="M8 17c-2.5 0-4-1.5-4-4 0-3 2-5 4-8"/><path d="M16 21h2a3 3 0 0 0 3-3c0-3-2-6-4-9"/>',
  eye:     '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  face:    '<circle cx="12" cy="12" r="9"/><path d="M8.5 9.5h.01M15.5 9.5h.01M8 14.5a5 5 0 0 0 8 0"/>',
  ear:     '<path d="M6 8a6 6 0 1 1 12 0c0 3-2 4-3.5 5.5S13 16 13 18a3 3 0 0 1-6 0"/><path d="M10 8a2 2 0 1 1 4 0c0 1.5-1.5 2-1.5 3.5"/>',
  breast:  '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  body:    '<circle cx="12" cy="4" r="2"/><path d="M12 6v7M12 13l-3.5 8M12 13l3.5 8M6.5 9.5 12 8l5.5 1.5"/>',
  buttock: '<path d="M4 6c0 5 1 8 4 8s4-2 4-2 1 2 4 2 4-3 4-8"/><path d="M4 6c0-2 2-3 4-3s4 1 4 3c0-2 2-3 4-3s4 1 4 3"/><path d="M8 14v5M16 14v5"/>',
  venus:   '<circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/>',
  mommy:   '<path d="M12 21s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5C19 16.6 12 21 12 21z"/><circle cx="17" cy="5" r="2"/>',
  weight:  '<path d="M3 20h18"/><path d="M6 20V9l6-5 6 5v11"/><path d="M9 20v-5h6v5"/><path d="m14 8-2 2-2-2"/>',
  mars:    '<circle cx="10" cy="14" r="6"/><path d="M15 9l6-6M16 3h5v5"/>',
  gender:  '<circle cx="12" cy="13" r="5"/><path d="M15.5 9.5 20 5M16 5h4v4M8.5 9.5 4 5M8 5H4v4M12 18v4M10 20h4"/>',
  hair:    '<path d="M4 15a8 8 0 0 1 16 0"/><path d="M7 15c0-4 1-7 3-9M12 15c0-5 .5-8 1-9M17 15c0-3-1-6-2.5-8"/><path d="M4 15v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"/>'
};

const CATEGORIES = [
  /* ==================== 1 ==================== */

  {
    slug: 'nose-surgery',
    name: 'Nose Surgery',
    icon: 'nose',
    tagline: 'Rhinoplasty and functional nasal surgery, cosmetic and reconstructive.',
    tags: ['Rhinoplasty', 'Septoplasty', 'Revision'],
    intro: [
      'Rhinoplasty is the most technically unforgiving procedure in facial surgery. The nose sits at the centre of the face, millimetres are visible, and the final shape continues to settle for twelve to eighteen months. It is also the operation where surgeon selection matters most — revision rates in unselected hands run high.',
      'We plan every nose against your facial proportions rather than a reference photograph, and preserve ethnic character by default. Where breathing is affected, functional correction is addressed in the same operation — a nose that looks right but does not work is a failed result.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '2 – 4 hours'],
      ['Downtime', '7 – 14 days'],
      ['Final result', '12 – 18 months']
    ],
    groups: [
      {
        name: 'Cosmetic Rhinoplasty',
        services: [
          ['Rhinoplasty (Nose Job)', 'Reshapes the bridge, tip and nostrils to bring the nose into proportion with the face.'],
          ['Tip Rhinoplasty (Tip Plasty)', 'Refines a bulbous, drooping or poorly defined tip without altering the bridge.'],
          ['Alar Base Reduction', 'Narrows wide nostrils and reduces flare through concealed base incisions.'],
          ['Ethnic Rhinoplasty', 'Refinement that respects and preserves the characteristics of your ethnic anatomy.'],
          ['Ultrasonic Rhinoplasty', 'Piezo instruments reshape bone precisely with less bruising than traditional osteotomy.'],
          ['Preservation Rhinoplasty', 'Retains rather than removes the natural dorsal structure, lowering it as an intact unit.'],
          ['Male Rhinoplasty', 'Maintains a stronger dorsum and less tip rotation appropriate to masculine proportions.']
        ]
      },
      {
        name: 'Functional Nasal Surgery',
        services: [
          ['Septoplasty', 'Straightens a deviated septum to restore clear airflow through both nostrils.'],
          ['Turbinate Reduction', 'Reduces enlarged turbinates that block the airway, often alongside septoplasty.'],
          ['Septorhinoplasty', 'Combines cosmetic reshaping with functional airway correction in one operation.']
        ]
      },
      {
        name: 'Revision & Non-Surgical',
        services: [
          ['Revision Rhinoplasty', 'Corrective surgery after an unsatisfactory or failed previous rhinoplasty.'],
          ['Nose Thread Lift', 'Absorbable threads to lift and define the tip and bridge without surgery.'],
          ['Non-Surgical Rhinoplasty', 'Uses injectable filler to make limited contour adjustments without an operation.'],
          ['Laser Snoring Treatment (NightLase)', 'Non-surgical laser treatment intended to tighten selected throat tissues for snoring concerns.'],
          ['Rhinophyma Surgery', 'Reshapes thickened nasal tissue caused by advanced rhinophyma.'],
          ['Nose Surgery FAQs', 'Answers on recovery, swelling timelines, splints, cost factors and candidacy.']
        ]
      }
    ]
  },


  /* ==================== 2 ==================== */

  {
    slug: 'breast-surgery',
    name: 'Breast Surgery',
    icon: 'breast',
    tagline: 'Augmentation, lift, reduction, revision and corrective breast surgery.',
    tags: ['Augmentation', 'Breast Lift', 'Reduction'],
    intro: [
      'Breast surgery covers a wider range than most people expect: increasing volume, restoring position, reducing weight, correcting asymmetry or developmental differences, and dealing with implants placed years ago that now need attention. Getting the right operation matters more than the technique used to perform it.',
      'The most common planning error is treating sagging as a volume problem. An implant in a breast that has descended adds weight without changing position, and often makes the result worse. Where the nipple sits below the inframammary fold, a lift — with or without an implant — is the honest answer.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '1.5 – 4 hours'],
      ['Downtime', '1 – 2 weeks'],
      ['Support bra', '6 weeks']
    ],
    groups: [
      {
        name: 'Breast Augmentation',
        services: [
          ['Breast Augmentation with Implants', 'Increases size and improves shape using implants selected to your chest measurements.'],
          ['Mini Breast Augmentation', 'A modest, deliberately understated increase for a natural result.'],
          ['Breast Implant Options', 'Round versus anatomical, smooth versus textured, and how projection is chosen.'],
          ['Fat Transfer Breast Augmentation', 'Uses your own liposuctioned fat for a modest, implant-free increase.'],
          ['Hybrid Breast Augmentation', 'Combines an implant for volume with fat grafting to soften the upper pole.']
        ]
      },
      {
        name: 'Implant Revision & Removal',
        services: [
          ['Breast Implant Check', 'Clinical and imaging assessment of implant integrity, position and capsule.'],
          ['Breast Implant Removal (Explant)', 'Removal of implants, with capsulectomy where clinically indicated.'],
          ['Implant Removal with Breast Lift', 'Explant combined with mastopexy to reshape the breast in one stage.'],
          ['Breast Implant Replacement', 'Exchange of ageing or ruptured implants for a new size or profile.'],
          ['Breast Implant Revision', 'Corrects capsular contracture, malposition, rippling or unsatisfactory shape.']
        ]
      },
      {
        name: 'Breast Lift & Reduction',
        services: [
          ['Breast Lift (Mastopexy)', 'Raises and reshapes descended breast tissue and repositions the nipple.'],
          ['Breast Lift with Implants', 'Combines lift with an implant where both position and volume need addressing.'],
          ['Breast Lift with Auto-Augmentation', 'Reshapes your own tissue to restore upper pole fullness without an implant.'],
          ['Mini Breast Lift (Doughnut Mastopexy)', 'Limited peri-areolar lift for mild descent with minimal scarring.'],
          ['Breast Reduction', 'Removes excess tissue to relieve back, neck and shoulder strain and reshape the breast.'],
          ['Liposuction Breast Reduction', 'Volume reduction by liposuction alone in selected patients with good skin quality.']
        ]
      },
      {
        name: 'Nipple, Areola & Corrective',
        services: [
          ['Inverted Nipple Correction', 'Releases the tethering ducts to restore normal nipple projection.'],
          ['Nipple Reduction', 'Reduces nipple length or width under local anaesthetic.'],
          ['Areola Reduction', 'Reduces enlarged or stretched areolae to a proportionate size.'],
          ['Breast Asymmetry Correction', 'Balances differences in size, shape or position between the two breasts.'],
          ['Tuberous Breast Correction', 'Releases the constricting base and reshapes tuberous or constricted breasts.'],
          ['Male Breast Reduction', 'Reduces excess chest tissue and skin to create a flatter masculine contour.'],
          ['Gynecomastia Surgery', 'Removes glandular breast tissue and fat in male chest enlargement.']
        ]
      }
    ]
  },


  /* ==================== 3 ==================== */

  {
    slug: 'mommy-makeover',
    name: 'Mommy Makeover',
    icon: 'mommy',
    tagline: 'Combined restoration of the breast, abdomen and intimate area.',
    tags: ['Combined Surgery', 'Breast & Tummy', 'Post-Pregnancy'],
    intro: [
      'Pregnancy changes several structures at once — breast volume and position, abdominal muscle separation, skin laxity, and often the pelvic floor. Treating them individually means several separate recoveries. A combined procedure addresses them under one anaesthetic, with one recovery period.',
      'Timing matters more than technique here. We ask that you are finished having children, at a stable weight for at least six months, and no longer breastfeeding for at least three to six months. Operating earlier produces results that a subsequent pregnancy will undo.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '4 – 7 hours'],
      ['Hospital stay', '1 – 2 nights'],
      ['Downtime', '3 – 6 weeks']
    ],
    groups: [
      {
        name: 'The Combination',
        services: [
          ['Mommy Makeover', 'A single planned operation combining breast, abdominal and intimate restoration.'],
          ['Breast Lift or Augmentation', 'Restores position and, where wanted, volume lost after breastfeeding.'],
          ['Breast Augmentation with Implants', 'Restores breast volume with implants selected for the patient’s measurements and goals.'],
          ['Breast Lift (Mastopexy)', 'Reshapes and lifts descended breast tissue after pregnancy or weight change.'],
          ['Breast Lift with Implants', 'Combines breast lifting with added volume where both position and fullness need attention.'],
          ['Tummy Tuck with Muscle Repair', 'Closes abdominal muscle separation and removes the resulting skin excess.'],
          ['Tummy Tuck (Abdominoplasty)', 'Removes loose abdominal skin and can repair muscle separation.'],
          ['Brazilian Tummy Tuck (Lipoabdominoplasty)', 'Pairs abdominal contouring with tummy tuck surgery in selected patients.'],
          ['Mini Tummy Tuck', 'Treats lower-abdominal skin laxity below the navel with a shorter scar.'],
          ['Liposuction', 'Contours localised fat deposits that do not respond to diet and exercise.'],
          ['Stomach Liposuction (Tummy Lipo)', 'Targets the upper and lower abdomen and flanks.'],
          ['360 Liposuction', 'Contours the abdomen, waist and back circumferentially.'],
          ['C-Section Scar Revision', 'Improves a tethered, uneven or uncomfortable caesarean scar.'],
          ['Labiaplasty (Labia Reduction)', 'Reshapes enlarged labia where there is discomfort or a functional concern.'],
          ['Vaginoplasty (Vaginal Tightening Surgery)', 'Surgically repairs and tightens selected vaginal support structures.'],
          ['Non-Surgical Vaginal Tightening', 'Energy-based treatment option for appropriate concerns without an operation.'],
          ['Vaginal Laser Treatment', 'Laser-based intimate treatment assessed according to individual symptoms and suitability.'],
          ['Brazilian Butt Lift (BBL Surgery)', 'Transfers the patient’s own fat to improve buttock shape in selected candidates.'],
          ['Mons Lift (Monsplasty)', 'Reduces and lifts excess tissue over the pubic mound.'],
          ['Mommy Makeover FAQs', 'Timing after childbirth, combining safely, recovery with children at home, and cost factors.']
        ]
      }
    ]
  },


  /* ==================== 4 ==================== */

  {
    slug: 'face-surgery',
    name: 'Face Surgery',
    icon: 'face',
    tagline: 'Facelifting, neck contouring and facial feature refinement.',
    tags: ['Deep Plane Facelift', 'Neck Lift', 'Buccal Fat'],
    intro: [
      'A modern facelift is not skin tightening. Pulling skin produces the swept, operated look everyone recognises and fears; it also relapses quickly because skin is not a load-bearing tissue. Contemporary technique works on the SMAS layer beneath — repositioning it so the skin is redraped without tension.',
      'Face and neck are assessed together. In most patients over forty-five, the neck is the giveaway, and a facelift that ignores it delivers a result that reads as incomplete from every angle except straight on.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '3 – 6 hours'],
      ['Downtime', '2 – 3 weeks'],
      ['Results last', '8 – 12 years']
    ],
    groups: [
      {
        name: 'Facelift Procedures',
        services: [
          ['Facelift (Rhytidectomy)', 'Comprehensive lift of the lower face and jawline through the SMAS layer.'],
          ['SMAS Facelift', 'Repositions the deeper muscular layer for durable lift without skin tension.'],
          ['Deep Plane Facelift', 'Releases the retaining ligaments to lift the midface as a single composite unit.'],
          ['Upper Facelift (Forehead Lift)', 'Addresses brow descent and forehead laxity in the upper third.'],
          ['Mid-Facelift (Cheek Lift)', 'Restores cheek height and softens the nasolabial region.'],
          ['Lower Facelift (Jowl Lift)', 'Focused correction of jowling and loss of jawline definition.'],
          ['Mini Facelift', 'Shorter-scar lift for earlier laxity, with a faster return to normal activity.'],
          ['One-Stitch Facelift', 'Minimal-access lift for very early jawline softening.'],
          ['Male Facelift', 'Accounts for beard-bearing skin, thicker tissue and masculine hairline placement.']
        ]
      },
      {
        name: 'Neck & Jawline',
        services: [
          ['Neck Lift', 'Tightens platysma banding and removes excess skin to redefine the neckline.'],
          ['Mini Neck Lift', 'Limited-incision correction for early submental laxity.'],
          ['Male Neck Lift', 'Neck definition for men, working around beard growth and heavier skin.'],
          ['Chin & Neck Liposuction', 'Removes the submental fat pad in patients with good skin elasticity.'],
          ['FaceTite', 'Radiofrequency-assisted contraction under the skin for lift without a long scar.']
        ]
      },
      {
        name: 'Facial Features',
        services: [
          ['Facial Fat Transfer', 'Uses your own purified fat to restore volume in the temples, cheeks and around the mouth.'],
          ['Micro & Nano Fat Grafting', 'Uses refined fat grafts for small-volume facial contour and skin-quality concerns.'],
          ['AccuTite', 'Radiofrequency-assisted contouring for small facial areas in suitable patients.'],
          ['Lip Lift', 'Shortens a long upper lip to increase pink show and reveal more upper teeth.'],
          ['Lip Reduction Surgery', 'Reduces excessive lip bulk to rebalance the lower face.'],
          ['Buccal Fat Removal', 'Removes deep cheek fat pads to sharpen the cheek hollow — used selectively.'],
          ['Dimple Creation', 'Creates a natural-looking cheek dimple through a small intraoral incision.'],
          ['Chin Surgery (Genioplasty)', 'Repositions the chin bone to correct projection and facial profile balance.'],
          ['Chin Augmentation', 'Increases chin projection using an implant or bony advancement.'],
          ['Chin Reduction', 'Reduces an over-projected or long chin for better proportion.'],
          ['Male Chin Surgery', 'Builds width and projection appropriate to a masculine lower face.']
        ]
      }
    ]
  },


  /* ==================== 5 ==================== */

  {
    slug: 'body-surgery',
    name: 'Body Surgery',
    icon: 'body',
    tagline: 'Liposuction, abdominoplasty, implants and body contouring.',
    tags: ['Liposuction', 'Tummy Tuck', '360 Lipo'],
    intro: [
      'Liposuction is a contouring operation, not a weight loss operation. It removes localised fat deposits that have not responded to diet and training, and it works best in patients already close to a stable weight with reasonable skin quality. Where skin has lost elasticity, removing the fat beneath it will make laxity more obvious, not less.',
      'That distinction is why abdominoplasty exists. If the abdominal wall muscles have separated after pregnancy or significant weight change, no amount of liposuction will flatten the abdomen — the repair has to address the muscle layer and the excess skin together.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '1 – 5 hours'],
      ['Downtime', '1 – 3 weeks'],
      ['Compression', '6 – 8 weeks']
    ],
    groups: [
      {
        name: 'Liposuction & Fat Contouring',
        services: [
          ['Liposuction', 'Removes stubborn localised fat deposits to reshape the body contour.'],
          ['Stomach Liposuction', 'Targeted contouring of the upper and lower abdomen and flanks.'],
          ['360 Liposuction', 'Circumferential contouring of the abdomen, flanks and back in one procedure.'],
          ['Micro Liposuction (MicroLipo)', 'Fine-cannula technique for small, delicate areas under local anaesthetic.'],
          ['High Definition Liposuction', 'Selective fat removal that reveals the underlying muscular anatomy.'],
          ['Abdominal Etching', 'Sculpts definition along the linea alba and tendinous inscriptions.'],
          ['Male Liposuction', 'Contouring adapted to male fat distribution across the chest, flanks and abdomen.'],
          ['BodyTite', 'Radiofrequency-assisted liposuction that contracts skin as fat is removed.'],
          ['Cellulite Treatment', 'Combined release and resurfacing approach to dimpling on the thighs and buttocks.']
        ]
      },
      {
        name: 'Abdominoplasty',
        services: [
          ['Tummy Tuck (Abdominoplasty)', 'Removes excess skin and repairs separated abdominal muscles.'],
          ['Brazilian Tummy Tuck', 'Combines abdominoplasty with aggressive contouring for a more defined waist.'],
          ['Mini Tummy Tuck', 'Addresses skin below the navel only, with a shorter scar and faster recovery.'],
          ['Male Tummy Tuck', 'Abdominal skin and muscle correction contoured to a masculine torso.'],
          ['Umbilicoplasty', 'Reshapes the belly button, or repairs it after hernia or pregnancy changes.'],
          ['Mons Lift (Monsplasty)', 'Reduces and lifts a heavy or descended pubic mound.'],
          ['C-Section Scar Revision', 'Revises a shelved, adherent or poorly positioned caesarean scar.']
        ]
      },
      {
        name: 'Implants & Grafting',
        services: [
          ['Body Contouring Procedures', 'Combination planning across multiple areas in staged or single operations.'],
          ['Mommy Makeover', 'Combines selected breast, abdominal and body-contouring procedures after pregnancy.'],
          ['Fat Transfer (Fat Grafting)', 'Harvests, purifies and re-injects your own fat to add volume where it is wanted.'],
          ['Pectoral Implants', 'Silicone implants to build chest projection where training has plateaued.'],
          ['Chest Wall Implants', 'Custom implants to correct pectus deformity and chest wall asymmetry.'],
          ['Calf Augmentation with Implants', 'Improves lower leg proportion using implants placed beneath the fascia.'],
          ['Fat Transfer Calf Augmentation', 'Uses grafted fat for a softer, more natural calf enhancement.']
        ]
      }
    ]
  },


  /* ==================== 6 ==================== */

  {
    slug: 'buttock-contouring',
    name: 'Buttock Contouring',
    icon: 'buttock',
    tagline: 'Brazilian butt lift, implants and non-surgical shaping.',
    tags: ['BBL', 'Buttock Implants', 'Skinny BBL'],
    intro: [
      'The Brazilian butt lift has a safety history that deserves stating plainly. Fat injected into or beneath the gluteal muscle can enter the venous system and cause fatal embolism — historically the highest mortality rate of any cosmetic procedure. That risk is substantially reduced, though not eliminated, by strictly subcutaneous placement and ultrasound guidance.',
      'We perform BBL only above the muscle, with ultrasound confirmation of cannula position, and we decline patients who do not have adequate donor fat rather than over-harvesting. If your expectations require more volume than your body can safely supply, implants are the honest alternative and we will say so.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '2 – 4 hours'],
      ['Downtime', '2 – 3 weeks'],
      ['No sitting', '2 – 3 weeks']
    ],
    groups: [
      {
        name: 'Brazilian Butt Lift',
        services: [
          ['Brazilian Butt Lift (BBL)', 'Transfers your own liposuctioned fat to reshape and project the buttocks.'],
          ['Ultrasound Guided BBL', 'Real-time ultrasound confirms subcutaneous cannula position throughout injection.'],
          ['Skinny BBL', 'Maximises contour for slimmer patients with limited donor fat available.'],
          ['Mini BBL', 'A deliberately subtle increase focused on shape correction rather than volume.'],
          ['360 Lipo and BBL', 'Circumferential liposuction paired with grafting for a full waist-to-hip change.'],
          ['Revision BBL', 'Corrects asymmetry, contour irregularity or volume loss after a previous BBL.'],
          ['Male BBL', 'Gluteal shaping planned around masculine proportions and muscle definition.'],
          ['BBL Recovery Guide', 'Week-by-week guidance on positioning, compression, sitting and return to activity.'],
          ['Brazilian Butt Lift FAQs', 'Safety, fat survival rates, donor site requirements, longevity and candidacy.'],
          ['BBL Before & After', 'Representative results with an explanation of what is realistic for each body type.']
        ]
      },
      {
        name: 'Implants & Non-Surgical',
        services: [
          ['Buttock Implants', 'Silicone implants for patients without sufficient donor fat for grafting.'],
          ['Butt Implant Removal', 'Removal of existing implants, with fat grafting to restore contour if wanted.'],
          ['Butt Implants vs BBL', 'A direct comparison of longevity, risk, recovery and the results each can deliver.'],
          ['Non-Surgical Butt Lift (HyaCorp)', 'Body filler for modest shaping with no surgery and no downtime.']
        ]
      }
    ]
  },


  /* ==================== 7 ==================== */

  {
    slug: 'cosmetic-gynaecology',
    name: 'Cosmetic Gynaecology',
    icon: 'venus',
    tagline: 'Surgical, laser and injectable intimate health treatments.',
    tags: ['Labiaplasty', 'Vaginoplasty', 'IntimaLase'],
    intro: [
      'Intimate concerns are consistently under-discussed and over-suffered. Discomfort during exercise or intercourse, stress incontinence after childbirth, laxity, dryness after menopause — these are common, treatable, and rarely raised in a general consultation because patients assume they have to live with them.',
      'Consultations are private, unhurried and led by clinical need rather than appearance. A significant proportion of women who come in expecting to need surgery are better served by laser or conservative treatment, and we will tell you that.'
    ],
    meta: [
      ['Anaesthetic', 'Local or general'],
      ['Procedure time', '30 – 120 minutes'],
      ['Downtime', '2 days – 2 weeks'],
      ['Full recovery', '4 – 6 weeks']
    ],
    groups: [
      {
        name: 'Labial Surgery',
        services: [
          ['Labiaplasty (Labia Reduction)', 'Reduces and reshapes enlarged labia minora causing discomfort or self-consciousness.'],
          ['Clitoral Hood Reduction', 'Reduces excess hood tissue, often performed alongside labiaplasty for balance.'],
          ['Labiaplasty Revision', 'Corrects over-resection, asymmetry or scarring from previous labial surgery.'],
          ['Labia Puffing (Labial Puff)', 'Filler or fat grafting to restore fullness to deflated labia majora.'],
          ['Labiaplasty FAQs', 'Techniques, healing, sensation, scarring and return to exercise and intimacy.']
        ]
      },
      {
        name: 'Vaginal & Pelvic Surgery',
        services: [
          ['Vaginoplasty (Vaginal Tightening)', 'Surgically tightens the vaginal canal and repairs the supporting muscle layer.'],
          ['Perineoplasty', 'Repairs and reconstructs the perineal body after childbirth injury or scarring.'],
          ['Pelvic Floor Repair', 'Surgical correction of pelvic floor weakness and associated prolapse.'],
          ['Vaginal Rejuvenation', 'Combined approach to laxity, tone and tissue quality, surgical or non-surgical.']
        ]
      },
      {
        name: 'Fotona Laser Treatments',
        services: [
          ['IntimaLase Vaginal Tightening', 'Non-surgical laser tightening of the vaginal canal over two to three sessions.'],
          ['IncontiLase Urinary Incontinence', 'Laser treatment for mild to moderate stress incontinence without surgery.'],
          ['ProlapLase Pelvic Prolapse', 'Non-surgical laser support for early-stage vaginal wall prolapse.'],
          ['RenovaLase Vaginal Dryness', 'Restores mucosal thickness and lubrication, particularly after menopause.'],
          ['Non-Surgical Vaginal Tightening', 'Energy-based tightening for women who prefer to avoid an operation.'],
          ['Vaginal Laser Treatment', 'Laser treatment option assessed for individual intimate-health concerns.'],
          ['Laser Intimate Whitening', 'Laser treatment for external intimate-area pigmentation, after suitability assessment.']
        ]
      },
      {
        name: 'Injectable Treatments',
        services: [
          ['O-Shot Injection', 'Platelet-rich plasma injection intended to improve sensitivity and mild incontinence.'],
          ['G-Spot Injection (G-Shot)', 'Filler placement to temporarily augment the anterior vaginal wall.'],
          ['Mons Lift (Monsplasty)', 'Reduces or lifts excess tissue over the pubic mound.']
        ]
      }
    ]
  },


  /* ==================== 8 ==================== */

  {
    slug: 'male-surgery',
    name: 'Male Surgery',
    icon: 'mars',
    tagline: 'Procedures planned specifically around masculine anatomy.',
    tags: ['Gynecomastia', 'HD Lipo', 'Male Rhinoplasty'],
    intro: [
      'Men now make up a substantial and growing share of aesthetic surgery, and they are not simply smaller or larger versions of female patients. Skin is thicker and more vascular, fat distributes differently, beard-bearing skin changes where incisions can sit, and the aesthetic target is almost always definition and angularity rather than softening.',
      'Gynecomastia is the most requested male procedure here and the most commonly mismanaged elsewhere. It is glandular tissue as well as fat — liposuction alone leaves the firm disc behind the nipple untouched, which is why so many men present having had a procedure that did not resolve the problem.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '1 – 4 hours'],
      ['Downtime', '1 – 2 weeks'],
      ['Compression vest', '4 – 6 weeks']
    ],
    groups: [
      {
        name: 'Chest & Torso',
        services: [
          ['Gynecomastia Surgery', 'Removes glandular tissue and fat to restore a flat, masculine chest contour.'],
          ['Male Breast Reduction', 'Reduction and skin tightening where enlargement is more substantial.'],
          ['Pectoral Implants', 'Adds chest projection where training alone has not produced the wanted shape.'],
          ['Chest Wall Implants', 'Customised implant options for selected chest-wall contour concerns.'],
          ['Calf Augmentation with Implants', 'Adds lower-leg volume and definition using implants in selected patients.'],
          ['Fat Transfer Calf Augmentation', 'Uses the patient’s own fat to add lower-leg volume in suitable candidates.'],
          ['Male Liposuction', 'Contouring of the flanks, chest and abdomen adapted to male fat distribution.'],
          ['High Definition Liposuction', 'Reveals underlying musculature through selective, layered fat removal.'],
          ['Abdominal Etching', 'Sculpts visible abdominal definition in already-lean patients.'],
          ['Male Tummy Tuck', 'Skin and muscle correction planned around a masculine waistline.']
        ]
      },
      {
        name: 'Face & Head',
        services: [
          ['Male Rhinoplasty', 'Maintains a stronger dorsal line and less tip rotation than female rhinoplasty.'],
          ['Male Eyelid Surgery', 'Conservative upper lid correction that avoids raising or feminising the brow.'],
          ['Male Facelift', 'Accounts for thicker skin, beard growth and masculine hairline placement.'],
          ['Male Neck Lift', 'Restores jaw and neck definition without disturbing beard-bearing skin.'],
          ['Male Chin Surgery', 'Builds chin width and projection for a stronger lower facial third.'],
          ['Laser Snoring Treatment (NightLase)', 'Non-surgical laser treatment intended to tighten selected throat tissues for snoring concerns.'],
          ['Rhinophyma Surgery', 'Reshapes thickened nasal tissue caused by rhinophyma.']
        ]
      },
      {
        name: 'Body & Contouring',
        services: [
          ['Male BBL', 'Gluteal shaping proportioned to a masculine frame rather than an hourglass.'],
          ['Male Body Lift', 'Post-weight-loss skin removal planned for male torso proportions.']
        ]
      }
    ]
  },


  /* ==================== 9 ==================== */

  {
    slug: 'laser-dermatology',
    name: 'Laser Dermatology',
    icon: 'laser',
    tagline: 'Fotona-powered treatments for skin, vessels, pigment and lesions.',
    tags: ['Fotona 4D', 'Pigmentation', 'Vascular Lesions'],
    intro: [
      'Our laser suite is built around the Fotona Er:YAG and Nd:YAG platform — a dual-wavelength system that lets us treat the skin surface and the deeper dermal layers in a single session. That range is what makes it possible to address acne, rosacea, pigmentation, thread veins, scarring and skin laxity without moving a patient between multiple devices.',
      'Every laser plan begins with a skin assessment. Indian and South Asian skin types carry a higher risk of post-inflammatory hyperpigmentation, so settings, cooling and session spacing are calibrated to your Fitzpatrick type rather than applied from a fixed protocol.'
    ],
    meta: [
      ['Anaesthetic', 'Topical numbing'],
      ['Session time', '20 – 60 minutes'],
      ['Downtime', 'None to 3 days'],
      ['Sessions', 'Typically 3 – 6']
    ],
    groups: [
      {
        name: 'Fotona Signature Treatments',
        services: [
          ['Fotona 4D Laser Facelift', 'Four-stage non-surgical lift working intraorally and externally to tighten, resurface and rebuild collagen.'],
          ['SmoothEye Laser Treatment', 'Gentle periorbital tightening for crepey eyelid skin and fine lines, with no needles and no downtime.'],
          ['LipLase Lip Laser Treatment', 'Stimulates collagen in and around the lips for natural volume and definition without filler.'],
          ['Erbium Laser Skin Resurfacing', 'Precision ablative resurfacing that smooths texture, fine lines and superficial scarring.'],
          ['Laser TightSculpting', 'Combines deep heating with surface resurfacing to firm skin and reduce localised fat pockets.'],
          ['Laser Skin Tightening', 'Non-ablative dermal heating that contracts existing collagen and triggers new production.']
        ]
      },
      {
        name: 'Acne, Rosacea & Cellulite',
        services: [
          ['Laser Acne Treatment', 'Targets sebaceous gland activity and acne bacteria to calm active breakouts and reduce recurrence.'],
          ['Rosacea Laser Treatment', 'Reduces persistent facial redness, flushing and the visible vessels that drive it.'],
          ['Laser Cellulite Treatment', 'Heats the dermis and fibrous septae to soften dimpling on thighs and buttocks.']
        ]
      },
      {
        name: 'Vascular & Thread Veins',
        services: [
          ['Facial Thread Vein Removal', 'Closes fine broken capillaries across the cheeks, chin and around the nose.'],
          ['Nose Thread Vein Removal', 'Focused treatment for the clustered vessels commonly seen on and beside the nose.'],
          ['Periorbital Vein Laser Treatment', 'Treats prominent blue-green veins at the temples and around the eye socket.'],
          ['Veins Under the Eyes', 'Reduces the visible under-eye vessels that create a dark, shadowed appearance.'],
          ['Venous Lake Removal', 'Clears the soft dark-purple vascular blebs that typically form on the lower lip.'],
          ['Cherry Angioma Removal', 'Removes bright red vascular papules from the trunk and limbs in a single sitting.']
        ]
      },
      {
        name: 'Pigmentation',
        services: [
          ['Laser Pigmentation Treatment', 'Breaks down excess melanin deposits to even overall skin tone.'],
          ['Melasma Laser Treatment', 'Low-fluence protocol designed for melasma, paired with medical topicals and strict photoprotection.'],
          ['Age Spot Removal', 'Clears sun-induced lentigines on the face, hands, chest and shoulders.']
        ]
      },
      {
        name: 'Lesions & Growths',
        services: [
          ['Laser Mole Removal', 'Removes benign raised moles with minimal scarring after clinical assessment.'],
          ['Xanthelasma Removal', 'Clears the yellow cholesterol plaques that develop on the eyelids.'],
          ['Sebaceous Hyperplasia Removal', 'Flattens the small doughnut-shaped oil gland bumps common on the forehead and cheeks.'],
          ['Syringoma Removal', 'Treats clusters of small sweat-duct papules, typically beneath the eyes.'],
          ['Milia Removal', 'Extracts or ablates the firm white keratin cysts around the eyes and cheeks.'],
          ['Wart Removal', 'Ablates viral warts on the hands, face and body, including resistant lesions.'],
          ['Verruca Removal', 'Targets plantar warts on the sole of the foot where topical treatment has failed.'],
          ['Seborrhoeic Keratosis Removal', 'Removes the waxy, stuck-on brown growths that increase with age.'],
          ['Dermatosis Papulosa Nigra Removal', 'Clears the small dark papules common on deeper skin tones, using pigment-safe settings.'],
          ['Actinic Keratosis Treatment', 'Treats rough sun-damaged pre-cancerous patches before they progress.']
        ]
      },
      {
        name: 'Scars, Nails & Functional Laser',
        services: [
          ['Laser Scar Removal', 'Softens raised, discoloured and textured scarring from surgery, acne or injury.'],
          ['LineLase Stretch Mark Removal', 'Remodels collagen within striae to improve texture and reduce colour contrast.'],
          ['Laser Fungal Nail Treatment', 'Heats the nail bed to reduce fungal load without oral antifungal medication.'],
          ['NightLase Snoring Treatment', 'Tightens the soft palate over three sessions to reduce snoring intensity.'],
          ['Vaginal Laser Treatment', 'Non-surgical intimate treatment for laxity, dryness and mild stress incontinence.'],
          ['Laser Intimate Whitening', 'Evens pigmentation in intimate and underarm areas using conservative settings.']
        ]
      }
    ]
  },


  /* =================== 10 =================== */

  {
    slug: 'non-surgical-aesthetics',
    name: 'Non-Surgical Aesthetics',
    icon: 'syringe',
    tagline: 'Injectables, skin boosters and energy devices with no theatre time.',
    tags: ['Anti-Wrinkle', 'Dermal Fillers', 'Morpheus8'],
    intro: [
      'Non-surgical work is where most patients start. Done well, it is quiet: better skin quality, softened lines, restored structure where volume has been lost — without anyone being able to name what changed. Done badly, it is obvious. The difference is nearly always restraint and anatomical planning rather than product volume.',
      'All injectable treatments at Pearl are performed by a qualified medical practitioner using licensed, traceable products. We assess the whole face before treating any single area, because a line is often the symptom of a structural change somewhere else.'
    ],
    meta: [
      ['Anaesthetic', 'Topical / none'],
      ['Session time', '15 – 45 minutes'],
      ['Downtime', 'None to 48 hours'],
      ['Results last', '4 – 18 months']
    ],
    groups: [
      {
        name: 'Anti-Wrinkle Injections',
        services: [
          ['Anti-Wrinkle Injections', 'Muscle-relaxing injections that soften dynamic expression lines across the upper face.'],
          ['Frown Lines', 'Relaxes the glabellar complex to smooth the vertical "11" lines between the brows.'],
          ['Forehead Wrinkles', 'Treats horizontal forehead lines while preserving natural brow movement.'],

          ["Crow's Feet", 'Softens the fan of lines radiating from the outer eye corners.'],
          ['Bunny Lines', 'Smooths the diagonal creases across the bridge of the nose when you smile.'],
          ['Lip Flip', 'A few small units along the upper lip to roll it gently outward for more show.'],
          ['Gummy Smile', 'Reduces excessive upper gum exposure by relaxing the lip elevator muscles.'],
          ['Jaw Slimming Injections', 'Reduces masseter bulk to slim a square jawline and ease clenching.'],
          ['Anti-Sweat Injections', 'Blocks sweat gland activation in the underarms, palms or soles for several months.'],
          ['Muscle Relaxant for Migraine', 'Preventative protocol for chronic migraine following established injection mapping.']
        ]
      },
      {
        name: 'Dermal Fillers',
        services: [
          ['Dermal Fillers', 'Hyaluronic acid gels used to restore volume, support structure and refine contour.'],
          ['Facial Fillers', 'Whole-face structural assessment and placement rather than isolated single-area filling.'],
          ['Lip Fillers', 'Conservative hydration, definition or volume, matched to your existing lip proportions.'],
          ['Cheek Fillers', 'Rebuilds midface support to lift the lower face and restore youthful light reflection.'],
          ['Nasolabial Folds', 'Softens the smile lines from nose to mouth corner, usually by treating the cheek first.'],
          ['Marionette Lines', 'Supports the downward creases from mouth corner to jawline.'],
          ['Chin Fillers', 'Improves chin projection and facial profile balance without surgery.'],
          ['Jawline Fillers', 'Sharpens jawline definition and camouflages early jowling.'],
          ['Temple Filler', 'Refills temporal hollowing that creates a drawn, angular upper face.'],
          ['Tear Trough Filler', 'Carefully placed under-eye correction for hollowing — only in suitable candidates.'],
          ['Non-Surgical Rhinoplasty', 'Camouflages a dorsal hump or refines tip angle with filler in under 30 minutes.'],
          ['Liquid Facelift (8-Point Lift)', 'A structured multi-point filler plan that lifts and rebalances the whole face.'],
          ['Filler Dissolving Treatment', 'Hyaluronidase to correct, reduce or fully reverse previous hyaluronic acid filler.']
        ]
      },
      {
        name: 'Skin Quality & Tightening',
        services: [
          ['Morpheus8 RF Microneedling', 'Radiofrequency delivered at depth through microneedles to remodel collagen and tighten.'],
          ['Skin Boosters', 'Micro-injections of stabilised hyaluronic acid to improve hydration, glow and fine texture.'],
          ['Profhilo Treatment', 'A high-concentration bio-remodelling injectable that spreads to firm and hydrate lax skin.'],
          ['Thread Lift', 'Absorbable barbed sutures placed to lift soft tissue and stimulate collagen along the vector.'],
          ['Double Chin Injections', 'Fat-dissolving injections to reduce a modest submental fat pad.']
        ]
      }
    ]
  },


  /* =================== 11 =================== */

  {
    slug: 'skin-surgery',
    name: 'Skin Surgery',
    icon: 'scalpel',
    tagline: 'Excision of lesions, lumps and scars with a plastic surgical closure.',
    tags: ['Lesion Removal', 'Scar Revision', 'Lipoma & Cyst'],
    intro: [
      'A lump removed by a general practitioner and a lump removed by a plastic surgeon leave different scars. The excision itself is often straightforward — the outcome is determined by incision planning along relaxed skin tension lines, layered closure and tension management during healing.',
      'Any lesion with atypical features is sent for histopathology as standard, regardless of how routine it looks. Where a lesion is suspicious, diagnosis takes priority over the cosmetic result and we will tell you that at consultation.'
    ],
    meta: [
      ['Anaesthetic', 'Local (usually)'],
      ['Procedure time', '20 – 90 minutes'],
      ['Downtime', '2 – 7 days'],
      ['Sutures out', '5 – 14 days']
    ],
    groups: [
      {
        name: 'Lesion & Lump Removal',
        services: [
          ['Skin Lesion Removal', 'Surgical excision of benign or suspicious skin lesions anywhere on the body.'],
          ['Facial Skin Lesion Removal', 'Excision on the face using fine closure techniques to minimise visible scarring.'],
          ['Lip Lesion Removal', 'Careful removal of lip lesions with attention to the vermilion border.'],
          ['Skin Tag Removal', 'Quick removal of skin tags from the neck, underarms, eyelids and groin.'],
          ['Mole Removal Surgery', 'Full-thickness excision of moles, with histology where clinically indicated.'],
          ['Cyst Removal Surgery', 'Complete removal of the cyst wall to prevent the recurrence common after simple drainage.'],
          ['Lipoma Removal Surgery', 'Excision of benign fatty lumps through the smallest practical incision.'],
          ['Dermatofibroma Removal', 'Excision of the firm dermal nodules that commonly form on the legs.'],
          ['Pyogenic Granuloma Removal', 'Removes the rapidly growing, easily bleeding vascular lesion at its base.'],
          ['Osteoma Removal', 'Removal of small benign bony growths, most often on the forehead or scalp.'],
          ['Rhinophyma Surgery', 'Reshapes and resurfaces thickened, bulbous nasal tissue from advanced rosacea.'],
          ['Skin Cancer Surgery', 'Excision of confirmed skin cancers with appropriate margins and reconstruction.']
        ]
      },
      {
        name: 'Scar Revision & Repair',
        services: [
          ['Scar Revision Surgery', 'Re-excises and re-closes poor scars to sit flatter, finer and better aligned.'],
          ['Facial Scar Revision', 'Realigns facial scars into natural creases and shadow lines to reduce visibility.'],
          ['Acne Scar Removal', 'Combines subcision, excision and resurfacing tailored to each scar type.'],
          ['Hypertrophic Scar Treatment', 'Steroid injection, silicone and pressure protocols to flatten raised scars.'],
          ['Keloid Scar Treatment', 'Combined excision and adjuvant therapy for keloids, with realistic recurrence counselling.'],
          ['Burn Scars Treatment', 'Release of contracture and resurfacing to restore movement and appearance.'],
          ['Surgical Tattoo Removal', 'Excision for small, dense or laser-resistant tattoos in one or staged procedures.'],
          ['Micro & Nano Fat Grafting', 'Refined fat injection to soften depressed scars and improve overlying skin quality.']
        ]
      },
      {
        name: 'Specialist Procedures',
        services: [
          ['Subcision for Cellulite', 'Releases the fibrous bands that tether skin and create visible dimpling.'],
          ['Suction Curettage for Hyperhidrosis', 'Removes underarm sweat glands for a lasting reduction in excessive sweating.'],
          ['Laser Stretch Mark Removal (LineLase)', 'Laser treatment option for stretch-mark texture and colour, planned over a series of sessions.']
        ]
      }
    ]
  },


  /* =================== 12 =================== */

  {
    slug: 'eyelids-upper-face',
    name: 'Eyelids & Upper Face',
    icon: 'eye',
    tagline: 'Blepharoplasty, brow lifting and forehead refinement.',
    tags: ['Blepharoplasty', 'Brow Lift', 'Eye Bags'],
    intro: [
      'The upper third of the face is what people read first. Heavy upper lids and lower lid bags register as tiredness long before they register as age, which is why eyelid surgery consistently produces one of the highest satisfaction rates in aesthetic surgery relative to its recovery.',
      'The critical judgement is whether the problem is the eyelid, the brow, or both. Operating on an eyelid when the brow has descended removes skin that was holding the brow up and can make the result worse — so assessment always precedes any decision on approach.'
    ],
    meta: [
      ['Anaesthetic', 'Local or general'],
      ['Procedure time', '45 – 120 minutes'],
      ['Downtime', '7 – 10 days'],
      ['Bruising', '10 – 14 days']
    ],
    groups: [
      {
        name: 'Eyelid Surgery',
        services: [
          ['Blepharoplasty (Eyelid Surgery)', 'Removes excess skin and repositions fat to open and refresh the eye.'],
          ['Upper Eyelid Surgery', 'Excises hooded upper lid skin that weighs on the lashes and narrows the eye.'],
          ['Lower Eyelid Surgery', 'Addresses under-eye bags and hollowing, usually by repositioning rather than removing fat.'],
          ['Asian Blepharoplasty', 'Creates or refines a natural double eyelid crease at a height suited to your anatomy.'],
          ['Canthoplasty (Almond Eye Surgery)', 'Adjusts the outer corner to change eye shape or correct lower lid laxity.'],
          ['Revision Blepharoplasty', 'Corrects over-resection, asymmetry or lid malposition from earlier eyelid surgery.'],
          ['Male Eyelid Surgery', 'Conservative upper lid correction that avoids feminising the brow position.'],
          ['Eyelid Surgery FAQs', 'Recovery, scarring, dry eye risk, vision and how long results last.']
        ]
      },
      {
        name: 'Brow & Forehead',
        services: [
          ['Brow Lift (Forehead Lift)', 'Restores brow height and reduces the heavy, hooded look of upper-face descent.'],
          ['Endoscopic Brow Lift', 'Keyhole technique through small hidden scalp incisions with faster recovery.'],
          ['Temporal Brow Lift', 'Targeted lift of the outer brow tail — the area that drops first.'],
          ['Brow Lift vs Blepharoplasty', 'How we decide which procedure — or which combination — actually solves the problem.'],
          ['Hairline Lowering', 'Reduces a high forehead by advancing the hairline forward in one operation.'],
          ['AccuTite', 'Miniaturised radiofrequency contraction for very small, delicate areas around the eyes and brow.'],
          ['Osteoma Removal', 'Removes small benign bony growths around the forehead or upper face.'],
          ['Micro & Nano Fat Grafting', 'Uses refined fat grafts for small-volume upper-face contour and skin-quality concerns.'],
          ['Tear Trough Filler (Under Eye Filler)', 'Injectable treatment for suitable under-eye hollowing after assessment.'],
          ['SmoothEye Laser Treatment', 'Laser treatment intended to support collagen around the eye area.']
        ]
      }
    ]
  },


  /* =================== 13 =================== */

  {
    slug: 'ear-surgery',
    name: 'Ear Surgery',
    icon: 'ear',
    tagline: 'Otoplasty, ear pinning and earlobe repair.',
    tags: ['Otoplasty', 'Ear Pinning', 'Earlobe Repair'],
    intro: [
      'Prominent ears are one of the few aesthetic concerns that reliably affect children socially, and one of the few procedures where operating early is genuinely justified. Ear cartilage reaches near-adult size by around age five or six, so surgery from that point does not interfere with growth.',
      'Earlobe repair is a small operation with a disproportionate impact — split, stretched or torn lobes from heavy jewellery or gauges are corrected under local anaesthetic in under an hour, and most patients can re-pierce after a few months.'
    ],
    meta: [
      ['Anaesthetic', 'Local or general'],
      ['Procedure time', '30 – 120 minutes'],
      ['Downtime', '5 – 7 days'],
      ['Headband', '2 – 6 weeks']
    ],
    groups: [
      {
        name: 'Procedures',
        services: [
          ['Otoplasty (Ear Pinning)', 'Reshapes and repositions prominent ears closer to the head through a hidden rear incision.'],
          ['Earlobe Repair', 'Repairs split, torn or stretched lobes from jewellery, gauges or trauma.'],
          ['Earlobe Reduction', 'Reduces elongated or heavy lobes that have stretched over time.'],
          ['Otoplasty FAQs', 'Suitable ages, scarring, recovery, headband use and how permanent the correction is.']
        ]
      }
    ]
  },


  /* =================== 14 =================== */

  {
    slug: 'post-weight-loss',
    name: 'Post Weight Loss',
    icon: 'weight',
    tagline: 'Body contouring and excess skin removal after major weight loss.',
    tags: ['Body Lift', 'Arm Lift', 'Excess Skin'],
    intro: [
      'Losing a large amount of weight — through bariatric surgery, GLP-1 medication or sustained lifestyle change — leaves skin that will not retract. This is not a failure of effort or of skincare; the dermis has been stretched beyond its elastic limit and the only remedy is surgical removal.',
      'These are larger operations than most cosmetic surgery, often staged over twelve to eighteen months, and they require a stable weight for at least six months and adequate protein and iron levels beforehand. We plan the full sequence at the first consultation so you know what the whole journey involves.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '2 – 8 hours'],
      ['Hospital stay', '1 – 3 nights'],
      ['Downtime', '4 – 8 weeks']
    ],
    groups: [
      {
        name: 'Torso & Abdomen',
        services: [
          ['Body Contouring After Weight Loss', 'Full staged assessment and sequencing across all affected areas.'],
          ['Excess Skin Removal Surgery', 'Targeted removal of redundant skin causing hygiene or mobility problems.'],
          ['Extended Tummy Tuck', 'Abdominoplasty extended around the flanks for wider skin excess.'],
          ['Fleur-de-Lis Tummy Tuck', 'Adds a vertical excision for patients with significant horizontal laxity.'],
          ['Apronectomy (Panniculectomy)', 'Removes the overhanging abdominal apron, often for functional reasons.'],
          ['Tummy Tuck (Abdominoplasty)', 'Removes loose abdominal skin and can repair abdominal muscle separation.'],
          ['Mons Lift (Monsplasty)', 'Reduces and lifts excess tissue over the pubic mound.']
        ]
      },
      {
        name: 'Limbs & Back',
        services: [
          ['Arm Lift (Brachioplasty)', 'Removes hanging upper arm skin and reshapes the arm contour.'],
          ['Thigh Lift (Thigh Reduction)', 'Tightens inner or outer thigh laxity that causes chafing and discomfort.'],
          ['Lower Back Lift', 'Removes rolls across the lower back and improves the flank contour.'],
          ['Bra Line Back Lift', 'Excises upper back rolls through a scar concealed under the bra line.']
        ]
      },
      {
        name: 'Body Lifts',
        services: [
          ['Buttock Lift (Gluteal Lift)', 'Lifts descended buttock tissue, sometimes with auto-augmentation for shape.'],
          ['Breast Lift (Mastopexy)', 'Reshapes and lifts breast tissue after significant weight change.'],
          ['Mommy Makeover', 'Combines selected breast, abdomen and body-contouring procedures in an individualised plan.'],
          ['Upper Body Lift', 'Combines back, chest and arm correction in one staged operation.'],
          ['Lower Body Lift', 'Circumferential lift of the abdomen, flanks, buttocks and outer thighs.'],
          ['Belt Lipectomy', 'A complete circumferential excision at the waistline for major skin excess.'],
          ['Male Body Lift', 'Post-weight-loss contouring planned around masculine torso proportions.']
        ]
      }
    ]
  },


  /* =================== 15 =================== */

  {
    slug: 'gender-surgery',
    name: 'Gender Surgery',
    icon: 'gender',
    tagline: 'Gender-affirming chest, body and facial surgery.',
    tags: ['Top Surgery', 'FFS', 'Masculinisation'],
    intro: [
      'Gender-affirming surgery is delivered here to WPATH Standards of Care. That means assessment, informed consent and — where required for surgery — supporting documentation from a qualified mental health professional. We can advise on what documentation is needed and when.',
      'Consultations are conducted with the name and pronouns you use, without gatekeeping questions that are not clinically relevant. Surgical planning is individual: chest and body proportion, existing tissue, prior hormone therapy and your own stated goals all shape the technique chosen.'
    ],
    meta: [
      ['Anaesthetic', 'General'],
      ['Procedure time', '2 – 6 hours'],
      ['Downtime', '2 – 6 weeks'],
      ['Standards', 'WPATH SOC 8']
    ],
    groups: [
      {
        name: 'Chest Surgery',
        services: [
          ['FtM / FtN Top Surgery', 'Masculinising chest reconstruction with nipple resizing and repositioning.'],
          ['Double Incision Top Surgery', 'Standard approach for larger chests, with free nipple grafting.'],
          ['Keyhole Top Surgery', 'Minimal-scar technique for smaller chests with good skin elasticity.'],
          ['MtF Top Surgery', 'Feminising breast augmentation, planned around chest width and hormone-driven development.'],
          ['FtM Top Surgery FAQs', 'Technique selection, scarring, nipple sensation, binding beforehand and recovery.']
        ]
      },
      {
        name: 'Face & Body',
        services: [
          ['Facial Feminisation Surgery (FFS)', 'Combined forehead, brow, nose, cheek, lip and jaw refinement.'],
          ['Tracheal Shave', 'Reduces thyroid cartilage prominence through a small, well-concealed incision.'],
          ['Body Masculinisation Surgery', 'Contours the waist, flanks and chest toward a more masculine silhouette.']
        ]
      },
      {
        name: 'Pathway & Documentation',
        services: [
          ['Gender Affirmation Surgery', 'Overview of the full surgical pathway and how we sequence procedures.'],
          ['WPATH Letter for Top Surgery', 'What documentation is required, who can provide it and how we support the process.'],
          ['Transgender Surgery FAQs', 'Eligibility, hormone requirements, timelines, recovery and aftercare.']
        ]
      }
    ]
  },


  /* =================== 16 =================== */

  {
    slug: 'hair-transplant',
    name: 'Hair Transplant',
    icon: 'hair',
    tagline: 'FUE and FUT restoration for the scalp, hairline, beard and eyebrows.',
    tags: ['FUE', 'FUT', 'Hairline Design', 'Beard Transplant'],
    intro: [
      'A hair transplant redistributes hair rather than creating it. Follicles are taken from the permanent donor zone at the back and sides of the scalp — genetically resistant to the hormone that drives pattern loss — and placed where density has been lost. Those transplanted follicles keep that resistance for life.',
      'The single most important decision is not graft count but hairline design. A hairline placed too low or too straight looks convincing at thirty and wrong at fifty, once the surrounding native hair has continued to recede behind it. We design conservatively, for the face you will have in twenty years.'
    ],
    meta: [
      ['Anaesthetic', 'Local'],
      ['Procedure time', '5 – 8 hours'],
      ['Downtime', '7 – 10 days'],
      ['Full result', '10 – 14 months']
    ],
    groups: [
      {
        name: 'Restoration Procedures',
        services: [
          ['FUE Hair Transplant', 'Individual follicular units extracted and placed without a linear donor scar.'],
          ['FUT Hair Transplant', 'Follicular units are harvested as a carefully planned donor strip when this technique is the right fit for the scalp and coverage goals.'],
          ['Body Hair Transplant', 'Uses selected body-hair follicles as an additional donor source in carefully assessed cases.'],
          ['Beard-to-Head Hair Transplant', 'Uses suitable beard follicles to supplement scalp density where appropriate.'],
          ['Hairline Design & Lowering', 'Restores a receded hairline at a height and shape that will age naturally.'],
          ['Crown & Vertex Restoration', 'Density restoration at the crown, planned against likely future recession.'],
          ['Beard Transplant', 'Fills patchy or absent beard growth along the jaw, cheeks and moustache.'],
          ['Eyebrow Transplant', 'Rebuilds thin, over-plucked or scarred eyebrows with individually angled grafts.'],
          ['Scar Hair Transplant', 'Camouflages scars from surgery, injury or a previous strip harvest.'],
          ['PRP Hair Therapy', 'Platelet-rich plasma to support existing follicles alongside or instead of surgery.']
        ]
      }
    ]
  }
];

/* Cross-links shown at the bottom of each category page */
const RELATED = {
  'laser-dermatology':      ['non-surgical-aesthetics', 'skin-surgery', 'face-surgery'],
  'non-surgical-aesthetics':['laser-dermatology', 'face-surgery', 'eyelids-upper-face'],
  'skin-surgery':           ['laser-dermatology', 'face-surgery', 'body-surgery'],
  'nose-surgery':           ['face-surgery', 'eyelids-upper-face', 'non-surgical-aesthetics'],
  'eyelids-upper-face':     ['face-surgery', 'nose-surgery', 'non-surgical-aesthetics'],
  'face-surgery':           ['eyelids-upper-face', 'nose-surgery', 'non-surgical-aesthetics'],
  'ear-surgery':            ['face-surgery', 'nose-surgery', 'skin-surgery'],
  'breast-surgery':         ['mommy-makeover', 'body-surgery', 'gender-surgery'],
  'body-surgery':           ['buttock-contouring', 'post-weight-loss', 'mommy-makeover'],
  'buttock-contouring':     ['body-surgery', 'post-weight-loss', 'male-surgery'],
  'cosmetic-gynaecology':   ['mommy-makeover', 'laser-dermatology', 'body-surgery'],
  'mommy-makeover':         ['breast-surgery', 'body-surgery', 'cosmetic-gynaecology'],
  'post-weight-loss':       ['body-surgery', 'breast-surgery', 'buttock-contouring'],
  'male-surgery':           ['body-surgery', 'nose-surgery', 'hair-transplant'],
  'gender-surgery':         ['breast-surgery', 'face-surgery', 'body-surgery'],
  'hair-transplant':        ['male-surgery', 'non-surgical-aesthetics', 'face-surgery']
};

module.exports = { CLINIC, ICONS, CATEGORIES, RELATED };
