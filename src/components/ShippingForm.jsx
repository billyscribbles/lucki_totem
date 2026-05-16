import { useState } from 'react'

// Dummy shipping form shown after a whale is pulled and the collector
// chooses physical fulfilment. Required fields must be non-empty;
// nothing is sent anywhere.

const EMPTY = {
  fullName: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  postal: '',
  country: '',
}

const REQUIRED = ['fullName', 'address1', 'city', 'region', 'postal', 'country']

export default function ShippingForm({ onSubmit, onBack }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    for (const key of REQUIRED) {
      if (!form[key].trim()) errs[key] = 'Required'
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form className="ship-form" onSubmit={handleSubmit} noValidate>
      <p className="ship-form__title">Where should we send it?</p>

      <label className="field">
        <span className="field__label">Full name</span>
        <input
          className={`field__input${errors.fullName ? ' is-error' : ''}`}
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
        />
        {errors.fullName && <span className="field__error">{errors.fullName}</span>}
      </label>

      <label className="field">
        <span className="field__label">Address</span>
        <input
          className={`field__input${errors.address1 ? ' is-error' : ''}`}
          autoComplete="address-line1"
          value={form.address1}
          onChange={(e) => setField('address1', e.target.value)}
        />
        {errors.address1 && <span className="field__error">{errors.address1}</span>}
      </label>

      <label className="field">
        <span className="field__label">Apartment, suite (optional)</span>
        <input
          className="field__input"
          autoComplete="address-line2"
          value={form.address2}
          onChange={(e) => setField('address2', e.target.value)}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field__label">City</span>
          <input
            className={`field__input${errors.city ? ' is-error' : ''}`}
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
          />
          {errors.city && <span className="field__error">{errors.city}</span>}
        </label>
        <label className="field">
          <span className="field__label">State / Province</span>
          <input
            className={`field__input${errors.region ? ' is-error' : ''}`}
            autoComplete="address-level1"
            value={form.region}
            onChange={(e) => setField('region', e.target.value)}
          />
          {errors.region && <span className="field__error">{errors.region}</span>}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field__label">Postal code</span>
          <input
            className={`field__input${errors.postal ? ' is-error' : ''}`}
            autoComplete="postal-code"
            value={form.postal}
            onChange={(e) => setField('postal', e.target.value)}
          />
          {errors.postal && <span className="field__error">{errors.postal}</span>}
        </label>
        <label className="field">
          <span className="field__label">Country</span>
          <input
            className={`field__input${errors.country ? ' is-error' : ''}`}
            autoComplete="country-name"
            value={form.country}
            onChange={(e) => setField('country', e.target.value)}
          />
          {errors.country && <span className="field__error">{errors.country}</span>}
        </label>
      </div>

      <div className="ship-form__actions">
        <button type="button" className="btn btn--line btn--sm" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn btn--gold btn--sm">
          Confirm Shipping <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}
