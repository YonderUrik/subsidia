# Contributing to Subsidia

Thank you for your interest in contributing to Subsidia! This document provides comprehensive technical guidance for developers who want to contribute to this modern farm management platform.

## 🏗️ Architecture Overview

Subsidia is built as a full-stack Next.js application with a modern, scalable architecture:

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19 with Server Components
- **Language**: JavaScript (ES2022)
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js v4 with custom providers
- **Styling**: Tailwind CSS v4 with CSS custom properties
- **UI Components**: Custom design system built on Radix UI primitives
- **State Management**: React hooks with server state via SWR patterns
- **Forms**: React Hook Form with Zod validation
- **Maps**: Mapbox GL JS with custom drawing tools
- **Email**: React Email with Resend API
- **Deployment**: Vercel with edge functions

### Project Structure

```
subsidia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes (grouped)
│   │   ├── api/               # API routes (server-side)
│   │   ├── dashboard/         # Protected dashboard routes
│   │   │   ├── employees/     # Employee management
│   │   │   ├── harvests/      # Harvest tracking
│   │   │   ├── lands/         # Land management
│   │   │   ├── salary/        # Payroll system
│   │   │   └── calendar/      # Activity scheduling
│   │   ├── layout.js          # Root layout with providers
│   │   └── page.js            # Landing page
│   ├── components/            # Reusable React components
│   │   ├── ui/               # Design system components
│   │   ├── map-components/   # Mapbox integration
│   │   └── logo/             # Brand assets
│   ├── lib/                   # Utility libraries
│   │   ├── auth.jsx          # NextAuth configuration
│   │   ├── prisma.jsx        # Database client
│   │   ├── utils.js          # Helper functions
│   │   └── client/           # Client-side utilities
│   ├── contexts/             # React contexts
│   ├── providers/            # Provider components
│   ├── hooks/                # Custom React hooks
│   ├── emails/               # Email templates
│   └── styles/               # Global styles
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17+ (recommend using nvm)
- **Package Manager**: npm, yarn, or bun
- **Database**: MongoDB Atlas or local MongoDB instance
- **Required APIs**: 
  - Mapbox account (for mapping features)
  - Resend account (for email functionality)

### Setup Development Environment

1. **Clone and navigate to project**:
   ```bash
   git clone https://github.com/danieleroccaforte/subsidia.git
   cd subsidia/subsidia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install  # Recommended for faster installs
   ```

3. **Environment Configuration**:
   Create `.env.local` with required variables:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/subsidia"
   
   # Auth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # External APIs
   MAPBOX_ACCESS_TOKEN="your-mapbox-token"
   RESEND_API_KEY="your-resend-key"
   
   # Optional: Analytics
   VERCEL_ANALYTICS_ID="your-analytics-id"
   ```

4. **Database Setup**:
   ```bash
   npx prisma generate    # Generate Prisma client
   npx prisma db push     # Push schema to database
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   # or
   bun run dev --turbopack  # Faster with Turbopack
   ```

## 🏛️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String
  isActive  Boolean  @default(true)
  // Relations
  employees Employee[]
  lands     Land[]
  harvests  Harvest[]
  salaries  Salary[]
}
```

#### Employee Model
```prisma
model Employee {
  id          String  @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  dailyRate   Float   # Full day wage
  halfDayRate Float   # Half day wage
  isActive    Boolean @default(true)
  salaries    Salary[]
}
```

#### Land Model
```prisma
model Land {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  area        Float     # Area in hectares
  coordinates Json[]    # GeoJSON polygon coordinates
  soilType    String    # Crop/soil type
  color       String    # Map visualization color
  isActive    Boolean   @default(true)
  harvests    Harvest[]
}
```

#### Harvest Model
```prisma
model Harvest {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  quantity   Float    # Amount harvested (kg)
  price      Float    # Price per kg
  total      Float    # Total value (quantity * price)
  isPaid     Boolean  @default(false)
  paidAmount Float?   # Actual amount paid (for partial payments)
  client     String   # Buyer/client name
  notes      String?
  harvestDay DateTime
  land       Land     @relation(fields: [landId], references: [id])
}
```

## 🎨 Design System

### Theme Architecture

Subsidia uses a sophisticated theming system with CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  /* ... more variables */
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  /* ... dark mode overrides */
}
```

### Component Guidelines

1. **Use the design system**: All components should use tokens from `@/components/ui/`
2. **Follow theming patterns**: Use CSS variables, not hardcoded colors
3. **Responsive first**: Mobile-first approach with Tailwind breakpoints
4. **Accessibility**: Include proper ARIA labels and keyboard navigation

### UI Component Examples

```jsx
// Good: Using design system
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="sm">
          Action
        </Button>
      </CardContent>
    </Card>
  )
}

// Bad: Hardcoded styles
function BadComponent() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-bold text-gray-900">Data Summary</h3>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Action
      </button>
    </div>
  )
}
```

## 🔧 API Development

### Route Structure

API routes follow REST conventions in the `app/api/` directory:

```
api/
├── auth/              # Authentication endpoints
├── employees/         # Employee CRUD operations
├── harvests/          # Harvest management
├── lands/             # Land management
├── salaries/          # Payroll system
└── [resource]/
    ├── route.js       # GET, POST, PUT, DELETE
    └── [id]/
        └── route.js   # Resource-specific operations
```

### API Patterns

