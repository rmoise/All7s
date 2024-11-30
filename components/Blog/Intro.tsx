export default function Intro({ title }: { title: string }) {
  return (
    <section className="flex flex-col md:flex-row items-center md:justify-between pt-32 pb-8">
      <h1 className="text-6xl md:text-7xl font-black mb-8 md:mb-0 text-white text-left leading-tight tracking-tighter">
        {title}
      </h1>
      <p className="text-lg text-gray-400">
        Exploring West Coast Music, Lifestyle, and Culture
      </p>
    </section>
  )
}
