import { client } from '../../lib/client'
import Link from 'next/link'

const AllPosts = ({ postInfo }) => {
    return (
        <div className="bg-black px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
            <div className="relative mx-auto max-w-lg divide-y-2 divide-white lg:max-w-7xl">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-Headline">
                        ALL7Z BLOG
                    </h2>
                </div>
                <div className="mt-6 grid gap-16 pt-10 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
                    {postInfo.map((post) => (
                        <div key={post.title}>
                            <p className="text-sm text-white"></p>
                            <Link href={'/blog/' + post.title.split(" ").join("-").toLowerCase()} key={post.id}>
                                <a className="text-xl font-semibold text-indigo-600 hover:text-indigo-500">
                                    {post.title}
                                </a>
                            </Link>
                            <div className="mt-3">
                                <Link href={'/blog/' + post.title.split(" ").join("-").toLowerCase()} key={post.id}>
                                    <a className="text-base font-semibold text-indigo-600 hover:text-indigo-500">
                                        Read full story
                                    </a>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AllPosts;
