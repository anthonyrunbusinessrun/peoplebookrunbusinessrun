import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-800 py-12 px-4 text-center">
      <div className="flex justify-center mb-4">
        <Image src="/raylandlogo.png" alt="Ray Land Inc." width={80} height={80} className="object-contain" />
      </div>
      <p className="text-gray-500 text-xs tracking-widest uppercase mb-6">
        Stable engineering // Design Innovation // Perpetual service
      </p>
      <div className="flex justify-center gap-8 text-gray-500 text-sm mb-6">
        <a href="https://rayland.com" className="hover:text-yellow-400 transition-colors">rayland.com</a>
        <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-yellow-400 transition-colors">Equal Opportunity Employer</a>
        <a href="#" className="hover:text-yellow-400 transition-colors">Contact HR</a>
      </div>
      <p className="text-gray-600 text-xs">
        2026 Ray Land Inc. PeopleBook Recruiting Portal. Powered by BOSS.
      </p>
    </footer>
  )
}
