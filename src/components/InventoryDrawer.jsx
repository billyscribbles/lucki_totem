import { Gem } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import { getRarity } from '../data/rarities.js'
import Drawer from './Drawer.jsx'
import WhaleOrb from './WhaleOrb.jsx'

// The collection: every whale pulled, newest first.
export default function InventoryDrawer() {
  const { drawer, closeDrawer, inventory } = useLucki()
  const open = drawer === 'inventory'

  return (
    <Drawer open={open} onClose={closeDrawer} title="Your Collection">
      {inventory.length === 0 ? (
        <div className="drawer-empty">
          <span className="drawer-empty__icon">
            <Gem size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="drawer-empty__title">Your collection is empty</p>
          <p className="drawer-empty__sub">Open a blind box to start collecting.</p>
        </div>
      ) : (
        <div className="inv">
          {inventory.map((item) => {
            const rarity = getRarity(item.rarityKey)
            return (
              <div className="inv-row" key={item.id} style={{ '--r': rarity.color }}>
                <WhaleOrb rarity={item.rarityKey} size={64} animated={false} />
                <span className="inv-row__info">
                  <span className="inv-row__tier">{rarity.label}</span>
                  <span className="inv-row__name">{item.whale}</span>
                  <span className="inv-row__meta">
                    #{item.serial} · {item.date}
                  </span>
                </span>
                {item.shipping && <span className="inv-row__ship">Shipping</span>}
              </div>
            )
          })}
        </div>
      )}
    </Drawer>
  )
}
