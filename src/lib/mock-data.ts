"use client";

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  commits: Commit[];
}

export interface Commit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
  files: string[];
  diff: string;
  tags: string[];
  aiNote?: string;
}

export interface DashboardData {
  productiveDays: { day: string; commits: number }[];
  codingStreak: { date: string; commits: number }[];
  languages: { name: string; percentage: number; color: string }[];
  totalCommits: number;
  totalRepos: number;
  currentStreak: number;
}

export const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "awesome-react-app",
    description: "A modern React application with TypeScript and Tailwind CSS",
    language: "TypeScript",
    stars: 42,
    commits: [
      {
        id: "c1",
        hash: "a1b2c3d",
        message: "feat: add user authentication system",
        author: "John Doe",
        date: "2024-01-15T10:30:00Z",
        additions: 156,
        deletions: 23,
        files: [
          "src/auth/login.tsx",
          "src/auth/register.tsx",
          "src/hooks/useAuth.ts",
        ],
        diff: `+ import { useState } from 'react'
+ import { Button } from '@/components/ui/button'
+ 
+ export function LoginForm() {
+   const [email, setEmail] = useState('')
+   const [password, setPassword] = useState('')
+   
+   return (
+     <form className="space-y-4">
+       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
+       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
+       <Button type="submit">Login</Button>
+     </form>
+   )
+ }`,
        tags: ["feature", "auth"],
      },
      {
        id: "c2",
        hash: "e4f5g6h",
        message: "fix: resolve memory leak in dashboard component",
        author: "Jane Smith",
        date: "2024-01-14T14:20:00Z",
        additions: 12,
        deletions: 8,
        files: ["src/components/Dashboard.tsx"],
        diff: `- useEffect(() => {
-   const interval = setInterval(fetchData, 1000)
- }, [])
+ useEffect(() => {
+   const interval = setInterval(fetchData, 1000)
+   return () => clearInterval(interval)
+ }, [])`,
        tags: ["bugfix"],
      },
      {
        id: "c3",
        hash: "i7j8k9l",
        message: "refactor: optimize API calls and add caching",
        author: "Mike Johnson",
        date: "2024-01-13T09:15:00Z",
        additions: 89,
        deletions: 134,
        files: ["src/api/client.ts", "src/hooks/useCache.ts"],
        diff: `+ import { useQuery } from '@tanstack/react-query'
+ 
+ export function useApiData(key: string) {
+   return useQuery({
+     queryKey: [key],
+     queryFn: () => fetchData(key),
+     staleTime: 5 * 60 * 1000, // 5 minutes
+   })
+ }`,
        tags: ["refactor", "performance"],
      },
    ],
  },
  {
    id: "2",
    name: "ml-data-pipeline",
    description: "Machine learning data processing pipeline with Python",
    language: "Python",
    stars: 128,
    commits: [
      {
        id: "c4",
        hash: "m1n2o3p",
        message: "feat: implement data validation pipeline",
        author: "Sarah Wilson",
        date: "2024-01-12T16:45:00Z",
        additions: 203,
        deletions: 45,
        files: ["src/validation/schema.py", "src/validation/validator.py"],
        diff: `+ import pandas as pd
+ from typing import Dict, Any
+ 
+ class DataValidator:
+     def __init__(self, schema: Dict[str, Any]):
+         self.schema = schema
+     
+     def validate(self, df: pd.DataFrame) -> bool:
+         for column, rules in self.schema.items():
+             if not self._validate_column(df[column], rules):
+                 return False
+         return True`,
        tags: ["feature", "validation"],
      },
    ],
  },
  {
    id: "3",
    name: "api-gateway-service",
    description: "High-performance API gateway built with Go",
    language: "Go",
    stars: 89,
    commits: [
      {
        id: "c5",
        hash: "q4r5s6t",
        message: "perf: add request caching and rate limiting",
        author: "Alex Chen",
        date: "2024-01-11T11:30:00Z",
        additions: 167,
        deletions: 34,
        files: ["internal/cache/redis.go", "internal/middleware/ratelimit.go"],
        diff: `+ func NewRateLimiter(requests int, window time.Duration) *RateLimiter {
+     return &RateLimiter{
+         requests: requests,
+         window:   window,
+         clients:  make(map[string]*client),
+         mutex:    &sync.RWMutex{},
+     }
+ }`,
        tags: ["performance", "middleware"],
      },
    ],
  },
];

export const mockDashboardData: DashboardData = {
  productiveDays: [
    { day: "Mon", commits: 12 },
    { day: "Tue", commits: 8 },
    { day: "Wed", commits: 15 },
    { day: "Thu", commits: 22 },
    { day: "Fri", commits: 18 },
    { day: "Sat", commits: 5 },
    { day: "Sun", commits: 3 },
  ],
  codingStreak: Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split("T")[0],
      commits: Math.floor(Math.random() * 10),
    };
  }).reverse(),
  languages: [
    { name: "TypeScript", percentage: 45, color: "#3178c6" },
    { name: "Python", percentage: 30, color: "#3776ab" },
    { name: "Go", percentage: 15, color: "#00add8" },
    { name: "JavaScript", percentage: 10, color: "#f7df1e" },
  ],
  totalCommits: 1247,
  totalRepos: 23,
  currentStreak: 15,
};

export const mockUser = {
  name: "Alex Developer",
  username: "alexdev",
  avatar: "/developer-avatar.png",
  email: "alex@example.com",
};
