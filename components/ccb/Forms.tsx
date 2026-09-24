'use client'

import { FormEvent, useState } from 'react'

type FormState = 'idle' | 'sending' | 'success' | 'error'

async function submitForm(endpoint: string, form: HTMLFormElement) {
  const values = Object.fromEntries(new FormData(form).entries())
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  if (!response.ok) throw new Error('Unable to submit')
}

function Status({ state }: { state: FormState }) {
  if (state === 'success') return <p className="form-success" role="status">Thank you — we received your information and will be in touch.</p>
  if (state === 'error') return <p className="form-error" role="alert">We could not submit the form. Please call (352) 341-7707.</p>
  return null
}

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending')
    try { await submitForm('/api/contact', event.currentTarget); event.currentTarget.reset(); setState('success') } catch { setState('error') }
  }
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="field-row"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div>
      <div className="field-row"><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" /></label></div>
      <label>How can we help?<select name="subject" required defaultValue=""><option value="" disabled>Select a topic</option><option>General question</option><option>Donations</option><option>Volunteering</option><option>Program enrollment</option><option>Media inquiry</option></select></label>
      <label>Message<textarea name="message" rows={5} required /></label>
      <button className="button" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button>
      <Status state={state} />
    </form>
  )
}

export function EnrollmentForm() {
  const [state, setState] = useState<FormState>('idle')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending')
    try { await submitForm('/api/enrollment', event.currentTarget); event.currentTarget.reset(); setState('success') } catch { setState('error') }
  }
  return (
    <form className="form-card enrollment-form" onSubmit={onSubmit}>
      <h2>Request confidential enrollment support</h2>
      <p>Complete this short form and our program team will contact you. Your information is kept private.</p>
      <div className="field-row"><label>Parent or guardian name<input name="parentName" required /></label><label>Phone<input name="phone" type="tel" required /></label></div>
      <div className="field-row"><label>Email<input name="email" type="email" required /></label><label>ZIP code<input name="zipCode" inputMode="numeric" required /></label></div>
      <div className="field-row"><label>School<input name="school" required /></label><label>Number of children<input name="childCount" type="number" min="1" max="20" required /></label></div>
      <label className="check-field"><input name="consent" type="checkbox" value="true" required /> I consent to be contacted about Citrus County Blessings programs.</label>
      <button className="button" disabled={state === 'sending'}>{state === 'sending' ? 'Submitting…' : 'Submit request'}</button>
      <Status state={state} />
    </form>
  )
}

export function VolunteerForm() {
  const [state, setState] = useState<FormState>('idle')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending')
    try { await submitForm('/api/volunteer', event.currentTarget); event.currentTarget.reset(); setState('success') } catch { setState('error') }
  }
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <h2>Volunteer with us</h2>
      <div className="field-row"><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label></div>
      <div className="field-row"><label>Phone<input name="phone" type="tel" /></label><label>Availability<select name="availability" required defaultValue=""><option value="" disabled>Select availability</option><option>Weekday mornings</option><option>Weekday afternoons</option><option>Evenings</option><option>Weekends</option><option>Event-based only</option></select></label></div>
      <label>Skills or interests<textarea name="message" rows={4} placeholder="Packing, delivery, events, office support…" /></label>
      <button className="button" disabled={state === 'sending'}>{state === 'sending' ? 'Submitting…' : 'Join the volunteer list'}</button>
      <Status state={state} />
    </form>
  )
}

export function NewsletterForm() {
  const [state, setState] = useState<FormState>('idle')
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending')
    try { await submitForm('/api/newsletter', event.currentTarget); event.currentTarget.reset(); setState('success') } catch { setState('error') }
  }
  return (
    <form className="newsletter-form" onSubmit={onSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <input id="newsletter-email" name="email" type="email" placeholder="Your email address" required />
      <button disabled={state === 'sending'}>{state === 'sending' ? 'Joining…' : 'Join the list'}</button>
      {state === 'success' && <span role="status">You’re on the list.</span>}
      {state === 'error' && <span role="alert">Please try again.</span>}
    </form>
  )
}

