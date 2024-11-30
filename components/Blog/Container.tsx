import Grid from '@/components/common/Grid/Grid'

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <Grid maxWidth="7xl" className="bg-black text-white">
      {children}
    </Grid>
  )
}