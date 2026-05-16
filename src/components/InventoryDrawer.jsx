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
  const sealedTotal = purchases.reduce((sum, g) => sum + g.remaining, 0)

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
          {sealedTotal > 0 && (
            <section className="inv__section">
              <p className="inv__heading">Sealed Boxes</p>
              {/* Every pack — single, 3-pack, Mega Box — is the same
                  Series 01 blind box, so they pool into one stack.
                  A Mega Box just adds 8 boxes to the count. */}
              <div className="seal-card">
                <div className="seal-card__top">
                  <img
                    className="seal-card__img"
                    src="/images/blind-box.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="seal-card__info">
                    <span className="seal-card__name">Lucki Blind Box</span>
                    <span className="seal-card__sub">Series 01 · sealed</span>
                  </span>
                  <span className="seal-card__count">×{sealedTotal}</span>
                </div>
                <button
                  type="button"
                  className="btn btn--gold btn--block btn--sm"
                  onClick={() => openReveal(purchases[0].id)}
                >
                  Open Box <span aria-hidden="true">→</span>
                </button>
              </div>
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
