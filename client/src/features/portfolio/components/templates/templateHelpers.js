// Utility helper functions for portfolio templates and document rendering

export const synthesizeEfficientAbout = (rawAbout = "", options = {}) => {
  if (!rawAbout || typeof rawAbout !== "string") return "";

  // 1. Normalize Unicode (e.g., converts 𝗪𝗵𝗮𝘁 𝗜 𝗕𝘂𝗶𝗹𝗱 to "What I Build")
  const text = rawAbout.normalize("NFKC").trim();
  if (text.length < 25) return text;

  // 2. Identify common section headers used in LinkedIn / Resumes
  const sectionHeaderRegex = /(?:^|\n)\s*(?:(?:🚀|📌|💼|🛠️?|🎯|💡|🧠|📬|⭐)\s*)?(What\s*I\s*(?:Build|am\s*doing|Do|have\s*built)|Featured\s*Projects|Projects(?:\s*I've\s*Built)?|How\s*I\s*Think|Coding\s*Profiles|Competitive\s*Programming|Problem\s*Solving|Technical\s*Skills|Tech\s*Stack|Core\s*Competencies|Skills(?:\s*&\s*Tools)?|Tools\s*&\s*Technologies|Career\s*Goals?|Career\s*Objective|Objective|Current\s*Focus|Looking\s*For|Strengths|Core\s*Strengths|Key\s*Strengths|Mindset|My\s*Philosophy|Philosophy|Vision|Approach|Let's\s*Connect|Get\s*in\s*Touch|Contact(?:\s*Me)?|Reach\s*Out|Open\s*to|Education|Work\s*Experience|Experience|Certifications)\b\s*[:—–-]?\s*/gi;

  const sections = [];
  let match;
  while ((match = sectionHeaderRegex.exec(text)) !== null) {
    sections.push({
      header: match[1].toLowerCase().replace(/\s+/g, " ").trim(),
      index: match.index,
      headerLength: match[0].length,
    });
  }

  // 3. Extract Intro (text before the first section header)
  let intro;
  if (sections.length > 0) {
    intro = text.slice(0, sections[0].index).trim();
  } else {
    const firstBullet = text.search(/(?:^|\n)\s*(?:[•*-]|📌|🔹)\s*/);
    if (firstBullet > 25) {
      intro = text.slice(0, firstBullet).trim();
    } else {
      intro = text;
    }
  }

  intro = intro
    .replace(/^(?:👨‍💻|👩‍💻|🚀|👋|💼|✨|🔥|\s)+/u, "")
    .replace(/[\s\r\n]+/g, " ")
    .trim();

  // 4. Extract Mindset or Career Goal if available
  let mindsetText = "";
  let careerGoalText = "";

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const nextIndex = sections[i + 1] ? sections[i + 1].index : text.length;
    const content = text.slice(sec.index + sec.headerLength, nextIndex).trim();

    if (/mindset|philosophy|vision|approach/i.test(sec.header)) {
      mindsetText = content.split(/\n/)[0].replace(/^[-•*]\s*/, "").trim();
    } else if (/career\s*goal|objective|current\s*focus/i.test(sec.header)) {
      careerGoalText = content.split(/\n/)[0].replace(/^[-•*]\s*/, "").trim();
    }
  }

  // 5. Synthesize clean executive bio
  let efficientAbout;

  if (intro && intro.length >= 30) {
    efficientAbout = intro;
    if (mindsetText && mindsetText.length >= 20 && mindsetText.length <= 220) {
      if (!efficientAbout.toLowerCase().includes(mindsetText.slice(0, 20).toLowerCase())) {
        efficientAbout += ` ${mindsetText}`;
      }
    } else if (careerGoalText && careerGoalText.length >= 20 && careerGoalText.length <= 180 && efficientAbout.length < 240) {
      if (!efficientAbout.toLowerCase().includes(careerGoalText.slice(0, 20).toLowerCase())) {
        const goalClean = careerGoalText.replace(/^Targeting\s+/i, "Currently focused on ");
        efficientAbout += ` ${goalClean}`;
      }
    }
  } else if (mindsetText && careerGoalText) {
    efficientAbout = `${careerGoalText} ${mindsetText}`;
  } else if (mindsetText) {
    efficientAbout = mindsetText;
  } else {
    const cleanLines = text.split(/\n/).map((l) => l.trim()).filter((l) => l && !/^[•*-]/.test(l));
    efficientAbout = cleanLines.slice(0, 2).join(" ");
  }

  efficientAbout = efficientAbout
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/[•*]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const candidateName = options.name || "";
  if (candidateName && typeof candidateName === "string") {
    const escapedName = candidateName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    efficientAbout = efficientAbout
      .replace(new RegExp(`^${escapedName}\\s+is\\s+(an?|the)?\\s*`, "i"), (m, art) => art ? `I am ${art} ` : "I am ")
      .replace(new RegExp(`^${escapedName}\\s+has\\s+`, "i"), "I have ")
      .replace(new RegExp(`^${escapedName}\\s+leads?\\s+`, "i"), "I lead ")
      .replace(new RegExp(`^${escapedName}\\s+brings?\\s+`, "i"), "I bring ")
      .replace(new RegExp(`^${escapedName}\\s+specializes?\\s+in\\s+`, "i"), "I specialize in ");
  }

  if (/^(?:A\s+)?(?:Computer\s+Science|Software|Civil|Mechanical|Full\s*Stack|Frontend|Backend|Data)\s+(?:undergraduate|graduate|engineer|developer|specialist|student)\b/i.test(efficientAbout)) {
    efficientAbout = efficientAbout.replace(/^(?:A\s+)?/i, "I am a ");
  }

  return efficientAbout.trim();
};

