import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cart'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQty, remove, clear } = useCartStore()
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Cart</h1>
      {items.length === 0 ? (
        <div>No items. <button className="underline" onClick={() => navigate('/menu')}>Browse menu</button></div>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between border-b border-zinc-200 py-2">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-zinc-500">{i.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) => updateQty(i.id, Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded border border-zinc-300 px-2 py-1"
                  />
                  <button className="text-red-600" onClick={() => remove(i.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <div className="font-semibold">Total: {total.toFixed(2)}</div>
            <div className="flex gap-2">
              <button className="underline" onClick={() => navigate('/menu')}>Add more</button>
              <button className="px-3 py-1 rounded-md bg-zinc-900 text-white" onClick={() => navigate('/checkout')}>Checkout</button>
              <button className="px-3 py-1 rounded-md" onClick={clear}>Clear</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

