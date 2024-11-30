import { format } from 'date-fns'

export default function DateFormatter({ dateString }: { dateString: string }) {
  return (
    <time dateTime={dateString}>
      {format(new Date(dateString), 'LLLL d, yyyy')}
    </time>
  )
} 