export const extractAchievementsFromAbout = (aboutText = "") => {
  if (!aboutText || typeof aboutText !== "string") return [];
  const achievements = [];
  const normalizedText = aboutText.normalize("NFKC").replace(/((?:🏆|🥇|🥈|🥉|🎯|💡|📌|🔹|[•*]))\s*/gu, "\n$1 ");
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);
  let inSection = false;

  for (const line of lines) {
    const isSectionHeader = line.length <= 35 && /\b(?:beyond the code|achievements|honors|awards|recognitions|hackathons|how i think|coding profiles|competitive programming|problem solving)\b/i.test(line) && !/—|–|\||\d+\s*(?:rating|contest|\+)/i.test(line);
    if (isSectionHeader) {
      inSection = true;
      continue;
    }
    if (inSection && /\b(?:what i'm doing|what i build|experience|projects|education|certifications|contact|technical skills|tech stack|career goals?|mindset|strengths|let's connect)\b/i.test(line)) {
      inSection = false;
      continue;
    }

    const hasHonorIcon = /^(?:🏆|🥇|🥈|🥉|🎯|💡|📌|🔹|•|\*|-)\s*/.test(line);
    if (inSection || hasHonorIcon) {
      const cleanLine = line.replace(/^(?:🏆|🥇|🥈|🥉|🎯|💡|📌|🔹|•|\*|-)\s*/, "").trim();
      if (cleanLine.length >= 8 && cleanLine.length <= 150) {
        if (/finalist|winner|top\s*\d+|award|rank|solved|dsa|hackathon|scholarship|honor|rating|contest|certified|leetcode|codechef|hackerrank|codeforces|★|star/i.test(cleanLine)) {
          achievements.push({
            title: cleanLine,
            issuer: /leetcode/i.test(cleanLine) ? "LeetCode" : (/codechef/i.test(cleanLine) ? "CodeChef" : (/hackerrank/i.test(cleanLine) ? "HackerRank" : "Competitive Programming")),
            year: new Date().getFullYear().toString(),
          });
        }
      }
    }
  }
  return achievements;
};

export const openPortfolioDocument = (url, title = "Document") => {
  if (!url) return;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("portfolio:view-doc", {
        detail: { url, title },
      })
    );
  }
};
