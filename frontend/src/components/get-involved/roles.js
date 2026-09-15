// Fixed volunteer role catalog, like the Symptom Navigator's questions or
// the Info Hub's topic list: shipped content, not admin-editable, because
// these are the concrete roles CerviBloom actually needs filled, not
// user-generated content.
export const VOLUNTEER_ROLES = [
  {
    id: 'screening-nurse',
    category: 'MEDICAL',
    title: { en: 'Screening Nurse', sw: 'Muuguzi wa Uchunguzi' },
    description: {
      en: 'Support cervical cancer screening sessions at partner facilities.',
      sw: 'Saidia vipindi vya uchunguzi wa saratani ya mlango wa kizazi katika vituo washirika.',
    },
    commitment: { en: '4 to 6 hrs/week', sw: 'Masaa 4 hadi 6/wiki' },
    requirement: { en: 'KMPDC license required', sw: 'Leseni ya KMPDC inahitajika' },
  },
  {
    id: 'triage-assistant',
    category: 'MEDICAL',
    title: { en: 'Triage Assistant', sw: 'Msaidizi wa Uchunguzi wa Awali' },
    description: {
      en: 'Help assess and direct patients during community outreach clinics.',
      sw: 'Saidia kutathmini na kuelekeza wagonjwa wakati wa kliniki za jamii.',
    },
    commitment: { en: '3 to 5 hrs/week', sw: 'Masaa 3 hadi 5/wiki' },
    requirement: { en: 'KMPDC license required', sw: 'Leseni ya KMPDC inahitajika' },
  },
  {
    id: 'patient-counselor',
    category: 'MEDICAL',
    title: { en: 'Patient Counselor', sw: 'Mshauri wa Wagonjwa' },
    description: {
      en: 'Provide pre- and post-screening counseling and support to patients.',
      sw: 'Toa ushauri na msaada kwa wagonjwa kabla na baada ya uchunguzi.',
    },
    commitment: { en: '3 to 5 hrs/week', sw: 'Masaa 3 hadi 5/wiki' },
    requirement: { en: 'Relevant health training required', sw: 'Mafunzo ya afya yanayohusiana yanahitajika' },
  },
  {
    id: 'community-mobilizer',
    category: 'NON_MEDICAL',
    title: { en: 'Community Mobilizer', sw: 'Mhamasishaji wa Jamii' },
    description: {
      en: 'Organize and promote local cervical cancer awareness events.',
      sw: 'Panga na tangaza matukio ya uhamasishaji wa saratani ya mlango wa kizazi.',
    },
    commitment: { en: 'Flexible', sw: 'Inabadilika' },
    requirement: { en: 'No medical background needed, training provided', sw: 'Hakuna historia ya kimatibabu inayohitajika, mafunzo yatatolewa' },
  },
  {
    id: 'swahili-translator',
    category: 'NON_MEDICAL',
    title: { en: 'Swahili Translator', sw: 'Mtafsiri wa Kiswahili' },
    description: {
      en: 'Translate materials and assist non-English speakers at events.',
      sw: 'Tafsiri nyenzo na saidia wasiozungumza Kiingereza kwenye matukio.',
    },
    commitment: { en: 'As needed', sw: 'Kadri inavyohitajika' },
    requirement: { en: 'No medical background needed', sw: 'Hakuna historia ya kimatibabu inayohitajika' },
  },
  {
    id: 'logistics-coordinator',
    category: 'NON_MEDICAL',
    title: { en: 'Logistics Coordinator', sw: 'Mratibu wa Vifaa' },
    description: {
      en: 'Help plan and run the logistics of outreach events.',
      sw: 'Saidia kupanga na kuendesha vifaa vya matukio ya uhamasishaji.',
    },
    commitment: { en: '3 to 4 hrs/week', sw: 'Masaa 3 hadi 4/wiki' },
    requirement: { en: 'No medical background needed, training provided', sw: 'Hakuna historia ya kimatibabu inayohitajika, mafunzo yatatolewa' },
  },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'WEEKENDS', en: 'Weekends only', sw: 'Wikendi tu' },
  { value: 'WEEKDAYS', en: 'Weekdays', sw: 'Siku za kazi' },
  { value: 'FLEXIBLE', en: 'Flexible', sw: 'Inabadilika' },
  { value: 'EVENTS_ONLY', en: 'Events only', sw: 'Matukio tu' },
];

export const STATUS_LABEL = {
  PENDING: { en: 'Submitted', sw: 'Imewasilishwa' },
  APPROVED: { en: 'Approved', sw: 'Imeidhinishwa' },
  ACTIVE: { en: 'Active', sw: 'Inafanya Kazi' },
  COMPLETED: { en: 'Completed', sw: 'Imekamilika' },
  REJECTED: { en: 'Not selected', sw: 'Haikuchaguliwa' },
};

// The order the pipeline steps render in for the status tracker banner.
// REJECTED isn't part of the happy-path pipeline, it's shown separately.
export const STATUS_PIPELINE = ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED'];
