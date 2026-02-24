import React from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, Button } from './ui';
import { formatTime } from '../utils/helpers';

export function BlogView() {
  const { blogs, currentUser, likeBlog, openModal } = useApp();

  return (
    <div className="blog-view">
      <div className="blog-header">
        <h2><i className="fas fa-feather-alt" /> Blog Feed</h2>
        <Button onClick={() => openModal('blog')}>
          <i className="fas fa-plus" /> Write
        </Button>
      </div>
      
      <div className="blog-grid">
        {blogs.length === 0 ? (
          <div className="empty-state full-width">
            <i className="fas fa-book-open" />
            <p>No blog posts yet</p>
            <Button onClick={() => openModal('blog')}>Create your first post</Button>
          </div>
        ) : (
          blogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} onLike={() => likeBlog(blog.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog, onLike }: { blog: any; onLike: () => void }) {
  return (
    <div className="blog-card">
      <div className="blog-card-cover">
        <img src={blog.image} alt={blog.title} />
        {blog.tags.length > 0 && (
          <span className="blog-card-tag">{blog.tags[0]}</span>
        )}
      </div>
      <div className="blog-card-content">
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-excerpt">{blog.content}</p>
        <div className="blog-card-meta">
          <div className="blog-card-author">
            <Avatar src={blog.authorAvatar} alt={blog.authorName} size="sm" />
            <span className="blog-card-author-name">{blog.authorName}</span>
          </div>
          <div className="blog-card-stats">
            <button onClick={onLike} className="like-btn">
              <i className={`fas fa-heart ${blog.liked ? 'liked' : ''}`} /> {blog.likes}
            </button>
            <button>
              <i className="fas fa-comment" /> {blog.comments}
            </button>
          </div>
        </div>
        <span className="blog-card-date">{formatTime(blog.createdAt)}</span>
      </div>
    </div>
  );
}
