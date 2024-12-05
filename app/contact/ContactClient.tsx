'use client'

import { Contact } from '@/components/Contact'
import { ContactPageData } from '@/types'

interface ContactClientProps {
  contactData: ContactPageData
}

export default function ContactClient({ contactData }: ContactClientProps) {
  return (
    <div className="min-h-screen bg-black pt-20">
      <Contact
        title={contactData.title}
        description={contactData.description}
        address={contactData.address}
        phoneNumber={contactData.phoneNumber}
        email={contactData.email}
        message={contactData.contactFormMessage}
        socialLinks={contactData.socialLinks}
        info={[]} // You can populate this with previous comments if needed
      />
    </div>
  )
}
