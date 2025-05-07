import { lazy, Suspense } from "react";
import useAuth from "@/hooks/useAuth";
import { multiFormatDateString } from "@/lib/utils";
import { IPost } from "@/types";
import { Link } from "react-router-dom";
import Loader from "./Loader";

const PostStats = lazy(() => import("./PostStats"));
const CommentForm = lazy(() => import("../forms/CommentForm"));
const CommentsView = lazy(() => import("./CommentsView"));

type PostCardProps = {
  post: IPost;
};

const PostCard = ({ post }: PostCardProps) => {
  const user = useAuth();

  return (
    <div className="bg-black p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator._id}`}>
            <img
              src={
                post.creator.profilePicture ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-gray-800">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-gray-500">
              <p className="subtle-semibold lg:small-regular">
                {multiFormatDateString(post.createdAt)}
              </p>
              {post.location && (
                <>
                  •
                  <p className="subtle-semibold lg:small-regular">
                    {post.location}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post._id}`}
          className={`${user.id !== post.creator._id ? "hidden" : "hover:opacity-80 transition-opacity"}`}
        >
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
            className="filter brightness-0"
          />
        </Link>
      </div>

      <Link to={`/posts/${post._id}`} className="block mt-4">
        <div className="small-medium lg:base-medium py-4 text-gray-800">
          <p>{post.caption}</p>
          <ul className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag: string, index: number) => (
              <li 
                key={`${tag}${index}`} 
                className="text-gray-500 small-regular bg-gray-50 px-2 py-1 rounded-md"
              >
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={post.content || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="w-full h-full object-cover rounded-xl border border-gray-100"
        />
      </Link>

      <div className="flex flex-col items-start gap-4 mt-6">
        <Suspense fallback={<Loader />}>
          <PostStats post={post} />
          <CommentsView post={post} />
          <CommentForm post={post} />
        </Suspense>
      </div>
    </div>
  );
};
export default PostCard;