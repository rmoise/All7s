import PostPreview from '@/components/Blog/PostPreview'
import { Post } from '@/types'

interface RelatedPostsProps {
  posts: Post[]
  title?: string
}

export default function RelatedPosts({
  posts,
  title = 'Related Posts',
}: RelatedPostsProps) {
  return (
    <section>
      <div className={`grid grid-cols-1 ${posts?.length > 1 ? 'md:grid-cols-2' : ''} gap-12`}>
        {posts?.map((post) => (
          <PostPreview
            key={post._id}
            title={post.title}
            coverImage={post.mainImage}
            date={post._createdAt}
            author={post.author}
            slug={post.slug.current}
            excerpt={post.excerpt}
            categories={post.categories}
          />
        ))}
      </div>
    </section>
  )
}
