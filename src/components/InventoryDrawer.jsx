import { Gem } from 'lucide-react'
import { useLucki } from '../store/LuckiContext.jsx'
import { getRarity } from '../data/rarities.js'
import Drawer from './Drawer.jsx'
import WhaleOrb from './WhaleOrb.jsx'

// Inventory: sealed boxes still to open, plus the collection of whales
// already pulled.
export default function InventoryDrawer() {
  const { drawer, closeDrawer, purchases, collection, openReveal } = useLucki()
  const open = drawer === 'inventory'
  const isEmpty = purchases.length === 0 && collection.length === 0

  return (
    <Drawer open={open} onClose={closeDrawer} title="Your Inventory">
      {isEmpty ? (
        <div className="drawer-empty">
          <span className="drawer-empty__icon">
            <Gem size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="drawer-empty__title">Your inventory is empty</p>
          <p className="drawer-empty__sub">Buy a blind box to start collecting.</p>
        </div>
      ) : (
        <div className="inv">
          {purchases.length > 0 && (
            <section className="inv__section">
              <p className="inv__heading">Sealed Boxes</p>
              {purchases.map((group) => (
                <div className="seal-card" key={group.id}>
                  <div className="seal-card__top">
                    <WhaleOrb rarity={group.orb} size={50} animated={false} />
                    <span className="seal-card__info">
                      <span className="seal-card__name">{group.name}</span>
                      <span className="seal-card__sub">{group.sub}</span>
                    </span>
                    <span className="seal-card__count">×{group.remaining}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--gold btn--block btn--sm"
                    onClick={() => openReveal(group.id)}
                  >
                    Open Box <span aria-hidden="true">→</span>
                  </button>
                </div>
              ))}
            </section>
          )}

          {collection.length > 0 && (
            <section className="inv__section">
              <p className="inv__heading">Collection</p>
              {collection.map((item) => {
                const rarity = getRarity(item.rarityKey)
                return (
                  <div
                    className="inv-row"
                    key={item.id}
                    style={{ '--r': rarity.color }}
                  >
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
            </section>
          )}
        </div>
      )}
    </Drawer>
  )
}
