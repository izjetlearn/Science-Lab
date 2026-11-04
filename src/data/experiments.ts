import { ExperimentDef, QuizQuestion } from '../types';

export const EXPERIMENTS_DATA: ExperimentDef[] = [
  {
    id: 'toothpaste',
    title: "Devil's Toothpaste",
    category: 'Chemistry',
    tagline: 'Catalytic decomposition of concentrated hydrogen peroxide into hot oxygen-rich foam.',
    difficulty: 'Intermediate',
    parameters: [
      {
        key: 'concentration',
        label: 'H₂O₂ Concentration',
        min: 3,
        max: 35,
        step: 1,
        defaultValue: 15,
        unit: '%',
        description: 'Higher concentration stores significantly more chemical potential energy per ml.'
      },
      {
        key: 'catalyst',
        label: 'Catalyst Amount (KI)',
        min: 5,
        max: 50,
        step: 5,
        defaultValue: 25,
        unit: 'mg',
        description: 'Potassium Iodide lowers activation energy without being consumed.'
      },
      {
        key: 'soap',
        label: 'Dish Detergent Volume',
        min: 2,
        max: 30,
        step: 2,
        defaultValue: 15,
        unit: 'mL',
        description: 'Surfactant reduces surface tension to trap expanding oxygen gas in stable bubbles.'
      }
    ],
    presets: [
      {
        name: 'Standard Classroom (6%)',
        description: 'Safe gentle demonstration with low-concentration peroxide.',
        params: { concentration: 6, catalyst: 15, soap: 10 }
      },
      {
        name: 'Elephantine Rapid Jet (30%)',
        description: 'Industrial-grade decomposition with explosive foam expulsion.',
        params: { concentration: 30, catalyst: 45, soap: 25 }
      },
      {
        name: 'High Soap Super-Foam',
        description: 'Dense long-lasting bubble column with moderate reaction rate.',
        params: { concentration: 12, catalyst: 20, soap: 30 }
      }
    ],
    equation: '2H₂O₂(aq) ⟶[I⁻] 2H₂O(l) + O₂(g) + 196 kJ/mol',
    formulaLabel: 'Exothermic Catalytic Decomposition',
    principles:
      'Hydrogen peroxide naturally decomposes very slowly into water and oxygen gas. When iodide ions (I⁻) from potassium iodide are added, they catalyze a two-step mechanism: H₂O₂ + I⁻ ⟶ H₂O + IO⁻, followed by H₂O₂ + IO⁻ ⟶ H₂O + O₂ + I⁻. The iodide is regenerated. The intense exothermic enthalpy (ΔH = -98 kJ/mol) heats the trapped oxygen and water into steam, causing rapid expansion of liquid dish soap into an erupting foam column.',
    safetyNote: 'Thermal hazard: The reaction can exceed 80°C. Wear nitrile gloves and safety goggles.'
  },
  {
    id: 'rocket',
    title: 'Orbital Rocket Dynamics',
    category: 'Physics',
    tagline: "Newton's Third Law, variable thrust profiles, and aerodynamic atmospheric ascent.",
    difficulty: 'Advanced',
    parameters: [
      {
        key: 'thrust',
        label: 'Thrust Force',
        min: 20,
        max: 100,
        step: 5,
        defaultValue: 65,
        unit: 'kN',
        description: 'Force produced by expanding exhaust gases according to F = ṁ · v_e.'
      },
      {
        key: 'fuelMass',
        label: 'Propellant Mass',
        min: 100,
        max: 800,
        step: 50,
        defaultValue: 450,
        unit: 'kg',
        description: 'Higher fuel gives longer burn time but adds initial liftoff inertia.'
      },
      {
        key: 'dragCoeff',
        label: 'Aerodynamic Drag (Cd)',
        min: 0.1,
        max: 0.8,
        step: 0.05,
        defaultValue: 0.25,
        unit: 'Cd',
        description: 'Nosecone streamlining reduces atmospheric resistance at high velocities.'
      }
    ],
    presets: [
      {
        name: 'Sounding Sub-Orbital',
        description: 'Lightweight high-thrust probe built for maximum vertical apogee.',
        params: { thrust: 85, fuelMass: 350, dragCoeff: 0.15 }
      },
      {
        name: 'Heavy Lift Booster',
        description: 'Large fuel capacity with sustained burn through dense lower troposphere.',
        params: { thrust: 95, fuelMass: 750, dragCoeff: 0.3 }
      },
      {
        name: 'Blunt High-Drag Body',
        description: 'Demonstrates parasitic atmospheric drag limiting terminal velocity.',
        params: { thrust: 50, fuelMass: 400, dragCoeff: 0.7 }
      }
    ],
    equation: 'F_net = T - m(t)·g - ½·ρ(h)·v²·A·Cd',
    formulaLabel: "Tsiolkovsky's Rocket Equation & Drag Mechanics",
    principles:
      "A rocket operates via conservation of momentum: expelling high-speed combustion gas out of a convergent-divergent nozzle produces upward thrust. As propellant is burned, the rocket's mass decreases continuously (m(t) = m_dry + m_fuel(t)), causing acceleration to climb dramatically toward burnout. As altitude increases, air density drops exponentially (ρ(h) = ρ₀ · e^(-h/H)), diminishing drag forces.",
    safetyNote: 'Launch zone clearance: Acoustic shockwave and hypergolic exhaust hazard.'
  },
  {
    id: 'earthquake',
    title: 'Seismic Wave & Fault Simulator',
    category: 'Geology',
    tagline: 'Fault slip dynamics, P & S wave propagation, and structural resonance response.',
    difficulty: 'Intermediate',
    parameters: [
      {
        key: 'magnitude',
        label: 'Moment Magnitude (Mw)',
        min: 4.0,
        max: 8.5,
        step: 0.1,
        defaultValue: 6.5,
        unit: 'Mw',
        description: 'Logarithmic scale: each +1 Mw represents a 31.6-fold energy increase (10^1.5).'
      },
      {
        key: 'depth',
        label: 'Focal Hypocenter Depth',
        min: 5,
        max: 60,
        step: 5,
        defaultValue: 15,
        unit: 'km',
        description: 'Shallower earthquakes transfer greater seismic energy to the ground surface.'
      },
      {
        key: 'distance',
        label: 'Epicentral Distance',
        min: 10,
        max: 120,
        step: 5,
        defaultValue: 30,
        unit: 'km',
        description: 'Distance from the rupture epicenter to the seismograph recording station.'
      }
    ],
    presets: [
      {
        name: 'Shallow Near-Field Shock',
        description: 'Violent high-frequency surface wave disruption close to fault break.',
        params: { magnitude: 7.2, depth: 8, distance: 15 }
      },
      {
        name: 'Deep Subduction Zone',
        description: 'High energy release dissipated through thick lithosphere layers.',
        params: { magnitude: 7.8, depth: 55, distance: 80 }
      },
      {
        name: 'Moderate Regional Tremor',
        description: 'Classic P and S wave separation recorded at distant seismic station.',
        params: { magnitude: 5.6, depth: 20, distance: 45 }
      }
    ],
    equation: 'log₁₀(E) = 4.8 + 1.5·Mw  |  v_p = √((K + 4/3·G) / ρ)',
    formulaLabel: 'Gutenberg-Richter Energy & Elastic Wave Velocity',
    principles:
      'Tectonic plates build elastic strain along locked fault lines until frictional shear strength is exceeded. The sudden slip releases stored elastic strain energy as compressional Primary waves (P-waves, faster longitudinal motion) and slower Shear waves (S-waves, transverse ground shaking). Surface Love and Rayleigh waves follow. Structures on the surface respond based on their natural vibrational period matching dominant seismic frequencies.',
    safetyNote: 'Geotechnical alert: Liquefaction occurs in saturated sandy sediments under cyclic shear.'
  },
  {
    id: 'volcano',
    title: 'Magma Chamber & Volcano Dynamics',
    category: 'Earth Science',
    tagline: 'Viscosity regimes, dissolved volatile degassing, and explosive vs effusive eruptions.',
    difficulty: 'Advanced',
    parameters: [
      {
        key: 'silica',
        label: 'Silica Content / Viscosity',
        min: 48,
        max: 75,
        step: 1,
        defaultValue: 62,
        unit: '% SiO₂',
        description: 'Basalt (48-52%) flows easily; Andesite/Rhyolite (>65%) forms rigid polymer networks.'
      },
      {
        key: 'gasPressure',
        label: 'Dissolved Volatiles (H₂O/CO₂)',
        min: 1,
        max: 8,
        step: 0.5,
        defaultValue: 4.5,
        unit: 'wt %',
        description: 'Dissolved volcanic gases exsolve as pressure drops during magma ascent.'
      },
      {
        key: 'ventDiameter',
        label: 'Conduit Vent Width',
        min: 10,
        max: 80,
        step: 5,
        defaultValue: 35,
        unit: 'm',
        description: 'Constricted vents create supersonic nozzle chokes and explosive fragmentation.'
      }
    ],
    presets: [
      {
        name: 'Hawaiian Shield (Basaltic)',
        description: 'Fluid, low-silica magma forming gentle effusive pahoehoe lava fountains.',
        params: { silica: 50, gasPressure: 1.5, ventDiameter: 60 }
      },
      {
        name: 'Plinian Stratovolcano',
        description: 'Viscous rhyolite trapping high gas pressure, detonating a 25km ash column.',
        params: { silica: 72, gasPressure: 6.5, ventDiameter: 25 }
      },
      {
        name: 'Strombolian Bubble Bursts',
        description: 'Rhythmic gas slugs detonating molten lava bombs into the night sky.',
        params: { silica: 58, gasPressure: 3.5, ventDiameter: 40 }
      }
    ],
    equation: 'η = η₀ · exp(E / RT)  |  Q = (π · r⁴ · ΔP) / (8 · η · L)',
    formulaLabel: "Arrhenius Magma Viscosity & Hagen-Poiseuille Volumetric Flow",
    principles:
      'Silicate tetrahedra (SiO₄⁴⁻) polymerize into tangled chains at high silica concentrations, raising viscosity by orders of magnitude. When magma ascends, decreasing lithostatic pressure triggers volatile exsolution (Henry’s law). In low-viscosity basalt, gas escapes gently. In high-viscosity dacite/rhyolite, gas bubbles cannot escape, expanding until bubble walls shatter into microscopic glass shards (volcanic ash and pumice) driven by supersonic decompression.',
    safetyNote: 'Pyroclastic hazard: Density currents travel up to 700 km/h with temperatures >800°C.'
  },
  {
    id: 'genetics',
    title: 'Punnett Splicer & Mendelian Genetics',
    category: 'Genetics',
    tagline: 'Allele pairing, dominant vs recessive traits, and phenotypic probability distributions.',
    difficulty: 'Beginner',
    parameters: [
      {
        key: 'maternalAllele',
        label: 'Maternal Genotype (0: bb, 1: Bb, 2: BB)',
        min: 0,
        max: 2,
        step: 1,
        defaultValue: 1,
        unit: 'state',
        description: 'Mother genotype: 0 = homozygous recessive (bb), 1 = heterozygous (Bb), 2 = homozygous dominant (BB).'
      },
      {
        key: 'paternalAllele',
        label: 'Paternal Genotype (0: bb, 1: Bb, 2: BB)',
        min: 0,
        max: 2,
        step: 1,
        defaultValue: 1,
        unit: 'state',
        description: 'Father genotype: 0 = homozygous recessive (bb), 1 = heterozygous (Bb), 2 = homozygous dominant (BB).'
      },
      {
        key: 'sampleSize',
        label: 'Simulated Offspring Batch',
        min: 10,
        max: 200,
        step: 10,
        defaultValue: 80,
        unit: 'specimens',
        description: 'Statistical sample size demonstrating law of large numbers convergence toward theoretical ratios.'
      }
    ],
    presets: [
      {
        name: 'Classic Monohybrid (Bb × Bb)',
        description: 'Heterozygous cross yielding textbook 1:2:1 genotype and 3:1 phenotype ratio.',
        params: { maternalAllele: 1, paternalAllele: 1, sampleSize: 100 }
      },
      {
        name: 'Test Cross (Bb × bb)',
        description: 'Determines unknown zygosity: produces an even 50% dominant / 50% recessive split.',
        params: { maternalAllele: 1, paternalAllele: 0, sampleSize: 100 }
      },
      {
        name: 'True Breeding (BB × bb)',
        description: 'Pure-breeding parental generation yielding 100% heterozygous (Bb) F1 offspring.',
        params: { maternalAllele: 2, paternalAllele: 0, sampleSize: 100 }
      }
    ],
    equation: 'p² + 2pq + q² = 1  |  P(Offspring = BB) = P(A_m) · P(A_p)',
    formulaLabel: 'Hardy-Weinberg Equilibrium & Product Rule of Independent Assortment',
    principles:
      'Gregor Mendel formulated the Law of Segregation: diploid organisms possess pairs of alleles for each gene that segregate independently during meiosis into haploid gametes. Dominant alleles (e.g. B - Luminescent Turquoise) mask phenotypic expression of recessive alleles (b - Deep Violet) in heterozygotes (Bb). The Punnett square maps all combinatorial fertilizations.',
    safetyNote: 'Ethical review: Model complies with standard bioethical simulation guidelines.'
  },
  {
    id: 'magnesium',
    title: 'Magnesium Flare & Exothermic Oxidation',
    category: 'Chemistry',
    tagline: 'High-temperature radiant synthesis, blinding UV emission, and mass conservation.',
    difficulty: 'Intermediate',
    parameters: [
      {
        key: 'o2Concentration',
        label: 'Atmospheric O₂ Concentration',
        min: 10,
        max: 100,
        step: 5,
        defaultValue: 21,
        unit: '% O₂',
        description: 'Normal air is ~21% O₂; enriched oxygen accelerates oxidation rate exponentially.'
      },
      {
        key: 'ribbonMass',
        label: 'Magnesium Ribbon Mass',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        defaultValue: 0.5,
        unit: 'g',
        description: 'Combustible mass of pure elemental magnesium (M = 24.31 g/mol).'
      },
      {
        key: 'flameTemp',
        label: 'Ignition Burner Heat',
        min: 500,
        max: 1100,
        step: 50,
        defaultValue: 800,
        unit: '°C',
        description: 'Activation energy barrier: Mg requires ~650°C to initiate self-sustaining thermal runaway.'
      }
    ],
    presets: [
      {
        name: 'Standard Atmospheric Air (21% O₂)',
        description: 'Classic laboratory combustion with dazzling white thermal glow.',
        params: { o2Concentration: 21, ribbonMass: 0.5, flameTemp: 800 }
      },
      {
        name: 'Pure Oxygen Flash Chamber (100% O₂)',
        description: 'Instantaneous incandescent deflagration with peak UV radiation.',
        params: { o2Concentration: 100, ribbonMass: 1.0, flameTemp: 950 }
      },
      {
        name: 'Sub-Threshold Misfire',
        description: 'Insufficient burner heat failing to cross magnesium activation energy.',
        params: { o2Concentration: 21, ribbonMass: 0.5, flameTemp: 550 }
      }
    ],
    equation: '2Mg(s) + O₂(g) ⟶ 2MgO(s)  [ΔH = -1204 kJ/mol]',
    formulaLabel: 'High-Enthalpy Synthesis & Blackbody Emission',
    principles:
      'Magnesium is an alkaline earth metal with low ionization energy. Once thermal ignition overcomes activation energy, magnesium atoms react violently with molecular oxygen to form ionic lattice magnesium oxide (MgO). The reaction is intensely exothermic (ΔH° = -601.7 kJ/mol of MgO). The flame temperature surpasses 3,100 K (2,800 °C), causing the MgO solid particles to radiate brilliant Planck blackbody visible light and hazardous ultraviolet (UV) rays.',
    safetyNote: 'Photokeratitis warning: Never look directly into magnesium flare without DIN shade 5 shade glasses.'
  }
];

