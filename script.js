// script.js
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
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
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
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Google Apps Script URL (you'll need to replace with your own)
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
                const formMessage = document.getElementById('formMessage');
                formMessage.textContent = 'Thank you! Your message has been sent successfully.';
                formMessage.className = 'form-message success';
                
                // Reset form
                contactForm.reset();
            })
            .catch(error => {
                // Show error message
                const formMessage = document.getElementById('formMessage');
                formMessage.textContent = 'Oops! Something went wrong. Please try again.';
                formMessage.className = 'form-message error';
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    const formMessage = document.getElementById('formMessage');
                    formMessage.style.display = 'none';
                }, 5000);
            });
        });
    }
    
    // Gallery functionality
    if (window.location.pathname.includes('gallery.html')) {
        initGallery();
    }
    
    // Admin functionality
    if (window.location.pathname.includes('admin.html')) {
        initAdminPanel();
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
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
    document.querySelectorAll('.service-card, .contact-item, .stat').forEach(el => {
        observer.observe(el);
    });
});

// Gallery Functions
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
            galleryData = JSON.parse(savedData);
            renderGallery();
        } else {
            // Load from gallery.json file
            fetch('gallery.json')
                .then(response => response.json())
                .then(data => {
                    galleryData = data;
                    renderGallery();
                })
                .catch(error => {
                    console.error('Error loading gallery data:', error);
                    document.getElementById('images-grid').innerHTML = 
                        '<p class="error-message">Failed to load gallery. Please try again later.</p>';
                });
        }
    }
    
    // Render gallery based on current tab
    function renderGallery() {
        const imagesGrid = document.getElementById('images-grid');
        const videosGrid = document.getElementById('videos-grid');
        
        // Clear existing content
        imagesGrid.innerHTML = '';
        videosGrid.innerHTML = '';
        
        // Render images
        if (galleryData.images && galleryData.images.length > 0) {
            galleryData.images.forEach((item, index) => {
                const galleryItem = createGalleryItem(item, 'image', index);
                imagesGrid.appendChild(galleryItem);
            });
        } else {
            imagesGrid.innerHTML = '<p class="no-items">No images added yet.</p>';
        }
        
        // Render videos
        if (galleryData.videos && galleryData.videos.length > 0) {
            galleryData.videos.forEach((item, index) => {
                const galleryItem = createGalleryItem(item, 'video', index);
                videosGrid.appendChild(galleryItem);
            });
        } else {
            videosGrid.innerHTML = '<p class="no-items">No videos added yet.</p>';
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
        
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = `Design work ${index + 1}`;
            img.loading = 'lazy';
            itemDiv.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = item.url;
            video.controls = false;
            video.muted = true;
            itemDiv.appendChild(video);
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
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Navigation
        lightboxPrev.addEventListener('click', showPrevItem);
        lightboxNext.addEventListener('click', showNextItem);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') closeLightbox();
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
            
            // Clear previous content
            lightboxContent.innerHTML = '';
            
            if (currentTab === 'image') {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = `Design work ${currentLightboxIndex + 1}`;
                lightboxContent.appendChild(img);
                lightboxCaption.textContent = `Image ${currentLightboxIndex + 1} of ${currentItems.length}`;
            } else {
                const video = document.createElement('video');
                video.src = item.url;
                video.controls = true;
                video.autoplay = true;
                lightboxContent.appendChild(video);
                lightboxCaption.textContent = `Video ${currentLightboxIndex + 1} of ${currentItems.length}`;
            }
            
            // Add close button
            lightboxContent.appendChild(lightboxClose);
            
            // Add navigation buttons
            const navDiv = document.createElement('div');
            navDiv.className = 'lightbox-nav';
            navDiv.innerHTML = `
                <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
            `;
            lightboxContent.appendChild(navDiv);
            
            // Re-attach event listeners
            lightboxContent.querySelector('.lightbox-prev').addEventListener('click', showPrevItem);
            lightboxContent.querySelector('.lightbox-next').addEventListener('click', showNextItem);
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
            document.getElementById('images-grid').style.display = tab === 'images' ? 'block' : 'none';
            document.getElementById('videos-grid').style.display = tab === 'videos' ? 'block' : 'none';
            
            currentTab = tab;
        });
    });
    
    // Load gallery data on page load
    loadGalleryData();
}

// Admin Panel Functions
function initAdminPanel() {
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    
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
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication (in production, this should be server-side)
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                loadAdminData();
            } else {
                alert('Invalid username or password. Try admin/admin123 for demo.');
            }
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            showLogin();
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
            
            const url = document.getElementById('imageUrl').value;
            const ratio = document.getElementById('imageRatio').value;
            
            if (!url || !ratio) {
                showAdminMessage('Please fill in all fields.', 'error');
                return;
            }
            
            // Add image to gallery data
            const galleryData = getGalleryData();
            galleryData.images.push({ url, ratio });
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Image added successfully!', 'success');
            addImageForm.reset();
        });
    }
    
    if (addVideoForm) {
        addVideoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('videoUrl').value;
            const ratio = document.getElementById('videoRatio').value;
            
            if (!url || !ratio) {
                showAdminMessage('Please fill in all fields.', 'error');
                return;
            }
            
            // Add video to gallery data
            const galleryData = getGalleryData();
            galleryData.videos.push({ url, ratio });
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Video added successfully!', 'success');
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
            
            // Delete image from gallery data
            const galleryData = getGalleryData();
            galleryData.images.splice(index, 1);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Image deleted successfully!', 'success');
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
            
            // Delete video from gallery data
            const galleryData = getGalleryData();
            galleryData.videos.splice(index, 1);
            saveGalleryData(galleryData);
            
            // Update delete dropdown
            updateDeleteDropdowns();
            
            // Show success message
            showAdminMessage('Video deleted successfully!', 'success');
            deleteVideoForm.reset();
        });
    }
    
    function showLogin() {
        if (loginForm) loginForm.parentElement.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
    }
    
    function showDashboard() {
        if (loginForm) loginForm.parentElement.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }
    
    function getGalleryData() {
        const savedData = localStorage.getItem('galleryData');
        if (savedData) {
            return JSON.parse(savedData);
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
                option.textContent = `Image ${index + 1}: ${image.url.substring(0, 50)}...`;
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
                option.textContent = `Video ${index + 1}: ${video.url.substring(0, 50)}...`;
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
}