# Admin Dashboard - V0 Styling Branch

This branch contains only the admin dashboard components for styling with V0.

**Last Updated**: Ready for V0 styling work!

## Components Included

- `apps/admin/src/pages/AdminPage.tsx` - Main dashboard with order management
- `apps/admin/src/layout/AdminLayout.tsx` - Header layout with profile dropdown
- `apps/admin/src/components/ui/` - Shadcn UI components (Button, Tabs, Dropdown)
- `apps/admin/src/lib/utils.ts` - Utility functions

## Key Features to Style

### AdminPage Dashboard
- Order status cards (Total, Pending, Preparing, Ready, Collected, Cancelled)
- Tab navigation (Active Orders, Completed, All Orders)
- Order cards with action buttons
- Three-column kanban board layout

### AdminLayout Header
- Profile dropdown with user info
- Settings and Sign out options
- Dark navigation header

## Safe to Style
✅ All `className` properties
✅ Tailwind classes (colors, spacing, typography)
✅ Layout adjustments (flexbox, grid)
✅ Responsive breakpoints

## Keep Intact
❌ All `onClick` handlers
❌ State management (`useState`, `useMemo`)
❌ Data flow and prop passing
❌ Component structure and JSX elements with logic

## Return to Main
After styling, merge changes back to main branch:
```bash
git checkout main
git merge v0-admin-styling
```