export const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  toothpaste: [
    {
      q: "What role does potassium iodide (KI) or dry yeast play in Devil's Toothpaste?",
      a: ["Reactant consumed in the process", "Catalyst that lowers activation energy", "Inhibitor that slows reaction", "Solvent that dissolves the oxygen"],
      c: 1,
      e: "A catalyst accelerates the chemical reaction rate without undergoing any permanent chemical change or being consumed in the net equation."
    },
    {
      q: "Which gas is produced by the catalytic decomposition and trapped by the soap bubbles?",
      a: ["Carbon Dioxide (CO₂)", "Hydrogen Gas (H₂)", "Pure Oxygen (O₂)", "Nitrogen Gas (N₂)"],
      c: 2,
      e: "2H₂O₂ decomposes into 2H₂O (liquid water) and O₂ (oxygen gas). The oxygen gas is trapped by the surfactant dish soap."
    },
    {
      q: "Why does the temperature of the conical flask rise noticeably during the reaction?",
      a: ["The reaction is endothermic", "The reaction is exothermic (releases enthalpy)", "Friction between foam and glass", "Iodide ions absorb kinetic heat"],
      c: 1,
      e: "The standard enthalpy of decomposition is ΔH° = -98 kJ/mol. Because bond formation in products releases more energy than bond breaking in reactants, heat is expelled."
    }
  ],
  rocket: [
    {
      q: "Which fundamental law of physics enables a rocket to accelerate in the vacuum of outer space?",
      a: ["Newton's First Law (Inertia)", "Newton's Second Law (F = ma)", "Newton's Third Law (Action & Reaction)", "Kepler's Third Law (Harmonic Law)"],
      c: 2,
      e: "Newton's Third Law states that for every action, there is an equal and opposite reaction. High-velocity gas pushed backward imparts an equal forward momentum on the rocket body."
    },
    {
      q: "According to Tsiolkovsky's Rocket Equation, why does a rocket's acceleration increase toward engine burnout?",
      a: ["Gravitational pull increases with altitude", "The rocket's mass decreases as propellant burns", "The thruster burns hotter fuel over time", "Exhaust velocity triples at higher speeds"],
      c: 1,
      e: "Because thrust remains approximately constant while the total mass (m) drops drastically as propellant is consumed, acceleration a = F / m increases dramatically."
    },
    {
      q: "What happens to atmospheric aerodynamic drag as a rocket climbs from the sea level to 30 km altitude?",
      a: ["Drag increases due to colder temperatures", "Drag remains constant regardless of height", "Drag drops exponentially as air density declines", "Drag fluctuates unpredictably based on solar winds"],
      c: 2,
      e: "Aerodynamic drag is proportional to air density (ρ). Atmospheric density decays exponentially with altitude: ρ(h) = ρ₀ · e^(-h/H)."
    }
  ],
  earthquake: [
    {
      q: "What is the point on Earth's surface situated directly above the seismic rupture origin (hypocenter)?",
      a: ["Fault Scarp", "Epicenter", "Benioff Zone", "Antipode"],
      c: 1,
      e: "The hypocenter (or focus) is the actual underground rupture point; the epicenter is the geographic coordinate on Earth's surface directly vertically above it."
    },
    {
      q: "Which seismic waves arrive FIRST at a distant monitoring seismograph station?",
      a: ["Primary (P) compressional waves", "Secondary (S) shear waves", "Rayleigh surface waves", "Love surface waves"],
      c: 0,
      e: "P-waves (Primary waves) travel fastest through rock (typically 5 to 8 km/s in the crust) because they are longitudinal compressional waves."
    },
    {
      q: "On the logarithmic Moment Magnitude scale, approximately how much more energy is released by a Mw 7.0 earthquake compared to a Mw 5.0?",
      a: ["2 times more", "20 times more", "100 times more", "1,000 times more (approx. 31.6²)"],
      c: 3,
      e: "Each full step on the magnitude scale represents 10^1.5 ≈ 31.62 times more seismic energy release. A jump of 2.0 magnitude units releases 31.62² ≈ 1,000 times more energy."
    }
  ],
  volcano: [
    {
      q: "Which magma composition is most likely to produce violent explosive Plinian eruptions?",
      a: ["Low-silica, low-viscosity Basaltic magma", "High-silica, high-viscosity Rhyolitic magma", "Ultramafic Komatiite magma", "Carbonatite low-silica magma"],
      c: 1,
      e: "High-silica magmas (rhyolite and dacite) are extremely viscous because silicate tetrahedra form complex polymers, preventing trapped gases from escaping gently until explosive fragmentation occurs."
    },
    {
      q: "What drives the explosive acceleration of volcanic ash columns high into the stratosphere?",
      a: ["Nuclear fission in the core", "Superheated steam and volatile gas expansion", "External wind currents alone", "Ocean water gravitational pressure"],
      c: 1,
      e: "Dissolved volatiles (primarily water vapor and carbon dioxide) exsolve as pressure drops. Their rapid volumetric expansion shatters viscous magma into ash and powers convective eruption columns."
    },
    {
      q: "What is a rapidly moving avalanche of searing hot rock fragments, toxic gas, and ash called?",
      a: ["Lahar mudflow", "Pyroclastic density current", "Pahoehoe sheet flow", "Fumarole plume"],
      c: 1,
      e: "A pyroclastic density current (or pyroclastic flow) is a high-speed, fluidized mixture of incandescent gas and volcanic particles traveling at speeds up to hundreds of kilometers per hour."
    }
  ],
  genetics: [
    {
      q: "If two heterozygous organisms (genotype Bb) are crossed, what is the expected probability of an offspring having the homozygous recessive genotype (bb)?",
      a: ["0% (0/4)", "25% (1/4)", "50% (2/4)", "75% (3/4)"],
      c: 1,
      e: "The Punnett square combinations for Bb × Bb are: BB (25%), Bb (25%), bB (25%), and bb (25%). Homozygous recessive (bb) represents 1 out of 4 (25%)."
    },
    {
      q: "What biological term describes an organism possessing two identical alleles for a specific gene (such as BB or bb)?",
      a: ["Heterozygous", "Homozygous", "Hemizygous", "Polygenic"],
      c: 1,
      e: "Homozygous refers to having two identical alleles at a given locus (homozygous dominant BB, or homozygous recessive bb)."
    },
    {
      q: "Which of Mendel's laws states that alleles for different traits are distributed to gametes independently of one another during meiosis?",
      a: ["Law of Segregation", "Law of Independent Assortment", "Law of Unit Factors", "Law of Gene Dominance"],
      c: 1,
      e: "The Law of Independent Assortment establishes that pairs of alleles on different chromosomes separate into gametes independently."
    }
  ],
  magnesium: [
    {
      q: "What is the balanced stoichiometric chemical equation for burning magnesium in oxygen?",
      a: ["Mg + O ⟶ MgO", "2Mg + O₂ ⟶ 2MgO", "Mg₂ + O₂ ⟶ 2MgO", "Mg + 2O₂ ⟶ MgO₄"],
      c: 1,
      e: "Two moles of magnesium solid react with one mole of diatomic oxygen gas to produce two moles of white solid magnesium oxide: 2Mg(s) + O₂(g) ⟶ 2MgO(s)."
    },
    {
      q: "Why must observers avoid looking directly at burning magnesium without protective optical filters?",
      a: ["It releases poisonous radioactive radon gas", "It produces high-intensity ultraviolet (UV) radiation and blinding white light", "It causes explosive acoustic shockwaves", "It creates a toxic ozone fog"],
      c: 1,
      e: "Magnesium burns at temperatures exceeding 3,100 K, emitting intense visible light and UV radiation that can cause severe ultraviolet photokeratitis (welder's flash) and retina damage."
    },
    {
      q: "What is the white powder residue left behind on the crucible after the magnesium ribbon burns completely?",
      a: ["Magnesium Hydroxide", "Magnesium Oxide", "Magnesium Carbonate", "Unburnt Carbon Ash"],
      c: 1,
      e: "The white powder is Magnesium Oxide (MgO), an ionic salt consisting of Mg²⁺ and O²⁻ ions in a rock-salt cubic crystal lattice."
    }
  ]
};

