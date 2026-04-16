// Authentication Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Simple validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            // Check if user exists
            const users = JSON.parse(localStorage.getItem('treasureFortuneUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Set logged in user
                localStorage.setItem('treasureFortuneLoggedIn', 'true');
                localStorage.setItem('treasureFortuneCurrentUser', JSON.stringify(user));
                
                // Initialize user state if not exists
                if (!localStorage.getItem('treasureFortuneState')) {
                    const initialState = {
                        user: { name: user.name, email: user.email, avatar: null },
                        wallet: 50000, // Initial wallet balance
                        savings: 0,
                        loan: { amount: 0, paid: 0 },
                        transactions: [],
                        notifications: []
                    };
                    localStorage.setItem('treasureFortuneState', JSON.stringify(initialState));
                }
                
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validation
            if (!fullName || !email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }

            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('treasureFortuneUsers') || '[]');
            if (users.find(u => u.email === email)) {
                alert('Email already registered');
                return;
            }

            // Create new user
            const newUser = {
                name: fullName,
                email: email,
                password: password
            };

            users.push(newUser);
            localStorage.setItem('treasureFortuneUsers', JSON.stringify(users));

            // Auto login
            localStorage.setItem('treasureFortuneLoggedIn', 'true');
            localStorage.setItem('treasureFortuneCurrentUser', JSON.stringify(newUser));
            
            // Initialize user state
            const initialState = {
                user: { name: fullName, email: email },
                savings: 0,
                loan: { amount: 0, paid: 0 },
                transactions: [],
                notifications: [{
                    id: Date.now(),
                    type: 'success',
                    title: 'Welcome!',
                    message: 'Your account has been created successfully',
                    time: 'Just now'
                }]
            };
            localStorage.setItem('treasureFortuneState', JSON.stringify(initialState));

            window.location.href = 'index.html';
        });
    }
});
