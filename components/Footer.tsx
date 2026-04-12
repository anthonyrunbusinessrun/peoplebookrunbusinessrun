export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t-2 border-crimson-500 py-12 px-4 text-center">
      <div className="text-yellow-400 font-serif text-xl tracking-widest mb-2">RAY LAND INC.</div>
      <div className="text-gray-500 text-sm mb-6">Stable engineering // Design Innovation // Perpetual service</div>
      <div className="flex justify-center gap-8 mb-6 flex-wrap">
        {['rayland.com','Privacy Policy','Equal Opportunity Employer','Contact HR'].map(l => (
          <a key={l} href="#" className="text-gray-500 hover:text-yellow-400 text-xs transition-colors">{l}</a>
        ))}
      </div>
      <p className="text-gray-600 text-xs">2026 Ray Land Inc. PeopleBook Recruiting Portal. Powered by BOSS.</p>
    </footer>
  )
}
