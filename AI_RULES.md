# Tech Stack & Usage Rules

- **Framework**: React 18 with TypeScript
- **Routing**: React Router (v6) – keep all route definitions in `src/App.tsx`
- **Styling**: Tailwind CSS – use utility classes for layout, spacing, colors, typography, etc.
- **UI Components**: shadcn/ui library – prefer its prebuilt components; import them as needed and **do not modify** the source files. If customization is required, create a new component that wraps or extends the shadcn/ui component.
- **Icons**: lucide-react – use for all icon needs; import individual icons (e.g., `import { User } from "lucide-react"`).
- **State Management**: React's built-in hooks (`useState`, `useEffect`, `useContext`) – avoid external state libraries unless explicitly required.
- **Forms**: Use React Hook Form (if available) or controlled components with shadcn/ui form elements; perform validation with Zod or Yup when needed.
- **Data Fetching**: Use `fetch` or axios wrapped in a custom hook; keep API calls in a `src/services/` or `src/api/` folder.
- **Code Organization**:
  - Pages → `src/pages/` (each page is a component routed via React Router)
  - Reusable UI → `src/components/` (atoms, molecules, organisms)
  - Custom hooks → `src/hooks/`
  - Utilities → `src/utils/`
  - Styles (global Tailwind config) → `src/index.css` (do not edit unless configuring Tailwind)
- **Main Page**: The default route renders `src/pages/Index.tsx`; always update this file to showcase new components or features.
- **Linting/Formatting**: Follow the existing ESLint and Prettier configuration; do not disable rules without consensus.
- **Testing**: If tests are added, place them alongside the file they test (`*.test.tsx`) or in a `__tests__` folder; use Vitest and React Testing Library.

These rules ensure consistency, maintainability, and leverage the installed libraries effectively.