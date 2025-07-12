 // Generate stars
        function createStars() {
            const starsContainer = document.getElementById('stars');
            const numberOfStars = 100;
            
            for (let i = 0; i < numberOfStars; i++) {
                const star = document.createElement('div');
                const isPlus = Math.random() < 0.3; // 30% chance for plus signs
                
                if (isPlus) {
                    star.className = 'star plus';
                    star.textContent = '+';
                } else {
                    star.className = 'star';
                    star.style.width = Math.random() * 3 + 1 + 'px';
                    star.style.height = star.style.width;
                }
                
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                
                starsContainer.appendChild(star);
            }
        }
        const user = "Karthik";
        const pass = "1234";
        // Handle form submission
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            if (username === user && password === pass) {
                window.location.href = 'index.html'; // Redirect to main page
            }
            else {
                alert('Invalid username or password');
            }
        });

        // Initialize stars when page loads
        createStars();

        // Add floating animation to login container
        const loginContainer = document.querySelector('.login-container');
        let floatDirection = 1;
        
        setInterval(() => {
            loginContainer.style.transform = `translate(-50%, calc(-50% + ${Math.sin(Date.now() * 0.001) * 5}px))`;
        }, 16);

