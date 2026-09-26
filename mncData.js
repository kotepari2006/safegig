// Comprehensive database of 35+ MNCs with job opportunities, tech stacks, and domain metadata

const MNC_DATABASE = [
  {
    id: "google",
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    domain: "Tech & Cloud",
    tier: "Tier-1 Tech",
    size: "180,000+ employees",
    headquarters: "Mountain View, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Global leader in search, cloud computing, artificial intelligence, advertising, and hardware technologies.",
    careerUrl: "https://careers.google.com",
    salaryRange: "$120,000 - $210,000 / ₹18 - ₹45 LPA",
    requiredSkills: [
      "Python", "C++", "Java", "Go", "Data Structures & Algorithms", "System Design",
      "Kubernetes", "GCP", "Distributed Systems", "Machine Learning", "TensorFlow", "SQL"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Engineer (SDE I/II)",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad / Mountain View",
        experienceReq: "0-4 years",
        skills: ["C++", "Java", "Python", "Data Structures & Algorithms", "System Design"],
        description: "Develop large-scale distributed systems and core cloud infrastructure services."
      },
      {
        title: "Cloud Solutions Architect",
        type: "Full-Time",
        location: "Remote / Hybrid",
        experienceReq: "3+ years",
        skills: ["GCP", "Kubernetes", "Go", "Python", "Docker", "Cloud Security"],
        description: "Architect resilient cloud architectures for enterprise Google Cloud clients."
      },
      {
        title: "Machine Learning Engineer",
        type: "Full-Time",
        location: "Bengaluru / Sunnyvale",
        experienceReq: "2+ years",
        skills: ["Python", "TensorFlow", "PyTorch", "Data Structures & Algorithms", "Machine Learning"],
        description: "Build cutting-edge AI foundation models and multimodal intelligent features."
      }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    domain: "Enterprise Software & Cloud",
    tier: "Tier-1 Tech",
    size: "220,000+ employees",
    headquarters: "Redmond, WA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "World leader in OS, productivity software, Azure cloud computing, gaming, and OpenAI AI partnerships.",
    careerUrl: "https://careers.microsoft.com",
    salaryRange: "$115,000 - $200,000 / ₹16 - ₹42 LPA",
    requiredSkills: [
      "C#", ".NET", "TypeScript", "React", "Azure", "Python", "System Design",
      "C++", "SQL", "DevOps", "Microservices", "CI/CD"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Development Engineer",
        type: "Full-Time",
        location: "Hyderabad, Bengaluru / Redmond",
        experienceReq: "0-3 years",
        skills: ["C#", ".NET", "C++", "Data Structures & Algorithms", "Azure"],
        description: "Design and implement core OS services, Azure backend components, and enterprise apps."
      },
      {
        title: "Full Stack Web Engineer",
        type: "Full-Time",
        location: "Bengaluru / Remote",
        experienceReq: "1-4 years",
        skills: ["TypeScript", "React", "Node.js", "C#", "Azure", "GraphQL"],
        description: "Create modern web experiences for Microsoft 365, Teams, and Azure portals."
      },
      {
        title: "DevOps & Cloud Engineer",
        type: "Full-Time",
        location: "Hyderabad",
        experienceReq: "2+ years",
        skills: ["Azure", "Powershell", "Docker", "Kubernetes", "CI/CD", "Terraform"],
        description: "Automate deployment pipelines and manage cloud operations at scale."
      }
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    domain: "E-Commerce & AWS Cloud",
    tier: "Tier-1 Tech",
    size: "1,500,000+ employees",
    headquarters: "Seattle, WA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Pioneer of e-commerce, cloud computing (AWS), digital streaming, and supply chain technology.",
    careerUrl: "https://amazon.jobs",
    salaryRange: "$110,000 - $195,000 / ₹15 - ₹40 LPA",
    requiredSkills: [
      "Java", "AWS", "Python", "Distributed Systems", "SQL", "DynamoDB",
      "Microservices", "Object Oriented Design", "Data Structures & Algorithms", "Kafka"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Development Engineer (SDE-1)",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad, Chennai",
        experienceReq: "0-2 years",
        skills: ["Java", "Object Oriented Design", "Data Structures & Algorithms", "AWS", "SQL"],
        description: "Build robust backend microservices handling millions of customer orders per minute."
      },
      {
        title: "AWS Cloud Support Engineer",
        type: "Full-Time",
        location: "Bengaluru",
        experienceReq: "1+ year",
        skills: ["AWS", "Linux", "Networking", "Python", "Shell Scripting", "SQL"],
        description: "Provide enterprise cloud architecture troubleshooting and cloud performance optimization."
      },
      {
        title: "Data Engineer",
        type: "Full-Time",
        location: "Hyderabad",
        experienceReq: "2+ years",
        skills: ["Python", "SQL", "AWS Redshift", "Spark", "ETL", "Data Warehousing"],
        description: "Build high-throughput data pipelines and analytics platforms for e-commerce metrics."
      }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    domain: "Hardware & Consumer Tech",
    tier: "Tier-1 Tech",
    size: "160,000+ employees",
    headquarters: "Cupertino, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "World famous designer of iPhone, Mac, iOS, Apple Silicon, visionOS, and privacy-focused services.",
    careerUrl: "https://jobs.apple.com",
    salaryRange: "$125,000 - $220,000 / ₹20 - ₹50 LPA",
    requiredSkills: [
      "Swift", "Objective-C", "C++", "Python", "iOS", "System Architecture",
      "Embedded Systems", "Machine Learning", "Metal", "Data Structures & Algorithms"
    ],
    experienceTiers: ["Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "iOS Software Engineer",
        type: "Full-Time",
        location: "Hyderabad, Bengaluru / Cupertino",
        experienceReq: "2+ years",
        skills: ["Swift", "iOS", "Objective-C", "Data Structures & Algorithms", "UI / UX"],
        description: "Create elegant, high-performance native iOS applications and core framework APIs."
      },
      {
        title: "Core OS / Embedded C++ Engineer",
        type: "Full-Time",
        location: "Bengaluru",
        experienceReq: "3+ years",
        skills: ["C++", "C", "Embedded Systems", "Operating Systems", "Linux", "Arm"],
        description: "Write low-level firmware and system software powering Apple Silicon chips."
      }
    ]
  },
  {
    id: "meta",
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    domain: "Social Media & AI",
    tier: "Tier-1 Tech",
    size: "67,000+ employees",
    headquarters: "Menlo Park, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Social networking giant building Facebook, Instagram, WhatsApp, Llama open source AI, and Quest VR.",
    careerUrl: "https://metacareers.com",
    salaryRange: "$130,000 - $230,000 / ₹22 - ₹55 LPA",
    requiredSkills: [
      "React", "JavaScript", "Python", "C++", "PyTorch", "GraphQL",
      "Distributed Systems", "PHP", "System Design", "Data Structures & Algorithms"
    ],
    experienceTiers: ["Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Frontend Infrastructure Engineer",
        type: "Full-Time",
        location: "Remote / London / Menlo Park",
        experienceReq: "2-5 years",
        skills: ["React", "JavaScript", "TypeScript", "GraphQL", "Web Performance", "HTML5"],
        description: "Engineer core frontend architecture and high-scale UI component systems."
      },
      {
        title: "AI Research & Applied Scientist",
        type: "Full-Time",
        location: "London / Menlo Park",
        experienceReq: "3+ years",
        skills: ["PyTorch", "Python", "C++", "Machine Learning", "Deep Learning", "NLP"],
        description: "Develop breakthrough open-weights generative AI architectures and LLM reasoning models."
      }
    ]
  },
  {
    id: "ibm",
    name: "IBM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    domain: "Hybrid Cloud & Enterprise AI",
    tier: "Enterprise Tech Giant",
    size: "280,000+ employees",
    headquarters: "Armonk, NY, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Pioneer in enterprise technology, Red Hat hybrid cloud, Watson AI platforms, and mainframe infrastructure.",
    careerUrl: "https://ibm.com/careers",
    salaryRange: "$85,000 - $150,000 / ₹10 - ₹24 LPA",
    requiredSkills: [
      "Python", "Java", "OpenShift", "Docker", "Kubernetes", "Linux",
      "Cyber Security", "SQL", "Microservices", "Cloud Security", "Node.js"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Hybrid Cloud Software Developer",
        type: "Full-Time",
        location: "Bengaluru, Kochi, Pune",
        experienceReq: "0-3 years",
        skills: ["Java", "Python", "OpenShift", "Kubernetes", "Docker", "Microservices"],
        description: "Build resilient cloud containerized solutions on Red Hat OpenShift and IBM Cloud."
      },
      {
        title: "Cyber Security Specialist",
        type: "Full-Time",
        location: "Bengaluru",
        experienceReq: "1-4 years",
        skills: ["Cyber Security", "Linux", "Networking", "SIEM", "Python", "Cloud Security"],
        description: "Protect client cloud assets and monitor real-time threat intelligence feeds."
      }
    ]
  },
  {
    id: "tcs",
    name: "TCS (Tata Consultancy Services)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    domain: "IT Services & Global Consulting",
    tier: "IT Services Giant",
    size: "600,000+ employees",
    headquarters: "Mumbai, India / Global",
    hiringStatus: "Mass Hiring & Campus Recruitment",
    description: "Asia's largest IT services and consulting firm providing global software development and digital transformation.",
    careerUrl: "https://tcs.com/careers",
    salaryRange: "$50,000 - $95,000 / ₹4.5 - ₹12 LPA",
    requiredSkills: [
      "Java", "Python", "SQL", "Spring Boot", "React", "Angular",
      "Cloud Basics", "C++", "HTML5", "CSS", "Git", "Software Testing"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Systems Engineer / Full Stack Developer",
        type: "Full-Time",
        location: "Mumbai, Pune, Hyderabad, Chennai, Noida",
        experienceReq: "0-2 years",
        skills: ["Java", "Spring Boot", "SQL", "HTML5", "CSS", "Git"],
        description: "Develop enterprise web portals and backend APIs for fortune 500 financial clients."
      },
      {
        title: "Cloud & DevOps Analyst",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad",
        experienceReq: "1-3 years",
        skills: ["Python", "AWS", "Azure", "Docker", "SQL", "Linux"],
        description: "Support digital migration projects migrating legacy applications to public cloud."
      }
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    domain: "IT Services & Digital Consulting",
    tier: "IT Services Giant",
    size: "310,000+ employees",
    headquarters: "Bengaluru, India / Global",
    hiringStatus: "Actively Hiring",
    description: "Next-generation digital services and consulting leader enabling clients in 50+ countries to navigate digital transformation.",
    careerUrl: "https://infosys.com/careers",
    salaryRange: "$55,000 - $100,000 / ₹5 - ₹14 LPA",
    requiredSkills: [
      "Java", "Python", "Angular", "React", "AWS", "SQL",
      "Spring Boot", "Microservices", "Selenium", "DevOps", "Node.js"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Digital Specialist Engineer",
        type: "Full-Time",
        location: "Bengaluru, Mysuru, Pune, Hyderabad",
        experienceReq: "0-2 years",
        skills: ["Java", "Python", "React", "SQL", "Data Structures & Algorithms"],
        description: "Solve complex business engineering challenges using modern open-source stacks."
      },
      {
        title: "Automation Test Engineer",
        type: "Full-Time",
        location: "Chennai, Hyderabad",
        experienceReq: "1-3 years",
        skills: ["Selenium", "Java", "Python", "SQL", "Git", "Jenkins"],
        description: "Write automated UI and API test suites for continuous deployment integration."
      }
    ]
  },
  {
    id: "deloitte",
    name: "Deloitte",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
    domain: "Consulting & Financial Advisory",
    tier: "Big 4 Consulting",
    size: "450,000+ employees",
    headquarters: "London, UK / New York, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "World's largest professional services network providing audit, consulting, financial advisory, and risk management.",
    careerUrl: "https://deloitte.com/careers",
    salaryRange: "$80,000 - $145,000 / ₹9 - ₹22 LPA",
    requiredSkills: [
      "Python", "SQL", "Power BI", "Cloud Strategy", "Salesforce", "SAP",
      "Cyber Security", "Data Analysis", "Excel", "Project Management", "Agile"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Technology Consulting Analyst",
        type: "Full-Time",
        location: "Hyderabad, Bengaluru, Gurugram",
        experienceReq: "0-2 years",
        skills: ["SQL", "Python", "Power BI", "Data Analysis", "Agile", "Excel"],
        description: "Analyze business metrics, design technological roadmaps, and assist enterprise cloud deployments."
      },
      {
        title: "Cyber Risk & Cloud Security Consultant",
        type: "Full-Time",
        location: "Bengaluru, Mumbai",
        experienceReq: "2+ years",
        skills: ["Cyber Security", "AWS", "Azure", "Cloud Security", "Risk Assessment", "Linux"],
        description: "Assess enterprise vulnerability postures and implement Zero-Trust security frameworks."
      }
    ]
  },
  {
    id: "accenture",
    name: "Accenture",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg",
    domain: "Management Consulting & Tech",
    tier: "Global Tech Consulting",
    size: "730,000+ employees",
    headquarters: "Dublin, Ireland / Global",
    hiringStatus: "Actively Hiring",
    description: "Fortune Global 500 company specializing in information technology services and management consulting.",
    careerUrl: "https://accenture.com/careers",
    salaryRange: "$75,000 - $135,000 / ₹8 - ₹20 LPA",
    requiredSkills: [
      "Java", "React", "Node.js", "AWS", "Azure", "SAP",
      "Salesforce", "Python", "SQL", "DevOps", "Microservices", "Agile"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Application Development Associate",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad, Pune, Kolkata",
        experienceReq: "0-2 years",
        skills: ["Java", "React", "SQL", "HTML5", "CSS", "Git"],
        description: "Design front-end and back-end logic for enterprise web applications."
      },
      {
        title: "Cloud Solutions Architect",
        type: "Full-Time",
        location: "Gurugram, Bengaluru",
        experienceReq: "3+ years",
        skills: ["AWS", "Azure", "Node.js", "Docker", "Microservices", "Python"],
        description: "Architect multi-cloud solutions for global retail and telecom leaders."
      }
    ]
  },
  {
    id: "cisco",
    name: "Cisco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg",
    domain: "Networking & Cyber Security",
    tier: "Enterprise Hardware & Software",
    size: "84,000+ employees",
    headquarters: "San Jose, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Worldwide leader in networking gear, cybersecurity products, cloud security platforms, and IoT hardware.",
    careerUrl: "https://jobs.cisco.com",
    salaryRange: "$95,000 - $175,000 / ₹14 - ₹32 LPA",
    requiredSkills: [
      "C", "C++", "Python", "Networking", "Linux", "Kubernetes",
      "Cyber Security", "Go", "Docker", "System Design", "TCP/IP"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Engineer - Networking & Cloud",
        type: "Full-Time",
        location: "Bengaluru / San Jose",
        experienceReq: "0-3 years",
        skills: ["Python", "C++", "Networking", "Linux", "TCP/IP", "Docker"],
        description: "Build SDN controller software and high-throughput router packet engines."
      },
      {
        title: "Cyber Security Software Developer",
        type: "Full-Time",
        location: "Bengaluru",
        experienceReq: "2+ years",
        skills: ["Cyber Security", "Python", "Go", "Kubernetes", "Linux", "C++"],
        description: "Develop threat defense intelligence systems and cloud security microservices."
      }
    ]
  },
  {
    id: "oracle",
    name: "Oracle",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    domain: "Database & Enterprise Cloud (OCI)",
    tier: "Enterprise Tech Giant",
    size: "164,000+ employees",
    headquarters: "Austin, TX, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Database market leader powering high-performance Oracle Cloud Infrastructure (OCI) and enterprise ERP.",
    careerUrl: "https://oracle.com/careers",
    salaryRange: "$100,000 - $180,000 / ₹15 - ₹35 LPA",
    requiredSkills: [
      "Java", "SQL", "Oracle Cloud", "Linux", "C++", "Microservices",
      "PL/SQL", "Python", "Kubernetes", "Distributed Systems", "Data Structures & Algorithms"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "OCI Software Development Engineer",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad / Austin",
        experienceReq: "1-4 years",
        skills: ["Java", "C++", "Linux", "Distributed Systems", "SQL", "Python"],
        description: "Build high availability cloud compute, block storage, and SDN network control planes."
      },
      {
        title: "Database Performance Engineer",
        type: "Full-Time",
        location: "Hyderabad",
        experienceReq: "2+ years",
        skills: ["SQL", "PL/SQL", "C++", "Linux", "Oracle Cloud", "Python"],
        description: "Optimize autonomous database engines and SQL query optimizer pipelines."
      }
    ]
  },
  {
    id: "sap",
    name: "SAP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg",
    domain: "Enterprise Resource Planning (ERP)",
    tier: "Enterprise Tech Giant",
    size: "105,000+ employees",
    headquarters: "Walldorf, Germany / Global",
    hiringStatus: "Actively Hiring",
    description: "Global standard in ERP software powering supply chains, financial operations, and enterprise business intelligence.",
    careerUrl: "https://jobs.sap.com",
    salaryRange: "$90,000 - $160,000 / ₹12 - ₹28 LPA",
    requiredSkills: [
      "Java", "Node.js", "SAP HANA", "TypeScript", "React", "Enterprise Software",
      "Python", "SQL", "ABAP", "Cloud Security", "Microservices"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Cloud Application Developer",
        type: "Full-Time",
        location: "Bengaluru / Walldorf",
        experienceReq: "0-3 years",
        skills: ["Node.js", "Java", "TypeScript", "React", "SQL", "SAP HANA"],
        description: "Develop cloud native microservices on SAP Business Technology Platform (BTP)."
      }
    ]
  },
  {
    id: "capgemini",
    name: "Capgemini",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_2017_logo.svg",
    domain: "IT Services & Engineering",
    tier: "IT Services Giant",
    size: "350,000+ employees",
    headquarters: "Paris, France / Global",
    hiringStatus: "Actively Hiring",
    description: "Multinational information technology services and consulting company headquartered in Paris.",
    careerUrl: "https://capgemini.com/careers",
    salaryRange: "$55,000 - $105,000 / ₹5 - ₹15 LPA",
    requiredSkills: [
      "Java", "Angular", "Docker", "Kubernetes", "SQL", "Power BI",
      "Python", "Spring Boot", "Selenium", "DevOps"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Software Engineer - Full Stack",
        type: "Full-Time",
        location: "Mumbai, Pune, Bengaluru",
        experienceReq: "0-2 years",
        skills: ["Java", "Spring Boot", "Angular", "SQL", "Git"],
        description: "Develop scalable customer-facing applications for global European banking clients."
      }
    ]
  },
  {
    id: "cognizant",
    name: "Cognizant",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/77/Cognizant_logo_2022.svg",
    domain: "IT & Healthcare Tech Services",
    tier: "IT Services Giant",
    size: "345,000+ employees",
    headquarters: "Teaneck, NJ, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "American multinational technology company providing IT services, digital, technology, and operations.",
    careerUrl: "https://cognizant.com/careers",
    salaryRange: "$55,000 - $110,000 / ₹5.5 - ₹15 LPA",
    requiredSkills: [
      "Java", "Python", "AWS", "React", "Selenium", "SQL",
      "Spring Boot", "Microservices", "DevOps", "HTML5"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Programmer Analyst",
        type: "Full-Time",
        location: "Chennai, Hyderabad, Coimbatore",
        experienceReq: "0-2 years",
        skills: ["Java", "Python", "React", "SQL", "AWS"],
        description: "Work on cloud application modernizations for healthcare and retail enterprises."
      }
    ]
  },
  {
    id: "wipro",
    name: "Wipro",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    domain: "IT Services & Business Process",
    tier: "IT Services Giant",
    size: "240,000+ employees",
    headquarters: "Bengaluru, India / Global",
    hiringStatus: "Actively Hiring",
    description: "Leading technology services and consulting company focused on building innovative solutions.",
    careerUrl: "https://wipro.com/careers",
    salaryRange: "$50,000 - $95,000 / ₹4.5 - ₹13 LPA",
    requiredSkills: [
      "Java", "Python", "React", "Security", "AWS", "Jenkins",
      "SQL", "Spring Boot", "HTML5", "CSS"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Project Engineer",
        type: "Full-Time",
        location: "Bengaluru, Pune, Chennai",
        experienceReq: "0-2 years",
        skills: ["Java", "Python", "SQL", "HTML5", "CSS"],
        description: "Implement web portals and integrate REST services."
      }
    ]
  },
  {
    id: "ey",
    name: "Ernst & Young (EY)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg",
    domain: "Financial Advisory & Risk Tech",
    tier: "Big 4 Consulting",
    size: "400,000+ employees",
    headquarters: "London, UK / Global",
    hiringStatus: "Actively Hiring",
    description: "Multinational professional services firm offering assurance, tax, transaction, and tech advisory.",
    careerUrl: "https://ey.com/careers",
    salaryRange: "$75,000 - $140,000 / ₹8 - ₹22 LPA",
    requiredSkills: [
      "SQL", "Python", "Power BI", "Cyber Security", "Cloud Governance", "Excel",
      "Data Analysis", "Agile", "Financial Tech"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Technology Risk Analyst",
        type: "Full-Time",
        location: "Bengaluru, Gurugram, Mumbai",
        experienceReq: "0-2 years",
        skills: ["SQL", "Power BI", "Data Analysis", "Excel", "Cyber Security"],
        description: "Evaluate IT system controls and automate risk analytics dashboards."
      }
    ]
  },
  {
    id: "pwc",
    name: "PwC (PricewaterhouseCoopers)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/PwC_logo.svg",
    domain: "Consulting & Audit Tech",
    tier: "Big 4 Consulting",
    size: "364,000+ employees",
    headquarters: "London, UK / Global",
    hiringStatus: "Actively Hiring",
    description: "Global leader in audit, tax, and technology consulting for international corporate clients.",
    careerUrl: "https://pwc.com/careers",
    salaryRange: "$78,000 - $142,000 / ₹8.5 - ₹23 LPA",
    requiredSkills: [
      "Python", "SQL", "Azure", "Power BI", "ETL", "Enterprise Architecture",
      "Data Analysis", "Project Management"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Digital & Data Transformation Consultant",
        type: "Full-Time",
        location: "Kolkata, Bengaluru, Mumbai",
        experienceReq: "1-3 years",
        skills: ["Python", "SQL", "Azure", "ETL", "Power BI"],
        description: "Help enterprise clients clean, transform, and leverage big data assets."
      }
    ]
  },
  {
    id: "kpmg",
    name: "KPMG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/KPMG_logo.svg",
    domain: "Consulting & Cyber Advisory",
    tier: "Big 4 Consulting",
    size: "270,000+ employees",
    headquarters: "Amstelveen, Netherlands / Global",
    hiringStatus: "Actively Hiring",
    description: "Professional services network providing financial audit, tax, and technological advisory.",
    careerUrl: "https://kpmg.com/careers",
    salaryRange: "$75,000 - $138,000 / ₹8 - ₹21 LPA",
    requiredSkills: [
      "Python", "SQL", "Cyber Security", "Power BI", "Risk Assessment", "Excel",
      "Data Analysis"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Cyber Security Associate",
        type: "Full-Time",
        location: "Gurugram, Bengaluru",
        experienceReq: "0-2 years",
        skills: ["Cyber Security", "Linux", "Python", "Networking", "SQL"],
        description: "Conduct network penetration testing and security posture audits."
      }
    ]
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase & Co.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg",
    domain: "Banking & FinTech",
    tier: "Wall Street Financial Giant",
    size: "300,000+ employees",
    headquarters: "New York, NY, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "America's largest bank leading investment banking, payment platforms, and high-frequency trading technology.",
    careerUrl: "https://jpmorganchase.com/careers",
    salaryRange: "$105,000 - $185,000 / ₹16 - ₹38 LPA",
    requiredSkills: [
      "Java", "Python", "Spring Boot", "React", "SQL", "C++",
      "Kubernetes", "Microservices", "Data Structures & Algorithms", "Kafka"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Engineer - FinTech Platform",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad, Mumbai",
        experienceReq: "0-3 years",
        skills: ["Java", "Spring Boot", "Python", "SQL", "Microservices", "Data Structures & Algorithms"],
        description: "Develop ultra-low latency transaction processing services and banking API gateways."
      },
      {
        title: "Quantitative Analytics Engineer",
        type: "Full-Time",
        location: "Mumbai, Bengaluru",
        experienceReq: "1-4 years",
        skills: ["Python", "C++", "SQL", "Data Analysis", "Machine Learning", "Mathematics"],
        description: "Build risk pricing algorithms and algorithmic trading execution tools."
      }
    ]
  },
  {
    id: "goldmansachs",
    name: "Goldman Sachs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg",
    domain: "Investment Banking & Quant Tech",
    tier: "Wall Street Financial Giant",
    size: "45,000+ employees",
    headquarters: "New York, NY, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Global investment banking, securities, and investment management firm with cutting edge financial engineering.",
    careerUrl: "https://goldmansachs.com/careers",
    salaryRange: "$115,000 - $195,000 / ₹18 - ₹42 LPA",
    requiredSkills: [
      "Java", "C++", "Python", "SQL", "Microservices", "React",
      "Linux", "Data Structures & Algorithms", "System Design", "Kafka"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Technology Analyst (SDE)",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad / New York",
        experienceReq: "0-2 years",
        skills: ["Java", "C++", "Python", "Data Structures & Algorithms", "SQL"],
        description: "Build core trade flow execution software and digital banking backends."
      }
    ]
  },
  {
    id: "morganstanley",
    name: "Morgan Stanley",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/34/Morgan_Stanley_Logo_1.svg",
    domain: "Investment Banking & Wealth Tech",
    tier: "Wall Street Financial Giant",
    size: "80,000+ employees",
    headquarters: "New York, NY, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "American multinational investment bank and financial services company headquartered in Midtown Manhattan.",
    careerUrl: "https://morganstanley.com/careers",
    salaryRange: "$100,000 - $180,000 / ₹15 - ₹35 LPA",
    requiredSkills: [
      "Java", "Python", "SQL", "Angular", "C++", "Linux",
      "Security", "Spring Boot", "Data Structures & Algorithms"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Technology Associate",
        type: "Full-Time",
        location: "Mumbai, Bengaluru",
        experienceReq: "0-3 years",
        skills: ["Java", "Spring Boot", "Python", "SQL", "Linux"],
        description: "Develop global wealth management platforms and financial reporting pipelines."
      }
    ]
  },
  {
    id: "samsung",
    name: "Samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    domain: "Consumer Electronics & Mobile Tech",
    tier: "Tier-1 Tech",
    size: "270,000+ employees",
    headquarters: "Suwon, South Korea / Global",
    hiringStatus: "Actively Hiring",
    description: "South Korean multinational major in smartphones (Galaxy), semiconductors, Smart TVs, and AI camera vision.",
    careerUrl: "https://samsung.com/careers",
    salaryRange: "$90,000 - $165,000 / ₹14 - ₹32 LPA",
    requiredSkills: [
      "Kotlin", "Java", "C++", "Android", "TensorFlow", "Python",
      "Computer Vision", "Linux", "Data Structures & Algorithms", "Embedded Systems"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Android & Mobile Software Engineer",
        type: "Full-Time",
        location: "Bengaluru, Noida / Suwon",
        experienceReq: "0-3 years",
        skills: ["Kotlin", "Java", "Android", "C++", "Data Structures & Algorithms"],
        description: "Write core system components and camera algorithms for One UI and Galaxy devices."
      }
    ]
  },
  {
    id: "adobe",
    name: "Adobe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_2017.svg",
    domain: "Creative Software & Digital Media",
    tier: "Tier-1 Tech",
    size: "29,000+ employees",
    headquarters: "San Jose, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Creator of Photoshop, Illustrator, Acrobat PDF, Premiere Pro, Firefly AI, and Experience Cloud.",
    careerUrl: "https://adobe.com/careers",
    salaryRange: "$110,000 - $190,000 / ₹18 - ₹40 LPA",
    requiredSkills: [
      "C++", "JavaScript", "React", "WebAssembly", "Python", "Machine Learning",
      "System Design", "UI / UX", "Data Structures & Algorithms"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Software Engineer (Creative Cloud)",
        type: "Full-Time",
        location: "Noida, Bengaluru / San Jose",
        experienceReq: "0-3 years",
        skills: ["C++", "JavaScript", "React", "Data Structures & Algorithms", "WebAssembly"],
        description: "Engineer high-performance graphics engine rendering modules for Web Creative Cloud."
      }
    ]
  },
  {
    id: "salesforce",
    name: "Salesforce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    domain: "CRM & Enterprise Cloud",
    tier: "Enterprise Tech Giant",
    size: "79,000+ employees",
    headquarters: "San Francisco, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "World leader in customer relationship management (CRM) cloud, Einstein AI, Slack, and Tableau.",
    careerUrl: "https://salesforce.com/careers",
    salaryRange: "$110,000 - $185,000 / ₹16 - ₹36 LPA",
    requiredSkills: [
      "Java", "Apex", "Lightning", "Web Components", "Python", "AWS",
      "JavaScript", "Microservices", "System Design"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Software Engineer - Core Cloud",
        type: "Full-Time",
        location: "Hyderabad, Bengaluru / San Francisco",
        experienceReq: "1-4 years",
        skills: ["Java", "JavaScript", "React", "SQL", "Microservices", "AWS"],
        description: "Build multi-tenant cloud application infrastructure powering millions of businesses."
      }
    ]
  },
  {
    id: "intel",
    name: "Intel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg",
    domain: "Semiconductors & Chip Tech",
    tier: "Hardware & Tech Giant",
    size: "124,000+ employees",
    headquarters: "Santa Clara, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Pioneer of x86 microprocessor architecture, semiconductor fabrication, and AI silicon software enablement.",
    careerUrl: "https://jobs.intel.com",
    salaryRange: "$95,000 - $170,000 / ₹14 - ₹32 LPA",
    requiredSkills: [
      "C", "C++", "Python", "Linux", "FPGA", "SystemVerilog",
      "Deep Learning", "Embedded Systems", "Compiler Tech"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Software System Engineer",
        type: "Full-Time",
        location: "Bengaluru / Santa Clara",
        experienceReq: "0-3 years",
        skills: ["C++", "C", "Python", "Linux", "Embedded Systems"],
        description: "Optimize device drivers, AI compiler toolchains (OneAPI), and kernel modules."
      }
    ]
  },
  {
    id: "nvidia",
    name: "Nvidia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
    domain: "AI Computing & GPU Hardware",
    tier: "Tier-1 Tech",
    size: "29,000+ employees",
    headquarters: "Santa Clara, CA, USA / Global",
    hiringStatus: "High Growth Hiring",
    description: "Dominant leader in GPU computing, CUDA software, AI supercomputers, and autonomous omniverse systems.",
    careerUrl: "https://nvidia.com/careers",
    salaryRange: "$130,000 - $240,000 / ₹22 - ₹55 LPA",
    requiredSkills: [
      "C++", "CUDA", "Python", "Deep Learning", "PyTorch", "Linux",
      "System Architecture", "Computer Vision", "Parallel Programming"
    ],
    experienceTiers: ["Mid-Level (2-5 yrs)", "Senior (5+ yrs)"],
    activePositions: [
      {
        title: "CUDA Software Engineer",
        type: "Full-Time",
        location: "Bengaluru, Pune / Santa Clara",
        experienceReq: "2+ years",
        skills: ["C++", "CUDA", "Parallel Programming", "Python", "Linux", "Data Structures & Algorithms"],
        description: "Accelerate deep learning library primitives and parallel computing CUDA kernels."
      }
    ]
  },
  {
    id: "uber",
    name: "Uber",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    domain: "Mobility & Delivery Tech",
    tier: "Tier-1 Tech",
    size: "30,000+ employees",
    headquarters: "San Francisco, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Global ridesharing, Uber Eats food delivery, and logistics network powered by real-time spatial algorithms.",
    careerUrl: "https://uber.com/careers",
    salaryRange: "$115,000 - $195,000 / ₹18 - ₹42 LPA",
    requiredSkills: [
      "Go", "Java", "Python", "React Native", "Distributed Systems", "Kafka",
      "SQL", "Microservices", "System Design"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Backend Software Engineer",
        type: "Full-Time",
        location: "Bengaluru, Hyderabad / San Francisco",
        experienceReq: "1-4 years",
        skills: ["Go", "Java", "Distributed Systems", "Kafka", "Microservices", "SQL"],
        description: "Build ultra-reliable matching and dynamic pricing engines for global trips."
      }
    ]
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    domain: "Streaming & Entertainment Tech",
    tier: "Tier-1 Tech",
    size: "13,000+ employees",
    headquarters: "Los Gatos, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "World's leading streaming entertainment service with 270+ million paid memberships across 190 countries.",
    careerUrl: "https://jobs.netflix.com",
    salaryRange: "$140,000 - $260,000 / ₹25 - ₹60 LPA",
    requiredSkills: [
      "Java", "Node.js", "React", "AWS", "Spinnaker", "Kafka",
      "GraphQL", "Distributed Systems", "Microservices"
    ],
    experienceTiers: ["Senior (5+ yrs)"],
    activePositions: [
      {
        title: "Senior Cloud Platform Engineer",
        type: "Full-Time",
        location: "Remote / Los Gatos",
        experienceReq: "4+ years",
        skills: ["Java", "AWS", "Kafka", "Node.js", "Microservices", "System Design"],
        description: "Architect global video delivery mesh networks and cloud streaming pipelines."
      }
    ]
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    domain: "FinTech & Payments",
    tier: "Financial Tech Giant",
    size: "27,000+ employees",
    headquarters: "San Jose, CA, USA / Global",
    hiringStatus: "Actively Hiring",
    description: "Digital payments pioneer operating PayPal, Venmo, Braintree, and Xoom payment gateways.",
    careerUrl: "https://paypal.com/careers",
    salaryRange: "$100,000 - $175,000 / ₹15 - ₹35 LPA",
    requiredSkills: [
      "Java", "Node.js", "React", "Python", "SQL", "Machine Learning",
      "Security", "Microservices", "REST APIs"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Full Stack Engineer (Payments)",
        type: "Full-Time",
        location: "Chennai, Bengaluru / San Jose",
        experienceReq: "1-3 years",
        skills: ["Java", "Node.js", "React", "SQL", "REST APIs", "Git"],
        description: "Design checkout flow web portals and robust payment authorization backends."
      }
    ]
  },
  {
    id: "siemens",
    name: "Siemens",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg",
    domain: "Industrial Automation & IoT",
    tier: "Industrial Tech Giant",
    size: "320,000+ employees",
    headquarters: "Munich, Germany / Global",
    hiringStatus: "Actively Hiring",
    description: "German multinational technology conglomerate focused on industry, infrastructure, transport, and healthcare.",
    careerUrl: "https://jobs.siemens.com",
    salaryRange: "$70,000 - $130,000 / ₹8 - ₹20 LPA",
    requiredSkills: [
      "C++", "Python", "IoT", "Azure", "Java", "Linux",
      "Embedded Systems", "C#", "SQL"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Industrial Cloud & IoT Software Developer",
        type: "Full-Time",
        location: "Bengaluru, Pune / Munich",
        experienceReq: "0-3 years",
        skills: ["C++", "Python", "IoT", "Azure", "Linux", "C#"],
        description: "Connect smart factory machinery and build cloud analytics dashboards for industrial IoT."
      }
    ]
  },
  {
    id: "bmw",
    name: "BMW Group",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
    domain: "Automotive & Mobility Tech",
    tier: "Automotive Giant",
    size: "150,000+ employees",
    headquarters: "Munich, Germany / Global",
    hiringStatus: "Actively Hiring",
    description: "Premium automotive manufacturer leading electric vehicles (iX series), autonomous driving, and connected vehicle cloud.",
    careerUrl: "https://bmwgroup.jobs",
    salaryRange: "$75,000 - $140,000 / ₹10 - ₹22 LPA",
    requiredSkills: [
      "C++", "Python", "ROS", "React", "Cloud", "Automotive Systems",
      "Embedded Systems", "Linux", "C#"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Connected Car Software Developer",
        type: "Full-Time",
        location: "Pune, Bengaluru / Munich",
        experienceReq: "1-4 years",
        skills: ["Python", "C++", "Cloud", "Linux", "React", "Rest APIs"],
        description: "Build telematics backends and in-car infotainment mobile integration applications."
      }
    ]
  },
  {
    id: "bosch",
    name: "Bosch",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/16/Bosch-Logo.svg",
    domain: "Automotive & Engineering Tech",
    tier: "Industrial & Auto Giant",
    size: "420,000+ employees",
    headquarters: "Gerlingen, Germany / Global",
    hiringStatus: "Actively Hiring",
    description: "Leading global supplier of technology and services across Mobility Solutions, Industrial Tech, and Building Tech.",
    careerUrl: "https://bosch.com/careers",
    salaryRange: "$65,000 - $125,000 / ₹7 - ₹18 LPA",
    requiredSkills: [
      "C", "C++", "Python", "Linux", "Machine Learning", "Microcontrollers",
      "Embedded Systems", "CAN Bus", "AUTOSAR"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Embedded Software Engineer",
        type: "Full-Time",
        location: "Bengaluru, Coimbatore",
        experienceReq: "0-3 years",
        skills: ["C", "C++", "Microcontrollers", "Linux", "Python", "Embedded Systems"],
        description: "Write AUTOSAR compliant ECU firmware for electric vehicle powertrain modules."
      }
    ]
  },
  {
    id: "atlassian",
    name: "Atlassian",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Atlassian-logo-bdf.svg",
    domain: "Developer Tools & Enterprise Cloud",
    tier: "Tier-1 Tech",
    size: "11,000+ employees",
    headquarters: "Sydney, Australia / Remote Global",
    hiringStatus: "Actively Hiring",
    description: "Maker of Jira, Confluence, Trello, and Bitbucket powering modern agile teams worldwide.",
    careerUrl: "https://atlassian.com/careers",
    salaryRange: "$110,000 - $185,000 / ₹17 - ₹38 LPA",
    requiredSkills: [
      "Java", "TypeScript", "React", "AWS", "Docker", "Kubernetes",
      "Node.js", "GraphQL", "Microservices"
    ],
    experienceTiers: ["Fresher (0-2 yrs)", "Mid-Level (2-5 yrs)"],
    activePositions: [
      {
        title: "Full Stack Engineer (Jira Cloud)",
        type: "Full-Time",
        location: "Bengaluru / Remote",
        experienceReq: "1-4 years",
        skills: ["Java", "TypeScript", "React", "AWS", "Node.js", "GraphQL"],
        description: "Develop seamless user workflows and cloud backend services for millions of Jira software users."
      }
    ]
  }
];

module.exports = { MNC_DATABASE };
