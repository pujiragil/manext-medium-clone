import { GetStaticProps } from "next"
import PortableText from "react-portable-text"
import Header from "../../components/Header"
import { sanityClient, urlFor } from "../../sanity"
import { Post } from "../../typing"
import { useForm, SubmitHandler } from "react-hook-form"
import { useState } from "react"

interface Props {
  post: Post
}

interface FormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

function Post({ post }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>()

  const submitHandler: SubmitHandler<FormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(() => {
      setSubmitted(false)
    }).catch(error => {
      setSubmitted(false)
    })
  }

  return (
    <main>
      <Header />

      <img className="w-full h-40 object-cover" src={urlFor(post.mainImage).url()!} alt={post.title} />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-4xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>

        <div className="flex items-center space-x-2">
          <img className="h-10 w-10 rounded-full object-cover" src={urlFor(post.author.image).url()!} alt={post.author.name} />
          <p className="font-light text-sm">Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
        </div>
        <div className="mt-10">
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={
              {
                h1: (props: any) => {
                  return <h1 className="text-2xl font-bold my-5" {...props} />
                },
                h2: (props: any) => {
                  return <h2 className="text-xl font-bold my-5" {...props} />
                },
                normal: (props: any) => {
                  return <p className="mt-5" {...props} />
                },
                li: ({ children }: any) => {
                  return <li className="ml-4 list-disc">{children}</li>
                },
                link: ({ href, children }: any) => {
                  return <a href={href} className="text-blue-500 hover:underline">{children}</a>
                }
              }
            } />
        </div>
      </article>

      <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />
      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto text-center md:text-left">
          <h3 className="text-3xl font-bold">Thank you for submitting your comment!</h3>
          <p>Once it has been approved, it will appear below!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
          <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave comment below!</h4>
          <hr className="py-3 mt-2" />

          <input {...register("_id")} name="_id" value={post._id} type="hidden" />

          <label className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input {...register("name", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring-1 focus:ring-yellow-500" placeholder="e.g Owi Odo" type="text" />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input {...register("email", { required: true })} className="shadow border rounded py-2 px-3 form-input mt-1 block w-full outline-none focus:ring-1 focus:ring-yellow-500" placeholder="e.g owibanteng@gmail.com" type="email" />
          </label>
          <label className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea {...register("comment", { required: true })} className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full outline-none focus:ring-1 focus:ring-yellow-500" placeholder="e.g Yo ndak tau kok tanya saya..." rows={8} />
          </label>

          {/* Error validation */}
          <div className="flex flex-col p-5 text-red-500">
            {errors.name && <span>- The name field is required</span>}
            {errors.email && <span>- The email field is required</span>}
            {errors.comment && <span>- The comment field is required</span>}
          </div>

          <input className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer" type="submit" value="Submit" />
        </form>
      )}

      {/* Comments */}
      <div className="flex flex-col p-10 my-10 mx-auto max-w-2xl shadow-yellow-500 shadow space-y-2 rounded">
        <h3 className="text-2xl">Comments</h3>
        <hr />

        {post.comments.map(comment => (
          <div key={comment._id}>
            <p className="text-gray-600"><span className="text-yellow-500">{comment.name} :</span> {comment.comment}</p>
          </div>
        ))}
      </div>
    </main>

  )
}

export default Post

export const getStaticPaths = async () => {
  const query = `*[_type == "post"]{
    _id,
    slug {
      current
    }
  }`

  const posts = await sanityClient.fetch(query)

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current
    }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    _createdAt,
    title,
    author -> {
      name,
      image,
    },
    'comments': *[
      _type == "comment" && post._ref == ^._id && approved == true
    ],
    description,
    mainImage,
    slug,
    body
  }`

  const post = await sanityClient.fetch(query, {
    slug: params?.slug
  })

  if (!post) return { notFound: true }

  return {
    props: {
      post
    },
    revalidate: 60,
  }
}