// script.js - Main JavaScript for Graphic Design Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    });
    
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                mobile: document.getElementById('mobile').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.mobile || !formData.message) {
                showFormMessage('Please fill in all fields.', 'error');
                return;
            }
            
            if (!validateEmail(formData.email)) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            if (!validatePhone(formData.mobile)) {
                showFormMessage('Please enter a valid mobile number.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Google Apps Script URL (Replace with your own after deployment)
            const scriptURL = 'https://script.google.com/macros/s/AKfycbw3rA5E_Nb5mYHp_K8fPxRw6WQkLp4m5qV7Xq6Z9XH5t4vJw/exec';
            
            // Send data to Google Sheets
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(() => {
                // Show success message
                showFormMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon.', 'success');
                
                // Reset form
                contactForm.reset();
            })
            .catch(error => {
                // Show error message
                showFormMessage('Oops! Something went wrong. Please try again or contact me via WhatsApp.', 'error');
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // Gallery functionality
    if (window.location.pathname.includes('gallery.html') || window.location.pathname.endsWith('gallery.html')) {
        initGallery();
    }
    
    // Admin functionality
    if (window.location.pathname.includes('admin.html') || window.location.pathname.endsWith('admin.html')) {
        initAdminPanel();
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll animation for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.service-card, .contact-item, .stat, .hero-title, .hero-subtitle').forEach(el => {
        observer.observe(el);
    });
    
    // Form validation helper functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    }
    
    function showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            
            // Hide message after 5 seconds for success, 10 seconds for error
            const hideTime = type === 'success' ? 5000 : 10000;
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, hideTime);
        }
    }
});

