# backend/api/views.py
# এই file টি backend/api/ folder এ থাকবে
# পুরনো views.py file এর content replace করে এটা দিন

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    Post, Comment, Like, Bookmark, Follow,
    UserProfile, Category, Tag
)
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserProfileSerializer,
    PostListSerializer, PostDetailSerializer, PostWriteSerializer,
    CommentSerializer, LikeSerializer, BookmarkSerializer, FollowSerializer,
    CategorySerializer, TagSerializer
)

# Pagination
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

# ==================== Authentication Views ====================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UpdateUserProfileView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

# ==================== Category Views ====================

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

# ==================== Tag Views ====================

class TagListView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

# ==================== Post Views ====================

class PostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author', 'category', 'status']
    search_fields = ['title', 'content', 'author__username']
    ordering_fields = ['created_at', 'views_count', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Post.objects.filter(status='published')
        
        # Tag filtering
        tag_slug = self.request.query_params.get('tag', None)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        return queryset.select_related('author', 'category').prefetch_related('tags', 'likes', 'comments')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostWriteSerializer
        return PostListSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostWriteSerializer
        return PostDetailSerializer
    
    def get_queryset(self):
        # For update/delete, only owner can access
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Post.objects.filter(author=self.request.user)
        return Post.objects.all()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class MyPostsView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).select_related('author', 'category').prefetch_related('tags')



# ==================== Comment Views (FIXED) ====================

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id, parent=None).select_related('author').order_by('-created_at')
    
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        try:
            post = Post.objects.get(id=post_id)
            serializer.save(author=self.request.user, post=post)
        except Post.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Post not found')

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Only owner can update/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Comment.objects.filter(author=self.request.user)
        return Comment.objects.all()
    
    
# ==================== Like Views ====================

class LikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            # Unlike
            like.delete()
            return Response({'message': 'Post unliked', 'liked': False}, status=status.HTTP_200_OK)
        
        return Response({'message': 'Post liked', 'liked': True}, status=status.HTTP_201_CREATED)

class PostLikesView(generics.ListAPIView):
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Like.objects.filter(post_id=post_id).select_related('user')

# ==================== Bookmark Views ====================

class BookmarkToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            # Remove bookmark
            bookmark.delete()
            return Response({'message': 'Bookmark removed', 'bookmarked': False}, status=status.HTTP_200_OK)
        
        return Response({'message': 'Post bookmarked', 'bookmarked': True}, status=status.HTTP_201_CREATED)

class MyBookmarksView(generics.ListAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related('post__author')

# ==================== Follow Views ====================

class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        if request.user.id == user_id:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_to_follow = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=user_to_follow
        )
        
        if not created:
            # Unfollow
            follow.delete()
            return Response({'message': 'Unfollowed', 'following': False}, status=status.HTTP_200_OK)
        
        return Response({'message': 'Followed', 'following': True}, status=status.HTTP_201_CREATED)

class MyFollowingView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).select_related('following')

class MyFollowersView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return Follow.objects.filter(following=self.request.user).select_related('follower')

# ==================== Timeline/Feed View ====================

class TimelineView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user = self.request.user
        # Posts from users that current user follows
        following_users = user.following.values_list('following', flat=True)
        return Post.objects.filter(
            author__in=following_users,
            status='published'
        ).select_related('author', 'category').prefetch_related('tags').order_by('-created_at')

# ==================== Search View ====================

class GlobalSearchView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Post.objects.filter(
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(author__username__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct().filter(status='published')
        return Post.objects.none()