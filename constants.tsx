
import { Post, Church, User, Devotional, ReadingPlan, Chat } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@faithlify.com',
  role: 'admin', // Admin by default for testing verification flow
  avatar: 'https://picsum.photos/seed/user1/200/200',
  following: ['u2', 'c1'],
  followers: ['u3']
};

export const MOCK_ALL_USERS: User[] = [
  MOCK_USER,
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    email: 'sarah@faithlify.com',
    role: 'user',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    following: ['u1'],
    followers: ['u1']
  },
  {
    id: 'u3',
    name: 'David Light',
    email: 'david@faithlify.com',
    role: 'user',
    avatar: 'https://picsum.photos/seed/david/100/100',
    following: [],
    followers: ['u1']
  },
  {
    id: 'u4',
    name: 'Rebecca Faith',
    email: 'rebecca@faithlify.com',
    role: 'user',
    avatar: 'https://picsum.photos/seed/rebecca/100/100',
    following: [],
    followers: []
  },
  {
    id: 'u5',
    name: 'Peter Rock',
    email: 'peter@faithlify.com',
    role: 'church_admin',
    avatar: 'https://picsum.photos/seed/peter/100/100',
    following: [],
    followers: []
  }
];

export const MOCK_CHURCHES: Church[] = [
  {
    id: 'c1',
    name: 'Grace Community',
    location: 'Los Angeles, CA',
    description: 'A welcoming community focused on grace and truth.',
    coverImage: 'https://picsum.photos/seed/church1/800/400',
    isVerified: true,
    livestreamUrl: 'https://www.youtube.com/embed/mFeU4u8nqRw',
    membersCount: 1250,
    adminEmail: 'admin@grace.com'
  },
  {
    id: 'c2',
    name: 'Redeemer Central',
    location: 'London, UK',
    description: 'Passionate about reaching our city with the love of Christ.',
    coverImage: 'https://picsum.photos/seed/church2/800/400',
    isVerified: true,
    livestreamUrl: 'https://www.youtube.com/embed/EF0pjVvAios',
    membersCount: 840,
    adminEmail: 'info@redeemer.com'
  },
  {
    id: 'c3',
    name: 'Eternal Hope Ministry',
    location: 'New York, NY',
    description: 'Dedicated to sharing eternal hope through faith.',
    coverImage: 'https://picsum.photos/seed/church3/800/400',
    isVerified: false,
    isPending: true,
    membersCount: 0,
    adminEmail: 'pastor@eternalhope.com'
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'c1',
    userName: 'Grace Community',
    userAvatar: 'https://picsum.photos/seed/church1/100/100',
    content: "Join us this Sunday for a special message on the fruits of the Spirit. We can't wait to worship with you! 🌿",
    mediaUrl: 'https://picsum.photos/seed/post1/600/400',
    mediaType: 'image',
    likes: 42,
    comments: [],
    createdAt: '2h ago',
    isVerifiedChurch: true
  }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'ch1',
    participants: ['u1', 'u2'],
    lastMessage: 'I will see you at the service!',
    unreadCount: 0,
    isGroup: false,
    messages: [
      { id: 'm1', senderId: 'u2', text: 'Hey John, are you coming Sunday?', timestamp: '10:30 AM' },
      { id: 'm2', senderId: 'u1', text: 'Yes, absolutely!', timestamp: '10:32 AM' },
      { id: 'm3', senderId: 'u2', text: 'I will see you at the service!', timestamp: '10:35 AM' }
    ]
  },
  {
    id: 'ch-group1',
    participants: ['u1', 'u2', 'u3'],
    groupName: 'Faith Builders Study',
    isGroup: true,
    admins: ['u1'],
    lastMessage: 'Let us pray for our community.',
    unreadCount: 3,
    messages: [
      { id: 'm-g1', senderId: 'u1', text: 'Welcome to the Bible Study group!', timestamp: 'Yesterday' },
      { id: 'm-g2', senderId: 'u3', text: 'Looking forward to it!', timestamp: 'Yesterday' }
    ]
  }
];

export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];



export const MOCK_READING_PLANS: ReadingPlan[] = [
  {
    id: 'rp1',
    title: 'The Peace of God',
    description: 'A 7-day journey through scriptures that bring peace to the soul.',
    creatorId: 'u1',
    creatorName: 'John Doe',
    verses: ['Philippians 4:6-7', 'John 14:27', 'Isaiah 26:3'],
    subscribers: ['u2', 'u3']
  }
];