// ==================== GALLERY FUNCTIONS ====================
function initGallery() {
    let galleryData = { images: [], videos: [] };
    let currentTab = 'images';
    let currentLightboxIndex = 0;
    let currentItems = [];
    
    // Load gallery data
    function loadGalleryData() {
        // Try to load from localStorage first (for admin updates)
        const savedData = localStorage.getItem('galleryData');
        
        if (savedData) {
            try {
                galleryData = JSON.parse(savedData);
                renderGallery();
            } catch (error) {
                console.error('Error parsing saved gallery data:', error);
                loadFromJSON();
            }
        } else {
            loadFromJSON();
        }
    }
    
    // Load from gallery.json file
    function loadFromJSON() {
        fetch('gallery.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                galleryData = data;
                renderGallery();
                // Save to localStorage for consistency
                localStorage.setItem('galleryData', JSON.stringify(data));
            })
            .catch(error => {
                console.error('Error loading gallery data:', error);
                const imagesGrid = document.getElementById('images-grid');
                const videosGrid = document.getElementById('videos-grid');
                
                if (imagesGrid) {
                    imagesGrid.innerHTML = 
                        '<p class="error-message" style="text-align: center; color: var(--error-color); padding: 40px;">Failed to load gallery. Please try again later.</p>';
                }
                if (videosGrid) {
                    videosGrid.innerHTML = '';
                }
            });
    }
    
    // Render gallery based on current tab
    function renderGallery() {
        const imagesGrid = document.getElementById('images-grid');
        const videosGrid = document.getElementById('videos-grid');
        
        // Clear existing content
        if (imagesGrid) imagesGrid.innerHTML = '';
        if (videosGrid) videosGrid.innerHTML = '';
        
        // Render images
        if (galleryData.images && galleryData.images.length > 0) {
            galleryData.images.forEach((item, index) => {
                const galleryItem = createGalleryItem(item, 'image', index);
                if (imagesGrid) imagesGrid.appendChild(galleryItem);
            });
        } else if (imagesGrid) {
            imagesGrid.innerHTML = '<p class="no-items" style="text-align: center; padding: 40px; color: var(--gray-color);">No images added yet.</p>';
        }
        
        // Render videos
        if (galleryData.videos && galleryData.videos.length > 0) {
            galleryData.videos.forEach((item, index) => {
                const galleryItem = createGalleryItem(item, 'video', index);
                if (videosGrid) videosGrid.appendChild(galleryItem);
            });
        } else if (videosGrid) {
            videosGrid.innerHTML = '<p class="no-items" style="text-align: center; padding: 40px; color: var(--gray-color);">No videos added yet.</p>';
        }
        
        // Initialize lightbox
        initLightbox();
    }
    
    // Create gallery item element
    function createGalleryItem(item, type, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `gallery-item ${type} item-ratio-${item.ratio.replace(':', '-')}`;
        itemDiv.setAttribute('data-index', index);
        itemDiv.setAttribute('data-type', type);
        
        let mediaElement;
        
        if (type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = item.url;
            mediaElement.alt = `Design work ${index + 1}`;
            mediaElement.loading = 'lazy';
            mediaElement.onerror = function() {
                this.src = 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                this.alt = 'Image failed to load';
            };
        } else {
            mediaElement = document.createElement('video');
            mediaElement.src = item.url;
            mediaElement.controls = false;
            mediaElement.muted = true;
            mediaElement.poster = 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
            mediaElement.onerror = function() {
                this.style.display = 'none';
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = 'padding: 40px; text-align: center; color: var(--gray-color);';
                errorMsg.textContent = 'Video failed to load';
                this.parentNode.appendChild(errorMsg);
            };
        }
        
        itemDiv.appendChild(mediaElement);
        
        // Add caption if exists
        if (item.caption) {
            const captionDiv = document.createElement('div');
            captionDiv.className = 'gallery-item-caption';
            captionDiv.textContent = item.caption;
            itemDiv.appendChild(captionDiv);
        }
        
        return itemDiv;
    }
    
    // Initialize lightbox
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxContent = document.querySelector('.lightbox-content');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        const lightboxCaption = document.querySelector('.lightbox-caption');
        
        if (!lightbox || !lightboxContent) return;
        
        // Get all gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const index = parseInt(this.getAttribute('data-index'));
                
                openLightbox(type, index);
            });
        });
        
        // Close lightbox
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        if (lightbox) {
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }
        
        // Navigation
        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', showPrevItem);
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener('click', showNextItem);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevItem();
            if (e.key === 'ArrowRight') showNextItem();
        });
        
        function openLightbox(type, index) {
            currentTab = type;
            currentLightboxIndex = index;
            currentItems = type === 'image' ? galleryData.images : galleryData.videos;
            
            updateLightboxContent();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Pause video if playing
            const video = lightboxContent.querySelector('video');
            if (video) {
                video.pause();
            }
        }
        
        function showPrevItem() {
            currentLightboxIndex = (currentLightboxIndex - 1 + currentItems.length) % currentItems.length;
            updateLightboxContent();
        }
        
        function showNextItem() {
            currentLightboxIndex = (currentLightboxIndex + 1) % currentItems.length;
            updateLightboxContent();
        }
        
        function updateLightboxContent() {
            const item = currentItems[currentLightboxIndex];
            
            if (!item) return;
            
            // Clear previous content
            lightboxContent.innerHTML = '';
            
            let mediaElement;
            
            if (currentTab === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = item.url;
                mediaElement.alt = `Design work ${currentLightboxIndex + 1}`;
                mediaElement.style.maxWidth = '100%';
                mediaElement.style.maxHeight = '90vh';
                mediaElement.style.borderRadius = '10px';
                mediaElement.style.display = 'block';
            } else {
                mediaElement = document.createElement('video');
                mediaElement.src = item.url;
                mediaElement.controls = true;
                mediaElement.autoplay = true;
                mediaElement.style.maxWidth = '100%';
                mediaElement.style.maxHeight = '90vh';
                mediaElement.style.borderRadius = '10px';
                mediaElement.style.display = 'block';
            }
            
            lightboxContent.appendChild(mediaElement);
            
            // Update caption
            if (lightboxCaption) {
                lightboxCaption.textContent = item.caption || `${currentTab === 'image' ? 'Image' : 'Video'} ${currentLightboxIndex + 1} of ${currentItems.length}`;
            }
            
            // Create and add close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'lightbox-close';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', closeLightbox);
            lightboxContent.appendChild(closeBtn);
            
            // Create and add navigation buttons
            const navDiv = document.createElement('div');
            navDiv.className = 'lightbox-nav';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'lightbox-prev';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.addEventListener('click', showPrevItem);
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'lightbox-next';
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', showNextItem);
            
            navDiv.appendChild(prevBtn);
            navDiv.appendChild(nextBtn);
            lightboxContent.appendChild(navDiv);
        }
    }
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected tab content
            const imagesGrid = document.getElementById('images-grid');
            const videosGrid = document.getElementById('videos-grid');
            
            if (imagesGrid) imagesGrid.style.display = tab === 'images' ? 'block' : 'none';
            if (videosGrid) videosGrid.style.display = tab === 'videos' ? 'block' : 'none';
            
            currentTab = tab;
        });
    });
    
    // Load gallery data on page load
    loadGalleryData();
}

