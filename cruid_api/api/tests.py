# backend/api/tests.py
# এই file টি backend/api/ folder এ থাকবে
# পুরনো tests.py file replace করে এটা দিন

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import Post, Comment, Like, Bookmark, Category, Tag, UserProfile
import json

# ==================== Unit Tests ====================

class UserModelTest(TestCase):
    """Test User and UserProfile models"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_user_creation(self):
        """Test that user is created correctly"""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_user_profile_created(self):
        """Test that user profile is auto-created"""
        profile = UserProfile.objects.get(user=self.user)
        self.assertIsNotNone(profile)
        self.assertEqual(profile.user, self.user)

class CategoryModelTest(TestCase):
    """Test Category model"""
    
    def test_category_creation(self):
        """Test category creation"""
        category = Category.objects.create(
            name='Technology',
            description='Tech related posts'
        )
        self.assertEqual(category.name, 'Technology')
        self.assertEqual(category.slug, 'technology')
        self.assertEqual(str(category), 'Technology')

class TagModelTest(TestCase):
    """Test Tag model"""
    
    def test_tag_creation(self):
        """Test tag creation"""
        tag = Tag.objects.create(name='Django')
        self.assertEqual(tag.name, 'Django')
        self.assertEqual(tag.slug, 'django')
        self.assertEqual(str(tag), 'Django')

class PostModelTest(TestCase):
    """Test Post model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Technology')
        self.tag1 = Tag.objects.create(name='Django')
        self.tag2 = Tag.objects.create(name='Python')
    
    def test_post_creation(self):
        """Test post creation"""
        post = Post.objects.create(
            title='Test Post',
            content='This is test content',
            author=self.user,
            category=self.category
        )
        post.tags.add(self.tag1, self.tag2)
        
        self.assertEqual(post.title, 'Test Post')
        self.assertEqual(post.author, self.user)
        self.assertEqual(post.category, self.category)
        self.assertEqual(post.tags.count(), 2)
        self.assertEqual(post.views_count, 0)
        self.assertEqual(post.status, 'published')
    
    def test_post_str(self):
        """Test post string representation"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        self.assertEqual(str(post), 'Test Post')
    
    def test_post_increment_views(self):
        """Test view count increment"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        initial_views = post.views_count
        post.increment_views()
        post.refresh_from_db()
        self.assertEqual(post.views_count, initial_views + 1)

class CommentModelTest(TestCase):
    """Test Comment model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
    
    def test_comment_creation(self):
        """Test comment creation"""
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Test comment'
        )
        self.assertEqual(comment.post, self.post)
        self.assertEqual(comment.author, self.user)
        self.assertEqual(comment.content, 'Test comment')
        self.assertIsNone(comment.parent)
    
    def test_comment_reply(self):
        """Test nested comment (reply)"""
        parent_comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Parent comment'
        )
        reply = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Reply comment',
            parent=parent_comment
        )
        self.assertEqual(reply.parent, parent_comment)
        self.assertEqual(parent_comment.replies.count(), 1)

class LikeModelTest(TestCase):
    """Test Like model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
    
    def test_like_creation(self):
        """Test like creation"""
        like = Like.objects.create(user=self.user, post=self.post)
        self.assertEqual(like.user, self.user)
        self.assertEqual(like.post, self.post)
    
    def test_like_unique_constraint(self):
        """Test that a user can't like a post twice"""
        Like.objects.create(user=self.user, post=self.post)
        
        # Try to create duplicate like
        with self.assertRaises(Exception):
            Like.objects.create(user=self.user, post=self.post)

# ==================== Integration Tests (API Tests) ====================

class AuthenticationAPITest(APITestCase):
    """Test Authentication APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
    
    def test_user_registration(self):
        """Test user registration"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
    
    def test_user_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'differentpass',
            'first_name': 'New',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_login(self):
        """Test user login"""
        # Create user first
        user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Login
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'username': 'wronguser',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class PostAPITest(APITestCase):
    """Test Post APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Technology')
        self.tag = Tag.objects.create(name='Django')
        
        # Login to get token
        login_url = reverse('login')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_create_post(self):
        """Test creating a post"""
        url = reverse('post-list-create')
        data = {
            'title': 'Test Post',
            'content': 'This is test content',
            'category_id': self.category.id,
            'tag_ids': [self.tag.id],
            'status': 'published'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.first().title, 'Test Post')
    
    def test_list_posts(self):
        """Test listing posts"""
        # Create some posts
        Post.objects.create(
            title='Post 1',
            content='Content 1',
            author=self.user
        )
        Post.objects.create(
            title='Post 2',
            content='Content 2',
            author=self.user
        )
        
        url = reverse('post-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_post(self):
        """Test retrieving a single post"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        
        url = reverse('post-detail', kwargs={'pk': post.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Post')
    
    def test_update_post(self):
        """Test updating a post"""
        post = Post.objects.create(
            title='Original Title',
            content='Original content',
            author=self.user
        )
        
        url = reverse('post-detail', kwargs={'pk': post.id})
        data = {
            'title': 'Updated Title',
            'content': 'Updated content',
            'status': 'published'
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        post.refresh_from_db()
        self.assertEqual(post.title, 'Updated Title')
    
    def test_delete_post(self):
        """Test deleting a post"""
        post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        
        url = reverse('post-detail', kwargs={'pk': post.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Post.objects.count(), 0)
    
    def test_search_posts(self):
        """Test searching posts"""
        Post.objects.create(
            title='Django Tutorial',
            content='Learn Django',
            author=self.user
        )
        Post.objects.create(
            title='React Guide',
            content='Learn React',
            author=self.user
        )
        
        url = reverse('post-list-create')
        response = self.client.get(url, {'search': 'Django'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Django Tutorial')

class CommentAPITest(APITestCase):
    """Test Comment APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        
        # Login
        login_url = reverse('login')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_create_comment(self):
        """Test creating a comment"""
        url = reverse('comment-list-create', kwargs={'post_id': self.post.id})
        data = {'content': 'Test comment'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
    
    def test_list_comments(self):
        """Test listing comments"""
        Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Comment 1'
        )
        Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Comment 2'
        )
        
        url = reverse('comment-list-create', kwargs={'post_id': self.post.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_delete_comment(self):
        """Test deleting a comment"""
        comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='Test comment'
        )
        
        url = reverse('comment-detail', kwargs={'pk': comment.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Comment.objects.count(), 0)

class LikeAPITest(APITestCase):
    """Test Like APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        
        # Login
        login_url = reverse('login')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_toggle_like(self):
        """Test liking a post"""
        url = reverse('like-toggle', kwargs={'post_id': self.post.id})
        
        # First request: Like
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['liked'])
        self.assertEqual(Like.objects.count(), 1)
        
        # Second request: Unlike
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['liked'])
        self.assertEqual(Like.objects.count(), 0)

class BookmarkAPITest(APITestCase):
    """Test Bookmark APIs"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.post = Post.objects.create(
            title='Test Post',
            content='Test content',
            author=self.user
        )
        
        # Login
        login_url = reverse('login')
        response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_toggle_bookmark(self):
        """Test bookmarking a post"""
        url = reverse('bookmark-toggle', kwargs={'post_id': self.post.id})
        
        # First request: Bookmark
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['bookmarked'])
        self.assertEqual(Bookmark.objects.count(), 1)
        
        # Second request: Remove bookmark
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['bookmarked'])
        self.assertEqual(Bookmark.objects.count(), 0)
    
    def test_list_bookmarks(self):
        """Test listing bookmarks"""
        Bookmark.objects.create(user=self.user, post=self.post)
        
        url = reverse('my-bookmarks')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)