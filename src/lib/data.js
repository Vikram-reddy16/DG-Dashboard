// Dummy data for the dashboard prototype. Shapes mirror the planned Supabase
// tables (jobs / categories / applications) so wiring the backend later is a
// body-swap, not a rewrite. Timestamps are relative to "now" for lifelike UI.

const now = Date.now();
const hrs = (h) => new Date(now - h * 3600 * 1000).toISOString();
const days = (d) => new Date(now - d * 24 * 3600 * 1000).toISOString();
const dateDaysAgo = (d) => new Date(now - d * 24 * 3600 * 1000).toISOString().slice(0, 10);

export const CATEGORIES = [
  { id: "c1", name: "Software Engineering", slug: "software-engineering", sortOrder: 0, active: true },
  { id: "c2", name: "Data & AI", slug: "data-ai", sortOrder: 1, active: true },
  { id: "c3", name: "Cloud & DevOps", slug: "cloud-devops", sortOrder: 2, active: true },
  { id: "c4", name: "Quality Assurance", slug: "quality-assurance", sortOrder: 3, active: true },
  { id: "c5", name: "Cybersecurity", slug: "cybersecurity", sortOrder: 4, active: true },
  { id: "c6", name: "ERP / SAP", slug: "erp-sap", sortOrder: 5, active: true },
  { id: "c7", name: "Business & PM", slug: "business-pm", sortOrder: 6, active: true },
  { id: "c8", name: "IT Support", slug: "it-support", sortOrder: 7, active: false },
];

export const JOBS = [
  {
    id: "JAV-418", slug: "senior-java-developer-jav-418", title: "Senior Java Developer",
    category: "Software Engineering", experienceYears: 8, city: "Dallas", region: "TX",
    workplace: "Hybrid", engagement: ["C2C", "W2"], pay: { min: 60, max: 72, unit: "hr" },
    duration: "12-month contract", workAuth: ["USC", "GC", "GC-EAD", "H1B", "TN"],
    skills: ["Java", "Spring Boot", "Microservices", "AWS", "Kafka", "REST"],
    summary: "Build and scale backend services for a Fortune-500 financial platform. Own core microservices end-to-end and mentor two mid-level engineers.",
    status: "published", positionsTotal: 2, positionsFilled: 0, postedAt: dateDaysAgo(2),
  },
  {
    id: "DAT-512", slug: "data-engineer-dat-512", title: "Data Engineer",
    category: "Data & AI", experienceYears: 7, city: "Charlotte", region: "NC",
    workplace: "Hybrid", engagement: ["C2C", "W2"], pay: { min: 62, max: 75, unit: "hr" },
    duration: "12-month contract", workAuth: ["USC", "GC", "GC-EAD", "H1B"],
    skills: ["Python", "Spark", "Snowflake", "Airflow", "SQL", "dbt"],
    summary: "Own the data platform powering analytics for a national retailer — batch and streaming pipelines into Snowflake.",
    status: "published", positionsTotal: 1, positionsFilled: 0, postedAt: dateDaysAgo(1),
  },
  {
    id: "RCT-307", slug: "react-front-end-developer-rct-307", title: "React Front-End Developer",
    category: "Software Engineering", experienceYears: 4, city: null, region: null,
    workplace: "Remote", engagement: ["W2", "C2C"], pay: { min: 50, max: 62, unit: "hr" },
    duration: "6-month contract-to-hire", workAuth: ["USC", "GC", "H1B", "OPT/CPT"],
    skills: ["React", "TypeScript", "Redux", "Jest", "Tailwind"],
    summary: "Craft the candidate-facing UI for a healthcare scheduling product. Fully remote team with strong design partnership.",
    status: "published", positionsTotal: 1, positionsFilled: 0, postedAt: dateDaysAgo(4),
  },
  {
    id: "DVO-145", slug: "devops-engineer-dvo-145", title: "DevOps Engineer",
    category: "Cloud & DevOps", experienceYears: 5, city: "Austin", region: "TX",
    workplace: "Hybrid", engagement: ["W2", "C2C"], pay: { min: 58, max: 70, unit: "hr" },
    duration: "12-month contract", workAuth: ["USC", "GC", "GC-EAD", "H1B", "TN"],
    skills: ["AWS", "Terraform", "Kubernetes", "CI/CD", "Docker", "Jenkins"],
    summary: "Automate infrastructure and delivery for a SaaS company migrating to Kubernetes.",
    status: "published", positionsTotal: 1, positionsFilled: 0, postedAt: dateDaysAgo(3),
  },
  {
    id: "SEC-204", slug: "cybersecurity-analyst-federal-sec-204", title: "Cybersecurity Analyst (Federal)",
    category: "Cybersecurity", experienceYears: 4, city: "Washington", region: "DC",
    workplace: "Onsite", engagement: ["W2"], pay: { min: 55, max: 65, unit: "hr" },
    duration: "12-month contract", workAuth: ["USC"],
    skills: ["SIEM", "Splunk", "Incident Response", "NIST", "Threat Hunting"],
    summary: "Monitor and defend a federal agency environment from a SOC. US citizenship required; clearance-eligible preferred.",
    status: "published", positionsTotal: 3, positionsFilled: 1, postedAt: dateDaysAgo(3),
  },
  {
    id: "SWE-100", slug: "software-engineer-new-grad-opt-swe-100", title: "Software Engineer — New Grad / OPT",
    category: "Software Engineering", experienceYears: 0, city: null, region: null,
    workplace: "Remote", engagement: ["Full-time"], pay: { min: 70000, max: 85000, unit: "yr" },
    duration: "Full-time · permanent", workAuth: ["OPT/CPT", "USC", "GC"],
    skills: ["Java", "Python", "SQL", "Git", "Data Structures"],
    summary: "Start your US career on a mentored engineering team. Structured onboarding, real projects, and OPT/CPT welcome.",
    status: "draft", positionsTotal: 4, positionsFilled: 0, postedAt: dateDaysAgo(2),
  },
  {
    id: "MLE-233", slug: "machine-learning-engineer-mle-233", title: "Machine Learning Engineer",
    category: "Data & AI", experienceYears: 6, city: null, region: null,
    workplace: "Remote", engagement: ["C2C", "W2", "1099"], pay: { min: 70, max: 85, unit: "hr" },
    duration: "12-month contract", workAuth: ["USC", "GC", "H1B"],
    skills: ["Python", "PyTorch", "MLOps", "SageMaker", "Docker"],
    summary: "Take models from notebook to production for a logistics forecasting team — own training, serving and monitoring.",
    status: "draft", positionsTotal: 1, positionsFilled: 0, postedAt: dateDaysAgo(6),
  },
  {
    id: "QAA-276", slug: "qa-automation-engineer-qaa-276", title: "QA Automation Engineer",
    category: "Quality Assurance", experienceYears: 4, city: "Jersey City", region: "NJ",
    workplace: "Onsite", engagement: ["W2", "C2C"], pay: { min: 48, max: 58, unit: "hr" },
    duration: "6-month contract", workAuth: ["USC", "GC", "H1B", "OPT/CPT", "H4-EAD"],
    skills: ["Selenium", "Java", "Cucumber", "API Testing", "Postman"],
    summary: "Own test automation for a banking web app — expand coverage and wire tests into the pipeline.",
    status: "closed", positionsTotal: 1, positionsFilled: 1, postedAt: dateDaysAgo(20),
  },
];

