import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function updatePortfolio() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Portfolio = mongoose.model('Portfolio', new mongoose.Schema({}, { strict: false }));

  const updatedData = {
    name: 'Anushka Garg',
    title: 'Anushka Garg - Software Developer Portfolio',
    tagline: 'Software Developer & Full Stack Engineer | C++, MERN Stack, AWS | 1800+ LeetCode Rating',
    about: 'Aspiring Software Development Engineer with a solid foundation in computer science principles, full-stack web development, and algorithmic problem solving. Proficient in C++, JavaScript, TypeScript, React.js, Node.js, and MongoDB, with an 1800+ contest rating on LeetCode. Passionate about engineering high-performance web systems, responsive user interfaces, and scalable architectures.',
    email: 'anushka.garg1801@gmail.com',
    phone: '(+91)9319430399',
    github: 'https://github.com/anushka1801garg',
    linkedin: 'https://www.linkedin.com/in/anushka-garg-52b67a297/',
    website: 'https://github.com/anushka1801garg',
    skills: [
      'C++', 'JavaScript', 'TypeScript', 'Python', 'React.js', 'Node.js',
      'Tailwind CSS', 'MongoDB', 'Oracle DB', 'SQL', 'REST APIs', 'JSON',
      'VS Code', 'Postman', 'Git', 'GitHub', 'AWS', 'Data Structures & Algorithms'
    ],
    education: [
      {
        institution: 'ABES Engineering College',
        degree: 'Bachelors of Technology in Computer Science and Engineering',
        year: '2022 - 2026',
        description: 'Maintaining strong academic excellence with a 9.1 CGPA. Specializing in computer science foundations, algorithms, database management, and web engineering.'
      },
      {
        institution: 'Sun Valley International School',
        degree: 'Higher Secondary School (Class XII)',
        year: '2022',
        description: 'Completed with 93.6% aggregate with distinction in Science and Mathematics.'
      },
      {
        institution: 'Sun Valley International School',
        degree: 'Senior Secondary School (Class X)',
        year: '2020',
        description: 'Completed with 81.82% aggregate.'
      }
    ],
    experience: [
      {
        role: 'Full-Stack Project Developer & Contributor',
        company: 'Smart India Hackathon',
        duration: '2024',
        description: 'Collaborated in an agile team to design and develop an innovative tech solution under intense hackathon timelines.',
        highlights: [
          'Collaborated in a team to design and develop an innovative solution within a limited time frame, enhancing problem-solving and teamwork skills.',
          'Engineered modular frontend components and integrated backend API endpoints.',
          'Took ownership of rapid prototyping, technical architecture, and end-to-end feature delivery.'
        ]
      },
      {
        role: 'Competitive Programmer & Algorithmic Specialist',
        company: 'LeetCode & HackerRank',
        duration: '2023 - Present',
        description: 'Consistent problem solver in competitive programming contests and algorithm design.',
        highlights: [
          'Achieved a 1800+ contest rating and 200+ problems solved on LeetCode.',
          'Earned Intermediate Problem Solving certification on HackerRank.',
          'Achieved 4-Star badge in C++ on HackerRank, demonstrating strong proficiency in C++ and STL.'
        ]
      },
      {
        role: 'Software Development Projects',
        company: 'ABES Engineering College',
        duration: '2023 - Present',
        description: 'Spearheaded full-lifecycle development of production-grade web applications.',
        highlights: [
          'Designed and deployed Study Sphere, Velvet Vogue, and EcoConnect web platforms.',
          'Took ownership of end-to-end development in projects, showcasing initiative, accountability, and problem-solving ability.',
          'Practiced consistent self-learning, clean code architecture, and modern DevOps/cloud practices.'
        ]
      }
    ],
    projects: [
      {
        title: 'Study Sphere - Educational Resource Platform',
        description: 'Developed an educational web platform that provides students with organized learning resources and study materials for efficient learning. Designed a responsive and user-friendly interface to enable easy navigation, content browsing, and access to educational resources.',
        tags: ['React.js', 'Node.js', 'MongoDB', 'Express', 'REST APIs', 'Tailwind CSS'],
        github: 'https://github.com/anushka1801garg/DSA-Practice',
        live: 'https://github.com/anushka1801garg',
        impact: 'Implemented features for categorizing study materials, searching topics, and helping students discover relevant learning content quickly.'
      },
      {
        title: 'Velvet Vogue - Fashion E-Commerce Platform',
        description: 'Developed an online fashion e-commerce platform using React.js and Tailwind CSS to showcase and sell clothing products. Built a responsive and visually appealing interface, ensuring a smooth and engaging shopping experience across multiple devices.',
        tags: ['React.js', 'Tailwind CSS', 'JavaScript', 'REST APIs', 'Responsive Design'],
        github: 'https://github.com/anushka1801garg/PortfolioAI',
        live: 'https://github.com/anushka1801garg',
        impact: 'Implemented key features such as product listing, browsing, and detailed product views to enhance product discovery and user interaction.'
      },
      {
        title: 'EcoConnect – Green Living Community Website',
        description: 'Developed a web platform focused on promoting sustainable living and environmental awareness using modern web technologies. Implemented modals, buttons, and reusable UI components with focus on clean design and usability.',
        tags: ['React.js', 'Tailwind CSS', 'JavaScript', 'HTML5', 'UI/UX'],
        github: 'https://github.com/anushka1801garg/ShadowFox',
        live: 'https://github.com/anushka1801garg',
        impact: 'Enhanced user engagement with modular components, interactive modals, and responsive layout for environmental action.'
      },
      {
        title: 'PortfolioAI - Autonomous AI Portfolio Builder & Optimizer',
        description: 'Engineered an intelligent portfolio creation and optimization platform featuring 14 modern design templates, automated resume parsing, GitHub repository integration, and AI-driven recommendations.',
        tags: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Gemini AI', 'Express'],
        github: 'https://github.com/anushka1801garg/PortfolioAI',
        live: 'http://localhost:5173',
        impact: 'Allows developers to showcase their authentic work and achievements with dynamic template switching and live analytics.'
      }
    ],
    achievements: [
      {
        title: 'LeetCode 1800+ Contest Rating & 200+ Solved',
        description: 'Achieved a 1800+ contest rating and 200+ problems solved on LeetCode, reflecting consistent performance in competitive programming contests.',
        date: '2024',
        metric: '1800+ Rating'
      },
      {
        title: 'Smart India Hackathon Team Contributor',
        description: 'Participated in Smart India Hackathon, collaborating in a team to design and develop an innovative solution within a limited time frame, enhancing problem-solving and teamwork skills.',
        date: '2024',
        metric: 'National Level'
      },
      {
        title: 'HackerRank Intermediate Problem Solving Certification',
        description: 'Earned Intermediate Problem Solving certification on HackerRank covering complex data structures and algorithmic efficiency.',
        date: '2024',
        metric: 'Certified'
      },
      {
        title: 'HackerRank 4-Star Badge in C++',
        description: 'Achieved 4* in C++ on HackerRank, demonstrating strong proficiency in C++ and Standard Template Library (STL).',
        date: '2024',
        metric: '4-Star Gold'
      }
    ],
    certifications: [
      {
        name: 'Intermediate Problem Solving Certification',
        issuer: 'HackerRank',
        date: '2024',
        url: 'https://www.hackerrank.com'
      },
      {
        name: '4-Star C++ Specialist',
        issuer: 'HackerRank',
        date: '2024',
        url: 'https://www.hackerrank.com'
      },
      {
        name: 'Full Stack Web Development & AWS Fundamentals',
        issuer: 'ABES Engineering College',
        date: '2024',
        url: 'https://github.com/anushka1801garg'
      }
    ],
    blog: [
      {
        title: 'Conquering Data Structures & Algorithms: The Journey to 1800+ on LeetCode',
        excerpt: 'Key strategies, pattern recognition techniques, and consistent habits that helped me solve 200+ problems and excel in competitive programming contests.',
        readTime: '5 min read',
        date: 'September 2024',
        link: 'https://github.com/anushka1801garg/DSA-Practice'
      },
      {
        title: 'Architecting Modern Web Applications: Lessons from Study Sphere & Velvet Vogue',
        excerpt: 'Deep dive into state management, reusable UI component architecture, and responsive styling with React.js, Tailwind CSS, and RESTful APIs.',
        readTime: '4 min read',
        date: 'August 2024',
        link: 'https://github.com/anushka1801garg'
      }
    ],
    contact: {
      email: 'anushka.garg1801@gmail.com',
      phone: '(+91)9319430399',
      github: 'https://github.com/anushka1801garg',
      linkedin: 'https://www.linkedin.com/in/anushka-garg-52b67a297/',
      website: 'https://github.com/anushka1801garg'
    }
  };

  const res = await Portfolio.findByIdAndUpdate('6ab2d4261bada5b43250d6de', updatedData, { new: true });
  console.log('SUCCESS! Updated portfolio:');
  console.log('ID:', res._id);
  console.log('Name:', res.name);
  console.log('GitHub root:', res.github);
  console.log('LinkedIn root:', res.linkedin);
  console.log('Contact obj:', res.contact);
  console.log('Education:', res.education.map(e => e.institution));
  console.log('Projects:', res.projects.map(p => p.title));
  console.log('Skills:', res.skills.length);
  process.exit(0);
}

updatePortfolio().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
