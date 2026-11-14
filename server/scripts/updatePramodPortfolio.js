import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function updatePramodPortfolio() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Portfolio = mongoose.model("Portfolio", new mongoose.Schema({}, { strict: false }));
  
  const updated = await Portfolio.findByIdAndUpdate(
    "6ac50d42b79658e9ac3e6586",
    {
      $set: {
        title: "Pramod Garg - Chief Manager F&A and HR",
        name: "Pramod Garg",
        tagline: "Chief Manager F&A and HR at LYONS ENGINEERING PVT. LTD specializing in Corporate Finance, Statutory Compliances & Human Resources.",
        about: "I am an accomplished Chief Manager of Finance & Accounts (F&A) and Human Resources with over two decades of executive leadership in the engineering and oil & gas infrastructure sectors. Known for impeccable statutory compliance, strategic audit management, financial structuring, and high-impact talent operations.",
        description: "I am an accomplished Chief Manager of Finance & Accounts (F&A) and Human Resources with over two decades of executive leadership in the engineering and oil & gas infrastructure sectors. Known for impeccable statutory compliance, strategic audit management, financial structuring, and high-impact talent operations.",
        targetRole: "Chief Manager F&A and HR",
        targetCompany: "LYONS ENGINEERING PVT. LTD",
        skills: [
          "Statutory Compliances",
          "Payroll Management",
          "HR Policies",
          "Performance Management",
          "Talent Acquisition & Recruitment",
          "Audit Management",
          "Taxation & Compliance",
          "Accounts Receivable (AR)",
          "Accounts Payable (AP)",
          "Financial Analysis",
          "Microsoft Office",
          "Oil & Gas",
          "Engineering Operations",
        ],
        experience: [
          {
            role: "Chief Manager F&A and HR",
            company: "LYONS ENGINEERING PVT. LTD",
            duration: "Nov 2018 - Present (8 yrs)",
            description: "Directing full-spectrum corporate finance, accounting, statutory compliance, and human resources operations.",
            highlights: [
              "Overseeing statutory compliances, taxation, internal & external audit management, and corporate financial reporting.",
              "Directing HR policies, organizational development, executive talent acquisition, and performance management systems.",
              "Managing comprehensive accounts payable, accounts receivable, and payroll infrastructure across cross-functional engineering teams.",
            ],
          },
          {
            role: "Assistant Manager",
            company: "Wood Group Kenny India Pvt. Ltd.",
            duration: "Feb 2008 - Nov 2018 (10 yrs 10 mos)",
            description: "Managed financial accounting, auditing, and compliance operations for international engineering consultancy projects.",
            highlights: [
              "Led financial accounting, ledger reconciliation, and project-based expenditure control.",
              "Administered multi-state taxation filings, compliance audits, and statutory certifications.",
              "Collaborated with international project leads to ensure budgeting accuracy and contract adherence in oil & gas projects.",
            ],
          },
          {
            role: "Account Executive",
            company: "HEIRLOOM COLLECTIONS PRIVATE LIMITED",
            duration: "Jan 2005 - Feb 2008 (3 yrs 2 mos)",
            description: "Handled day-to-day financial accounting, vendor reconciliations, and commercial compliance.",
            highlights: [
              "Maintained company balance sheets, cash flow statements, and statutory audit registers.",
              "Managed vendor payables, billing verification, and accounts receivable settlements.",
            ],
          },
          {
            role: "Audit Manager",
            company: "D. Bhatia & Company",
            duration: "Jan 2002 - Dec 2004 (3 yrs)",
            description: "Conducted statutory, internal, and tax audits for diverse corporate and commercial clients.",
            highlights: [
              "Supervised audit teams in executing comprehensive tax compliance reviews and financial statement audits.",
              "Prepared statutory audit reports, tax documentation, and compliance filings for regulatory authorities.",
            ],
          },
          {
            role: "CA Training (Article Clerk)",
            company: "D. Bhatia & Company",
            duration: "Jan 1999 - Dec 2001 (3 yrs)",
            description: "Chartered Accountancy articleship training covering taxation, accounting, and company audit procedures.",
            highlights: [
              "Conducted extensive voucher verification, book-keeping audits, and bank reconciliations.",
              "Assisted in income tax computation, VAT filings, and statutory client compliance.",
            ],
          },
        ],
        education: [
          {
            institution: "Chaudhary Charan Singh University Meerut",
            degree: "Bachelor of Commerce - BCom in Business/Commerce",
            year: "1995 - 1998",
          },
          {
            institution: "Shri Krishan Inter College, Baleni, Meerut",
            degree: "Senior Secondary Education (Biology/Biological Sciences)",
            year: "1993 - 1995",
          },
          {
            institution: "Shri Krishna Inter College, Baleni, Meerut",
            degree: "Higher Secondary Education (General Studies)",
            year: "1991 - 1993",
          },
        ],
        projects: [
          {
            title: "Corporate Statutory Compliance & Tax Modernization",
            description: "Engineered streamlined audit and taxation frameworks ensuring 100% regulatory compliance and zero penalty adherence across engineering operations.",
            tags: ["Statutory Compliance", "Taxation", "Audit Management", "Financial Analysis"],
            impact: "Saved audit cycle time by 35% through standardized reconciliation registers and automated filing checks.",
          },
          {
            title: "Integrated HR & Payroll Infrastructure Overhaul",
            description: "Spearheaded end-to-end restructuring of corporate HR policies, talent acquisition pipelines, and monthly payroll disbursement systems.",
            tags: ["Payroll Management", "HR Policies", "Talent Acquisition", "Performance Management"],
            impact: "Boosted employee onboarding efficiency and ensured 100% on-time statutory PF, ESI, and TDS remittances.",
          },
          {
            title: "Oil & Gas Engineering Financial Control System",
            description: "Structured expenditure monitoring and vendor billing reconciliation pipelines for large-scale energy infrastructure projects.",
            tags: ["Accounts Payable", "Accounts Receivable", "Engineering Operations", "Financial Control"],
            impact: "Enhanced working capital liquidity and reduced vendor payment turnaround cycles by 25%.",
          },
        ],
        "hero.name": "Pramod Garg",
        "hero.title": "Chief Manager F&A and HR",
        "hero.tagline": "Chief Manager F&A and HR at LYONS ENGINEERING PVT. LTD specializing in Corporate Finance, Statutory Compliances & Human Resources.",
      },
    },
    { new: true }
  );

  console.log("Updated portfolio successfully!");
  console.log("Title:", updated.title);
  console.log("Experiences count:", updated.experience?.length);
  process.exit(0);
}

updatePramodPortfolio().catch((err) => {
  console.error("Update error:", err);
  process.exit(1);
});