export const APPLICATIONS = [
  { id: "a1", jobId: "JAV-418", name: "Jaideep Rao", email: "jaideep.rao@example.com", phone: "+1 (469) 555-0142", workAuth: "H1B", location: "Dallas, TX", yearsExperience: 9, taxTerm: "C2C", link: "https://linkedin.com/in/jaideeprao", note: "Available in 2 weeks, open to hybrid in DFW.", resumeName: "Jaideep_Rao_Java.pdf", status: "shortlisted", createdAt: hrs(2) },
  { id: "a2", jobId: "DAT-512", name: "Priya Menon", email: "priya.menon@example.com", phone: "+1 (704) 555-0119", workAuth: "GC", location: "Charlotte, NC", yearsExperience: 8, taxTerm: "W2", link: "", note: "Strong Snowflake + dbt background.", resumeName: "Priya_Menon_DataEng.pdf", status: "new", createdAt: hrs(5) },
  { id: "a3", jobId: "RCT-307", name: "Daniel Okafor", email: "daniel.okafor@example.com", phone: "+1 (212) 555-0188", workAuth: "USC", location: "Remote", yearsExperience: 5, taxTerm: "W2", link: "https://danielok.dev", note: "", resumeName: "Daniel_Okafor_React.pdf", status: "new", createdAt: hrs(9) },
  { id: "a4", jobId: "JAV-418", name: "Sana Qureshi", email: "sana.q@example.com", phone: "+1 (646) 555-0170", workAuth: "GC-EAD", location: "Irving, TX", yearsExperience: 7, taxTerm: "C2C", link: "", note: "Kafka + Spring Boot, ex-fintech.", resumeName: "Sana_Qureshi.pdf", status: "new", createdAt: hrs(22) },
  { id: "a5", jobId: "SEC-204", name: "Marcus Bell", email: "marcus.bell@example.com", phone: "+1 (202) 555-0133", workAuth: "USC", location: "Arlington, VA", yearsExperience: 6, taxTerm: "W2", link: "", note: "Active Secret clearance.", resumeName: "Marcus_Bell_SOC.pdf", status: "hired", createdAt: days(2) },
  { id: "a6", jobId: "DVO-145", name: "Wei Zhang", email: "wei.zhang@example.com", phone: "+1 (512) 555-0155", workAuth: "H1B", location: "Austin, TX", yearsExperience: 5, taxTerm: "C2C", link: "https://github.com/weizh", note: "", resumeName: "Wei_Zhang_DevOps.pdf", status: "shortlisted", createdAt: days(1) },
  { id: "a7", jobId: "DAT-512", name: "Laura Benitez", email: "laura.benitez@example.com", phone: "+1 (980) 555-0101", workAuth: "USC", location: "Charlotte, NC", yearsExperience: 6, taxTerm: "W2", link: "", note: "Airflow + Spark tuning experience.", resumeName: "Laura_Benitez.pdf", status: "rejected", createdAt: days(3) },
  { id: "a8", jobId: "RCT-307", name: "Omar Haddad", email: "omar.haddad@example.com", phone: "+1 (347) 555-0167", workAuth: "OPT/CPT", location: "Remote", yearsExperience: 3, taxTerm: "W2", link: "", note: "Next.js + TS portfolio attached.", resumeName: "Omar_Haddad_FE.pdf", status: "new", createdAt: hrs(30) },
  { id: "a9", jobId: null, name: "Nina Petrova", email: "nina.petrova@example.com", phone: "+1 (415) 555-0124", workAuth: "GC", location: "San Jose, CA", yearsExperience: 10, taxTerm: "Any", link: "https://linkedin.com/in/ninap", note: "Talent network — open to Cloud Architect roles.", resumeName: "Nina_Petrova.pdf", status: "new", createdAt: days(4) },
  { id: "a10", jobId: "JAV-418", name: "Carlos Rivera", email: "carlos.rivera@example.com", phone: "+1 (972) 555-0196", workAuth: "USC", location: "Plano, TX", yearsExperience: 8, taxTerm: "W2", link: "", note: "", resumeName: "Carlos_Rivera_Java.pdf", status: "new", createdAt: days(2) },
  { id: "a11", jobId: "DVO-145", name: "Aisha Khan", email: "aisha.khan@example.com", phone: "+1 (737) 555-0148", workAuth: "H1B", location: "Round Rock, TX", yearsExperience: 6, taxTerm: "C2C", link: "", note: "EKS + ArgoCD.", resumeName: "Aisha_Khan_SRE.pdf", status: "new", createdAt: days(5) },
  { id: "a12", jobId: "SEC-204", name: "Greg Thompson", email: "greg.thompson@example.com", phone: "+1 (703) 555-0111", workAuth: "USC", location: "Washington, DC", yearsExperience: 4, taxTerm: "W2", link: "", note: "Security+ and CySA+.", resumeName: "Greg_Thompson.pdf", status: "shortlisted", createdAt: days(1) },
];

export const TEAM = [
  { id: "t1", fullName: "Devang Gupta", email: "devang@dgallen.com", role: "admin", active: true, createdAt: days(120) },
  { id: "t2", fullName: "Rhea Kapoor", email: "rhea@dgallen.com", role: "recruiter", active: true, createdAt: days(64) },
  { id: "t3", fullName: "Tom Alvarez", email: "tom@dgallen.com", role: "recruiter", active: true, createdAt: days(30) },
  { id: "t4", fullName: "Sofia Lin", email: "sofia@dgallen.com", role: "recruiter", active: false, createdAt: days(210) },
];

export const CURRENT_USER = { fullName: "Devang Gupta", email: "devang@dgallen.com", role: "admin" };

export const WORKPLACES = ["Remote", "Hybrid", "Onsite"];
export const ENGAGEMENTS = ["W2", "C2C", "1099", "Full-time"];
export const WORK_AUTH = ["USC", "GC", "GC-EAD", "H1B", "H4-EAD", "OPT/CPT", "TN"];
export const PAY_UNITS = ["hr", "yr"];
