import campus from '../assets/campus-marketplace.png'
import aspire from '../assets/aspirewrite.png'
import fitness from '../assets/fitnesshood.png'
import asset from '../assets/slsu-asset-management.png'
import studio from '../assets/studio8teen.png'
import clash from '../assets/code-clash.png'
import certificate from '../assets/certificate.png'
import cv from '../assets/Mark-Tristan-De-Villa-CV.docx'

export const HLS_SRC =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

export const CV_URL = cv

export const LINKS = {
  email: 'mailto:devillamarktristan@gmail.com',
  github: 'https://github.com/Tannntannn',
  linkedin: 'https://www.linkedin.com/in/mark-tristan-de-villa-4a4133308/',
  facebook: 'https://www.facebook.com/marktristandevilla',
  instagram: 'https://www.instagram.com/trisssttt_',
}

export type Project = {
  title: string
  blurb: string
  year: string
  tags: string[]
  img: string
  url: string
  extra?: { label: string; href: string }
  span: string
}

export const PROJECTS: Project[] = [
  {
    title: 'SLSU Asset Management',
    blurb: 'Staff scan campus property with the camera — DINOv2 matching, admin portal, and inventory reports.',
    year: '2026',
    tags: ['React', 'Expo', 'DINOv2'],
    img: asset,
    url: 'https://www.slsu-asset-management.com/login',
    extra: {
      label: 'App',
      href: 'https://expo.dev/accounts/abbycoleen/projects/slsu-asset-inventory/builds/d4c4c755-f614-4115-ad21-a21d523325ff',
    },
    span: 'md:col-span-7',
  },
  {
    title: 'FitnessHood',
    blurb: 'Gym ops in one place — QR check-in, memberships, payments, and admin reports.',
    year: '2025',
    tags: ['Next.js', 'Prisma', 'Supabase'],
    img: fitness,
    url: 'https://www.fitnesshood.org/',
    span: 'md:col-span-5',
  },
  {
    title: 'Studio 8teen Photography',
    blurb: 'Photography bookings end to end — schedule, pay, galleries, and QR check-in at the studio.',
    year: '2026',
    tags: ['React', 'Supabase', 'Booking'],
    img: studio,
    url: 'https://www.studio8teen.org/',
    span: 'md:col-span-5',
  },
  {
    title: 'SLSU Campus Market Place',
    blurb: 'Campus buy-and-sell for SLSU students — listings, in-app chat, and receipts without leaving school.',
    year: '2025',
    tags: ['Firebase', 'Cloudinary'],
    img: campus,
    url: 'https://slsu-marketplace.org/',
    span: 'md:col-span-7',
  },
]

export const MORE_WORK: Project[] = [
  ...PROJECTS,
  {
    title: 'AspireWrite',
    blurb: 'A literary home for writers and readers — publish work, browse by category, and leave ratings.',
    year: '2025',
    tags: ['Firebase', 'Cloudinary'],
    img: aspire,
    url: 'https://aspirewrite.org/',
    span: '',
  },
  {
    title: 'Code Clash',
    blurb: 'Learn Java on Android — lessons, quizzes, and live coding challenges with an instructor view.',
    year: '2025',
    tags: ['Android', 'Firebase', 'Java'],
    img: clash,
    url: 'https://github.com/Tannntannn/CodeClash',
    extra: {
      label: 'APK',
      href: 'https://drive.google.com/drive/folders/1mIXLeHJuPhR1FRi6jEWHCAPd5wf3GUDo?usp=sharing',
    },
    span: '',
  },
]

export const NOTES = [
  {
    title: 'Web Developer Intern',
    detail: 'Taaeen — Innovative Human Capital Solutions',
    meta: 'Jan – May 2026',
    img: certificate,
    href: '#experience',
  },
  {
    title: 'SLSU Asset Management',
    detail: 'Camera scan, DINOv2 matching, admin reports',
    meta: '2026',
    img: asset,
    href: 'https://www.slsu-asset-management.com/login',
  },
  {
    title: 'Studio 8teen',
    detail: 'Scheduling, payments, client galleries',
    meta: '2026',
    img: studio,
    href: 'https://www.studio8teen.org/',
  },
  {
    title: 'Code Clash',
    detail: 'Gamified Java lessons on Android',
    meta: '2025',
    img: clash,
    href: 'https://github.com/Tannntannn/CodeClash',
  },
]

export const STATS = [
  { value: '6', label: 'Projects shipped' },
  { value: '4', label: 'Services' },
  { value: 'Open', label: 'For work' },
]

export const SOCIALS = [
  { label: 'GitHub', href: LINKS.github },
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'Facebook', href: LINKS.facebook },
  { label: 'Instagram', href: LINKS.instagram },
]
