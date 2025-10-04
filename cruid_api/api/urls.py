# backend/api/urls.py
# এই file টি backend/api/ folder এ থাকবে
# পুরনো urls.py file এর content replace করে এটা দিন

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    # Authentication
    RegisterView, LoginView, UserProfileView, UpdateUserProfileView,
    
    # Categories & Tags
    CategoryListView, CategoryDetailView,
    TagListView, TagDetailView,
    
    # Posts
    PostListCreateView, PostDetailView, MyPostsView,
    
    # Comments
    CommentListCreateView, CommentDetailView,
    
    # Likes
    LikeToggleView, PostLikesView,
    
    # Bookmarks
    BookmarkToggleView, MyBookmarksView,
    
    # Follow
    FollowToggleView, MyFollowingView, MyFollowersView,
    
    # Timeline & Search
    TimelineView, GlobalSearchView,
)

urlpatterns = [
    # ==================== Authentication URLs ====================
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateUserProfileView.as_view(), name='profile-update'),
    
    # ==================== Category URLs ====================
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # ==================== Tag URLs ====================
    path('tags/', TagListView.as_view(), name='tag-list'),
    path('tags/<slug:slug>/', TagDetailView.as_view(), name='tag-detail'),
    
    # ==================== Post URLs ====================
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/my/', MyPostsView.as_view(), name='my-posts'),
    
    # ==================== Comment URLs ====================
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # ==================== Like URLs ====================
    path('posts/<int:post_id>/like/', LikeToggleView.as_view(), name='like-toggle'),
    path('posts/<int:post_id>/likes/', PostLikesView.as_view(), name='post-likes'),
    
    # ==================== Bookmark URLs ====================
    path('posts/<int:post_id>/bookmark/', BookmarkToggleView.as_view(), name='bookmark-toggle'),
    path('bookmarks/', MyBookmarksView.as_view(), name='my-bookmarks'),
    
    # ==================== Follow URLs ====================
    path('users/<int:user_id>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    path('following/', MyFollowingView.as_view(), name='my-following'),
    path('followers/', MyFollowersView.as_view(), name='my-followers'),
    
    # ==================== Timeline & Search URLs ====================
    path('timeline/', TimelineView.as_view(), name='timeline'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
]