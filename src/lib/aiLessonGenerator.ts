import { SlideData, YouTubeVideo, AIGeneratedLesson } from '@/types';

const mockYoutubeVideos: { [key: string]: YouTubeVideo[] } = {
  'Calculus': [
    {
      id: 'WsQQvHm4lSw',
      title: 'Calculus 1 - Full College Course',
      thumbnail: 'https://images.pexels.com/photos/3808523/pexels-photo-3808523.jpeg',
      duration: '2:35:00',
      views: '4.2M',
    },
    {
      id: 'HfACrKJ_Y2w',
      title: 'Derivatives Explained Simply',
      thumbnail: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg',
      duration: '28:15',
      views: '1.8M',
    },
    {
      id: 'riXcZT2ICjA',
      title: 'Integration Techniques',
      thumbnail: 'https://images.pexels.com/photos/3977977/pexels-photo-3977977.jpeg',
      duration: '45:40',
      views: '956K',
    },
  ],
  'Physics': [
    {
      id: 'ZM8ECpBuQYE',
      title: 'Physics Fundamentals - Complete Guide',
      thumbnail: 'https://images.pexels.com/photos/3808523/pexels-photo-3808523.jpeg',
      duration: '1:52:20',
      views: '3.1M',
    },
    {
      id: 'NvGTLv0bNFY',
      title: 'Mechanics and Motion',
      thumbnail: 'https://images.pexels.com/photos/2531095/pexels-photo-2531095.jpeg',
      duration: '38:18',
      views: '2.1M',
    },
  ],
  'Chemistry': [
    {
      id: 'yQP4uxJANSs',
      title: 'Chemistry Basics - Atoms and Elements',
      thumbnail: 'https://images.pexels.com/photos/3683100/pexels-photo-3683100.jpeg',
      duration: '52:55',
      views: '1.5M',
    },
  ],
  'Biology': [
    {
      id: 'QnQe0xW_JY4',
      title: 'Cell Biology Complete Course',
      thumbnail: 'https://images.pexels.com/photos/3683100/pexels-photo-3683100.jpeg',
      duration: '1:15:22',
      views: '2.3M',
    },
  ],
  'English Literature': [
    {
      id: '7YPVvMKOZ9I',
      title: 'Literary Analysis Techniques',
      thumbnail: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg',
      duration: '42:30',
      views: '890K',
    },
  ],
  'History': [
    {
      id: 'x0C7r1YH0kE',
      title: 'World History Overview',
      thumbnail: 'https://images.pexels.com/photos/2313385/pexels-photo-2313385.jpeg',
      duration: '1:05:00',
      views: '2.7M',
    },
  ],
  'Computer Science': [
    {
      id: 'zOjov-2OZ0E',
      title: 'Programming Fundamentals',
      thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
      duration: '55:40',
      views: '3.5M',
    },
  ],
  'Algebra': [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Algebra Fundamentals - Complete Guide',
      thumbnail: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg',
      duration: '45:32',
      views: '2.3M',
    },
  ],
};

const slideTemplates = [
  (subject: string, topic: string): SlideData => ({
    id: 1,
    title: topic,
    content: `Introduction to ${topic} in ${subject}\n\nThis lesson covers the fundamental concepts and practical applications.`,
    imageUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
  }),
  (subject: string, topic: string): SlideData => ({
    id: 2,
    title: 'Key Concepts',
    content: `• Definition of ${topic}\n• Core principles and rules\n• How it connects to other topics\n• Why it matters in ${subject}`,
    imageUrl: 'https://images.pexels.com/photos/3808523/pexels-photo-3808523.jpeg',
  }),
  (subject: string, topic: string): SlideData => ({
    id: 3,
    title: 'Detailed Explanation',
    content: `Understanding ${topic} step by step:\n\nStep 1: Identify the key variables\nStep 2: Apply the relevant formula\nStep 3: Solve and verify\nStep 4: Interpret the result`,
    imageUrl: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
  }),
  (subject: string, topic: string): SlideData => ({
    id: 4,
    title: 'Worked Example',
    content: `Example Problem:\n\nGiven: A scenario involving ${topic}\nFind: The solution using ${subject} principles\n\nSolution:\n1. Set up the equation\n2. Substitute known values\n3. Calculate step by step\n4. Verify the answer`,
    imageUrl: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg',
  }),
  (subject: string, topic: string): SlideData => ({
    id: 5,
    title: 'Visual Representation',
    content: `Graph and diagram for ${topic}:\n\n• X-axis: Independent variable\n• Y-axis: Dependent variable\n• Key points marked\n• Trend analysis`,
    imageUrl: 'https://images.pexels.com/photos/3862630/pexels-photo-3862630.jpeg',
  }),
  (subject: string, topic: string): SlideData => ({
    id: 6,
    title: 'Summary & Review',
    content: `Key Takeaways - ${topic}:\n\n✓ We learned the definition and concepts\n✓ We practiced with worked examples\n✓ We analyzed real-world applications\n✓ We connected to broader ${subject} topics\n\nNext: Practice problems and assessment`,
    imageUrl: 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg',
  }),
];

export const aiLessonGenerator = {
  generateSlides: (subject: string, topic: string): SlideData[] => {
    return slideTemplates.map((template) => template(subject, topic));
  },

  getRelatedVideos: (subject: string): YouTubeVideo[] => {
    for (const key of Object.keys(mockYoutubeVideos)) {
      if (subject.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(subject.toLowerCase().split(' ')[0])) {
        return mockYoutubeVideos[key];
      }
    }
    return [
      {
        id: 'default-video',
        title: `${subject} - Educational Video`,
        thumbnail: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg',
        duration: '45:00',
        views: '500K',
      },
    ];
  },

  generateLesson: (subject: string, topic: string): AIGeneratedLesson => {
    const slides = aiLessonGenerator.generateSlides(subject, topic);
    const videos = aiLessonGenerator.getRelatedVideos(subject);

    return {
      title: `${subject} - ${topic}`,
      slides,
      videos: videos.slice(0, 3),
      topic,
      generatedAt: new Date(),
    };
  },

  generateQuiz: (subject: string, topic: string): string[] => {
    return [
      `What is the definition of ${topic}?`,
      `What are the key properties of ${topic}?`,
      `Where is ${topic} applied in real life?`,
      `What formula is used to calculate ${topic}?`,
      `Solve a problem involving ${topic}`,
    ];
  },

  generateSummary: (subject: string, topic: string): string => {
    return `${subject} - ${topic}

Summary:
${topic} is an essential concept in ${subject}. It covers the following areas:

1. Theory: Definition and fundamental properties of ${topic}
2. Application: How ${topic} is used in real-world scenarios
3. Problem Solving: Methods and techniques for working with ${topic}
4. Connections: How ${topic} relates to other topics in ${subject}

Recommended Resources:
- Textbook chapters on ${topic}
- Educational videos on YouTube and Khan Academy
- Practice exercises and worksheets
- Online quizzes for self-assessment

This topic is foundational and will be built upon in future lessons.`;
  },
};
