import Link from "next/link"

export default function Header() {
  return (
    <header className="p-5 flex justify-between max-w-7xl mx-auto">
      <div className="flex items-center space-x-5">
        <Link href="/">
          <a><img className="w-44 object-contain cursor-pointer" src="https://links.papareact.com/yvf" alt="medium-logo" /></a>
        </Link>
        <div className="hidden md:inline-flex items-center space-x-5">
          <h3>About</h3>
          <h3>Contact</h3>
          <h3 className="text-white bg-green-600 px-4 py-1 rounded-full">Follow</h3>
        </div>
      </div>
      <div className="flex items-center space-x-5 text-green-600">
        <h3 className="">Sign In</h3>
        <h3 className="border border-green-600 px-4 py-1 rounded-full">Get Started</h3>
      </div>
    </header>
  )
}