#### Standard CRUD Route
```javascript
// app/api/harvests/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const pageSize = parseInt(searchParams.get("pageSize") || "10")
  
  try {
    const harvests = await prisma.harvest.findMany({
      where: { userId: session.user.id },
      include: { land: true },
      orderBy: { harvestDay: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize
    })
    
    return NextResponse.json({ data: harvests })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch harvests" }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    // Validation
    const requiredFields = ["landId", "quantity", "price", "client"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 }
        )
      }
    }

    const harvest = await prisma.harvest.create({
      data: {
        ...data,
        userId: session.user.id,
        total: data.quantity * data.price
      }
    })

    return NextResponse.json(harvest, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create harvest" },
      { status: 500 }
    )
  }
}
```

### Authentication Middleware

All protected routes should include session validation:

```javascript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function authMiddleware(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
```

## 🧪 Testing Guidelines

### Component Testing
```javascript
// __tests__/components/HarvestForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { HarvestForm } from '@/components/harvest-form'
import { ThemeProvider } from '@/providers/theme-provider'

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  )
}

describe('HarvestForm', () => {
  it('renders form fields correctly', () => {
    renderWithProviders(<HarvestForm />)
    
    expect(screen.getByLabelText(/terreno/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantità/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prezzo/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    renderWithProviders(<HarvestForm />)
    
    const submitButton = screen.getByText(/salva raccolto/i)
    fireEvent.click(submitButton)
    
    expect(await screen.findByText(/seleziona un terreno/i)).toBeInTheDocument()
  })
})
```

### API Testing
```javascript
// __tests__/api/harvests.test.js
import { GET, POST } from '@/app/api/harvests/route'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@/lib/prisma')

describe('/api/harvests', () => {
  it('requires authentication', async () => {
    getServerSession.mockResolvedValue(null)
    
    const request = new Request('http://localhost:3000/api/harvests')
    const response = await GET(request)
    
    expect(response.status).toBe(401)
  })
})
```

## 📝 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/[name]`: Feature development
- `hotfix/[name]`: Critical fixes

### Commit Conventions
Follow Conventional Commits:
```
feat: add harvest editing functionality
fix: resolve payment calculation bug
docs: update API documentation
style: improve form layout spacing
refactor: extract common validation logic
test: add harvest form validation tests
```

### Pull Request Process

1. **Create feature branch**: `git checkout -b feature/harvest-analytics`
2. **Make changes**: Follow coding standards and add tests
3. **Run quality checks**:
   ```bash
   npm run lint        # ESLint checks
   npm run type-check  # TypeScript validation
   npm test           # Run test suite
   npm run build      # Verify build
   ```
4. **Create PR**: Include description, screenshots, and testing notes
5. **Code review**: Address feedback and ensure CI passes
6. **Merge**: Squash commits and update documentation

### Code Quality Standards

#### ESLint Configuration
```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      "prefer-const": "error",
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error"
    }
  }
]
```

#### Formatting
- Use Prettier with 2-space indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in multiline structures

## 🗺️ Feature Development Guide

### Adding New Models

1. **Update Prisma schema**:
   ```prisma
   model NewFeature {
     id     String @id @default(auto()) @map("_id") @db.ObjectId
     userId String @db.ObjectId
     user   User   @relation(fields: [userId], references: [id])
     // ... other fields
   }
   ```

2. **Generate and push changes**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Create API routes**: Follow existing patterns in `/api/`
4. **Build components**: Use design system components
5. **Add navigation**: Update sidebar in `app-sidebar.jsx`

### Map Integration

Subsidia uses Mapbox for land visualization:

```javascript
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'

export function LandMap({ lands }) {
  const mapContainer = useRef()
  const map = useRef()

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [12.4964, 41.9028], // Rome coordinates
        zoom: 10
      })

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      })

      map.current.addControl(draw)
    }
  }, [])

  return <div ref={mapContainer} className="h-96 w-full" />
}
```

### Form Patterns

Use React Hook Form with Zod validation:

```javascript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  amount: z.number().min(0, "Amount must be positive")
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      amount: 0
    }
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/endpoint', data)
      toast.success("Success!")
    } catch (error) {
      toast.error("Error occurred")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

## 🚨 Common Issues & Solutions

### Database Connection Issues
- Ensure MongoDB is running and accessible
- Check `DATABASE_URL` format: `mongodb://localhost:27017/subsidia`
- Verify network connectivity for MongoDB Atlas

### Build Errors
- Clear `.next` cache: `rm -rf .next`
- Regenerate Prisma client: `npx prisma generate`
- Check for missing environment variables

### Authentication Problems
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure session configuration in `auth.jsx`

### Map Display Issues
- Verify Mapbox token is valid and has proper scopes
- Check browser console for WebGL errors
- Ensure proper styling for map container

## 📚 Resources

### Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma with MongoDB](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives)

### Development Tools
- [Prisma Studio](https://www.prisma.io/studio): Database GUI
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Vercel CLI](https://vercel.com/docs/cli): Deployment tools

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers get started
- Share knowledge through issues and discussions

### Getting Help
- **Issues**: Bug reports and feature requests
- **Discussions**: Questions and general conversation
- **Discord**: Real-time community chat (if available)

### Recognition
Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Hall of fame for consistent contributors

---

**Happy coding! 🌾 Let's build amazing farm management tools together.**