// ==================== ADMIN PANEL FUNCTIONS ====================
function initAdminPanel() {
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    // Default admin credentials
    const defaultCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    // Load admin credentials from localStorage or use defaults
    function getAdminCredentials() {
        const savedCredentials = localStorage.getItem('adminCredentials');
        if (savedCredentials) {
            try {
                return JSON.parse(savedCredentials);
            } catch (error) {
                console.error('Error parsing admin credentials:', error);
                return defaultCredentials;
            }
        }
        return defaultCredentials;
    }
    
    // Save admin credentials to localStorage
    function saveAdminCredentials(credentials) {
        localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    }
    
    // Initialize admin credentials if not exists
    if (!localStorage.getItem('adminCredentials')) {
        saveAdminCredentials(defaultCredentials);
    }
    
    // Check if user is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
        loadAdminData();
    } else {
        showLogin();
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Get stored credentials
            const adminCredentials = getAdminCredentials();
            
            // Authentication
            if (username === adminCredentials.username && password === adminCredentials.password) {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                loadAdminData();
                
                // Clear login form
                loginForm.reset();
            } else {
                showAdminMessage('Invalid username or password.', 'error');
            }
        });
    }
    
    // Change Password form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Get current credentials
            const adminCredentials = getAdminCredentials();
            
            // Validate current password
            if (currentPassword !== adminCredentials.password) {
                showAdminMessage('Current password is incorrect.', 'error');
                return;
            }
            
            // Validate new password
            if (newPassword.length < 6) {
                showAdminMessage('New password must be at least 6 characters long.', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showAdminMessage('New passwords do not match.', 'error');
                return;
            }
            
            // Update credentials
            adminCredentials.password = newPassword;
            saveAdminCredentials(adminCredentials);
            
            // Show success message
            showAdminMessage('Password changed successfully!', 'success');
            
            // Clear form
            changePasswordForm.reset();
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            showLogin();
            showAdminMessage('You have been logged out successfully.', 'success');
        });
    }
    
    // Admin form submissions
    const addImageForm = document.getElementById('addImageForm');
    const addVideoForm = document.getElementById('addVideoForm');
    const deleteImageForm = document.getElementById('deleteImageForm');
    const deleteVideoForm = document.getElementById('deleteVideoForm');
    
    if (addImageForm) {
        addImageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('imageUrl').value.trim();
            const ratio = document.getElementById('imageRatio').value;
            const caption = document.getElementById('imageCaption').value.trim();
            
            if (!url || !ratio) {
                showAdminMessage('Please fill in all required fields (URL and Ratio).', 'error');
                return;
            }
            
            // Validate URL
            if (!isValidUrl(url)) {
                showAdminMessage('Please enter a valid URL for the image.', 'error');
                return;
            }
            
            // Add image to gallery data
            const galleryData = getGalleryData();
            const newImage = { url, ratio };
            
            // Add caption if provided
            if (caption !== '') {
                newImage.caption = caption.substring(0, 120); // Limit caption length
            }
            
            galleryData.images.push(newImage);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Image added successfully! It will appear in the gallery.', 'success');
            
            // Clear form
            addImageForm.reset();
        });
    }
    
    if (addVideoForm) {
        addVideoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('videoUrl').value.trim();
            const ratio = document.getElementById('videoRatio').value;
            const caption = document.getElementById('videoCaption').value.trim();
            
            if (!url || !ratio) {
                showAdminMessage('Please fill in all required fields (URL and Ratio).', 'error');
                return;
            }
            
            // Validate URL
            if (!isValidUrl(url)) {
                showAdminMessage('Please enter a valid URL for the video.', 'error');
                return;
            }
            
            // Add video to gallery data
            const galleryData = getGalleryData();
            const newVideo = { url, ratio };
            
            // Add caption if provided
            if (caption !== '') {
                newVideo.caption = caption.substring(0, 120); // Limit caption length
            }
            
            galleryData.videos.push(newVideo);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Video added successfully! It will appear in the gallery.', 'success');
            
            // Clear form
            addVideoForm.reset();
        });
    }
    
    if (deleteImageForm) {
        deleteImageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const index = document.getElementById('deleteImageSelect').value;
            
            if (!index) {
                showAdminMessage('Please select an image to delete.', 'error');
                return;
            }
            
            // Confirm deletion
            if (!confirm('Are you sure you want to delete this image?')) {
                return;
            }
            
            // Delete image from gallery data
            const galleryData = getGalleryData();
            galleryData.images.splice(index, 1);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Image deleted successfully!', 'success');
            
            // Clear form
            deleteImageForm.reset();
        });
    }
    
    if (deleteVideoForm) {
        deleteVideoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const index = document.getElementById('deleteVideoSelect').value;
            
            if (!index) {
                showAdminMessage('Please select a video to delete.', 'error');
                return;
            }
            
            // Confirm deletion
            if (!confirm('Are you sure you want to delete this video?')) {
                return;
            }
            
            // Delete video from gallery data
            const galleryData = getGalleryData();
            galleryData.videos.splice(index, 1);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Video deleted successfully!', 'success');
            
            // Clear form
            deleteVideoForm.reset();
        });
    }
    
    // Utility functions
    function showLogin() {
        const loginContainer = document.getElementById('loginContainer');
        if (loginContainer) loginContainer.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    }
    
    function showDashboard() {
        const loginContainer = document.getElementById('loginContainer');
        if (loginContainer) loginContainer.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }
    
    function getGalleryData() {
        const savedData = localStorage.getItem('galleryData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Error parsing gallery data:', error);
                return { images: [], videos: [] };
            }
        }
        
        // Return default structure if no data exists
        return { images: [], videos: [] };
    }
    
    function saveGalleryData(data) {
        localStorage.setItem('galleryData', JSON.stringify(data));
    }
    
    function loadAdminData() {
        updateDeleteDropdowns();
    }
    
    function updateDeleteDropdowns() {
        const galleryData = getGalleryData();
        
        // Update image delete dropdown
        const deleteImageSelect = document.getElementById('deleteImageSelect');
        if (deleteImageSelect) {
            deleteImageSelect.innerHTML = '<option value="">Select an image to delete</option>';
            
            galleryData.images.forEach((image, index) => {
                const option = document.createElement('option');
                option.value = index;
                const captionText = image.caption ? ` - ${image.caption.substring(0, 40)}...` : '';
                const urlText = image.url.length > 40 ? image.url.substring(0, 40) + '...' : image.url;
                option.textContent = `Image ${index + 1}: ${urlText}${captionText}`;
                deleteImageSelect.appendChild(option);
            });
        }
        
        // Update video delete dropdown
        const deleteVideoSelect = document.getElementById('deleteVideoSelect');
        if (deleteVideoSelect) {
            deleteVideoSelect.innerHTML = '<option value="">Select a video to delete</option>';
            
            galleryData.videos.forEach((video, index) => {
                const option = document.createElement('option');
                option.value = index;
                const captionText = video.caption ? ` - ${video.caption.substring(0, 40)}...` : '';
                const urlText = video.url.length > 40 ? video.url.substring(0, 40) + '...' : video.url;
                option.textContent = `Video ${index + 1}: ${urlText}${captionText}`;
                deleteVideoSelect.appendChild(option);
            });
        }
    }
    
    function showAdminMessage(message, type) {
        const messageDiv = document.getElementById('adminMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `admin-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Hide message after 3 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}
