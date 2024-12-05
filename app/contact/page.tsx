import { Metadata } from 'next'
import { fetchSanity } from '@lib/sanity'
import ContactClient from './ContactClient'
import { notFound } from 'next/navigation'
import type { ContactPageData } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const contactData = await fetchSanity<ContactPageData>(
    `*[_type == "contactPage" && (_id == "singleton-contactPage" || _id == "drafts.singleton-contactPage")] | order(_id desc)[0]{
      title,
      description,
      seo
    }`
  )

  return {
    title:
      contactData?.seo?.metaTitle ?? contactData?.title ?? 'Contact - All7Z',
    description:
      contactData?.seo?.metaDescription ??
      contactData?.description ??
      'Contact All7Z',
  }
}

export default async function ContactPage() {
  try {
    const contactData = await fetchSanity<ContactPageData>(
      `*[_type == "contactPage" && (_id == "singleton-contactPage" || _id == "drafts.singleton-contactPage")] | order(_id desc)[0]{
        title,
        description,
        address,
        phoneNumber,
        email,
        contactFormMessage,
        socialLinks[] {
          platform,
          url
        }
      }`
    )

    if (!contactData) {
      console.error('Contact page document not found in Sanity')
      return notFound()
    }

    return (
      <div className="min-h-screen bg-black">
        <ContactClient contactData={contactData} />
      </div>
    )
  } catch (error) {
    console.error('Error loading contact page:', error)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Unable to load contact information. Please try again later.</p>
      </div>
    )
  }
}
