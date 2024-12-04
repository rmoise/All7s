interface IntroProps {
  title: string
  subtitle?: string
}

const Intro: React.FC<IntroProps> = ({ title, subtitle }) => {
  return (
    <section className="flex flex-col md:flex-row md:justify-between items-center mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-white mb-4 md:mb-0">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-300 max-w-md text-center md:text-right">
          {subtitle}
        </p>
      )}
    </section>
  )
}

export default Intro
