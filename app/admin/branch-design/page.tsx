"use client"
// Import the AdminPage component directly from your repo files
import AdminPage from "../../../apps/admin/src/pages/AdminPage"

// Simple mock data to populate the UI
const sampleOrders = [
  {
    id: "ORD-1001",
    placedAt: "09:12 AM",
    pickupEta: "10m",
    items: [
      { name: "Iced Latte", qty: 1, price: 4.75 },
      { name: "Blueberry Muffin", qty: 1, price: 3.1 },
    ],
    total: 7.85,
    status: "pending",
  },
  {
    id: "ORD-1002",
    placedAt: "09:20 AM",
    pickupEta: "5m",
    items: [
      { name: "Cappuccino", qty: 2, price: 3.95 },
      { name: "Croissant", qty: 1, price: 2.5 },
    ],
    total: 10.4,
    status: "preparing",
  },
  {
    id: "ORD-1003",
    placedAt: "09:28 AM",
    pickupEta: "2m",
    items: [{ name: "Cold Brew", qty: 1, price: 3.75 }],
    total: 3.75,
    status: "ready",
  },
  {
    id: "ORD-1004",
    placedAt: "08:54 AM",
    pickupEta: "Now",
    items: [
      { name: "Matcha Latte", qty: 1, price: 4.25 },
      { name: "Banana Bread", qty: 1, price: 3.25 },
    ],
    total: 7.5,
    status: "collected",
  },
  {
    id: "ORD-1005",
    placedAt: "08:45 AM",
    pickupEta: "—",
    items: [{ name: "Americano", qty: 1, price: 3.25 }],
    total: 3.25,
    status: "cancelled",
  },
  {
    id: "ORD-1006",
    placedAt: "09:34 AM",
    pickupEta: "7m",
    items: [
      { name: "Flat White", qty: 1, price: 4.1 },
      { name: "Cookie", qty: 2, price: 1.5 },
    ],
    total: 7.1,
    status: "pending",
  },
  {
    id: "ORD-1007",
    placedAt: "09:38 AM",
    pickupEta: "4m",
    items: [{ name: "Mocha", qty: 1, price: 4.35 }],
    total: 4.35,
    status: "preparing",
  },
  {
    id: "ORD-1008",
    placedAt: "09:40 AM",
    pickupEta: "1m",
    items: [{ name: "Espresso", qty: 2, price: 2.25 }],
    total: 4.5,
    status: "ready",
  },
] as const

export default function BranchDesignPreview() {
  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">AdminPage.tsx (from your branch)</h1>
          <p className="text-sm text-neutral-600">Rendering apps/admin/src/pages/AdminPage.tsx with sample orders.</p>
        </div>
        <AdminPage orders={sampleOrders as any} />
      </div>
    </div>
  )
}
