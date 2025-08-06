import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(
  userImage: string | null | undefined,
  userName: string | null | undefined
) {
  const seed = userName || "defaultUser";
  const placeholderUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${seed}&backgroundType=gradientLinear,solid`;
  let avatarUrl = null;
  if (userImage?.startsWith("http://") || userImage?.startsWith("https://")) {
    avatarUrl = userImage;
  } else if (userImage?.startsWith("/avatars/")) {
    avatarUrl = userImage;
  }
  return {
    avatarUrl,
    placeholderUrl,
  };
}

export function formatDate(
  date: Date | string,
  formatString = "yyyy-MM-dd"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

export function parseUserAgent(userAgent: string): {
  system: string;
  browser: string;
  isMobile: boolean;
} {
  const ua = userAgent.toLowerCase();

  let system = "Unknown";
  let isMobile = false;

  if (ua.includes("android")) {
    system = "Android";
    isMobile = true;
  } else if (
    ua.includes("ios") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    system = "iOS";
    isMobile = true;
  } else if (ua.includes("windows")) {
    system = "Windows";
  } else if (ua.includes("mac os") || ua.includes("macos")) {
    system = "Macintosh";
  } else if (ua.includes("linux")) {
    system = "Linux";
  }

  const browserMatchers: {
    regex: RegExp;
    name: (match: RegExpMatchArray) => string;
  }[] = [
    { regex: /firefox\/(\d+(\.\d+)?)/, name: (match) => `Firefox ${match[1]}` },
    { regex: /edg\/(\d+(\.\d+)?)/, name: (match) => `Edge ${match[1]}` },
    { regex: /chrome\/(\d+(\.\d+)?)/, name: (match) => `Chrome ${match[1]}` },
    { regex: /safari\/(\d+(\.\d+)?)/, name: (match) => `Safari ${match[1]}` },
    {
      regex: /(opera|opr)\/(\d+(\.\d+)?)/,
      name: (match) => `Opera ${match[2]}`,
    },
  ];

  let browser = "Unknown";

  for (const matcher of browserMatchers) {
    const match = ua.match(matcher.regex);
    if (
      match &&
      !(matcher.regex.source.includes("safari") && ua.includes("chrome"))
    ) {
      browser = matcher.name(match);
      break;
    }
  }

  return { system, browser, isMobile };
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "только что";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getPluralForm(diffInMinutes, "минуту", "минуты", "минут")} назад`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${getPluralForm(diffInHours, "час", "часа", "часов")} назад`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${getPluralForm(diffInDays, "день", "дня", "дней")} назад`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${getPluralForm(diffInWeeks, "неделю", "недели", "недель")} назад`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${getPluralForm(diffInMonths, "месяц", "месяца", "месяцев")} назад`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${getPluralForm(diffInYears, "год", "года", "лет")} назад`;
}

function getPluralForm(count: number, one: string, few: string, many: string): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }

  if (lastDigit === 1) {
    return one;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  return many;
}

export function calculateDealRating(ratings: Array<{ rating: number }>) {
  const likes = ratings.filter(r => r.rating === 1).length;
  const dislikes = ratings.filter(r => r.rating === -1).length;
  const totalVotes = likes + dislikes;
  const rating = totalVotes > 0 ? likes - dislikes : 0;
  
  return {
    rating,
    likes,
    dislikes,
    totalVotes,
  };
}

// Генерация SEO-friendly слага из заголовка
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    locale: 'ru'
  });
}

// Вычисление рейтинга комментария
export function calculateCommentRating(ratings: Array<{ rating: number }> = []): {
  rating: number;
  likes: number;
  dislikes: number;
  totalVotes: number;
} {
  const likes = ratings.filter(r => r.rating === 1).length;
  const dislikes = ratings.filter(r => r.rating === -1).length;
  const totalVotes = likes + dislikes;
  const rating = likes - dislikes;

  return {
    rating,
    likes,
    dislikes,
    totalVotes,
  };
}