export const ACHIEVEMENTS_LIST = [
  { id: 'first_run', title: 'First Hypothesis', description: 'Complete your first virtual lab simulation run.', category: 'experiments', threshold: 1, unlocked: false },
  { id: 'streak_3', title: 'Curious Scholar', description: 'Reach a quiz streak of 3 consecutive correct answers.', category: 'streak', threshold: 3, unlocked: false },
  { id: 'streak_5', title: 'Bronze Specialist', description: 'Achieve a quiz streak of 5 consecutive correct answers.', category: 'streak', threshold: 5, unlocked: false },
  { id: 'streak_10', title: 'Silver Scientist', description: 'Achieve a quiz streak of 10 consecutive correct answers.', category: 'streak', threshold: 10, unlocked: false },
  { id: 'streak_15', title: 'Gold Researcher', description: 'Achieve a quiz streak of 15 consecutive correct answers.', category: 'streak', threshold: 15, unlocked: false },
  { id: 'streak_20', title: 'Platinum Professor', description: 'Achieve a quiz streak of 20 consecutive correct answers.', category: 'streak', threshold: 20, unlocked: false },
  { id: 'all_sims', title: 'Grand Tour of Science', description: 'Run all 6 distinct scientific simulation engines.', category: 'mastery', threshold: 6, unlocked: false },
  { id: 'quiz_master', title: 'Master of the Laws', description: 'Achieve 100% accuracy on 3 different experiment quizzes.', category: 'quiz', threshold: 3, unlocked: false },
];
