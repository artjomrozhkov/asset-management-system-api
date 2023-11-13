const app = Vue.createApp({
    data() {
        return {
            isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
            currentRole: localStorage.getItem('role'),
            registrationSuccess: false,
            showLogin: false,
            registrationData: {
                username: '',
                email: '',
                password: ''
            },
            loginData: {
                email: '',
                password: ''
            },
            loginError: '',
            assets: [],
            newAsset: { number: '', name: '', state: 'New', cost: '', responsible_person: '', additional_information: '' },
            editingAsset: null,
            isEditing: false
        };
    },
    async created() {
        this.assets = await (await fetch('http://localhost:8080/assets')).json();
        this.users = await (await fetch('http://localhost:8080/users')).json();
        if (!this.isAuthenticated && window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
            window.location.href = '/login.html';
        }
    },
    methods: {
        toggleShowLogin() {
            this.showLogin = !this.showLogin;
        },
        deleteAsset: async function (id) {
            const assetToDelete = this.assets.find(asset => asset.id === id);
            if (!assetToDelete) {
                console.error('Asset was not found:', id);
                return;
            }

            try {
                await fetch(`http://localhost:8080/assets/${id}`, {
                    method: 'DELETE'
                });
                this.assets = this.assets.filter(asset => asset.id !== id);
            } catch (error) {
                console.error('Couldnt delete the asset:', error);
            }
        },
        addAsset: async function () {
            try {
                const response = await fetch('http://localhost:8080/assets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newAsset)
                });
        
                if (response.ok) {
                    const newAsset = await response.json();
                    this.assets.push(newAsset);
                    this.newAsset = { number: '', name: '', state: 'New', cost: '', responsible_person: '', additional_information: '' };
                }
            } catch (error) {
                console.error('Unable to add a new asset:', error);
            }
        },
        editAsset(asset) {
            this.editingAsset = { ...asset };
            this.isEditing = true;
        },
        cancelEdit() {
            this.editingAsset = null;
            this.isEditing = false;
        },
        async saveEdit(asset) {
            try {
                const response = await fetch(`http://localhost:8080/assets/${asset.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.editingAsset)
                });

                if (response.ok) {
                    const updatedAsset = await response.json();
                    const index = this.assets.findIndex(a => a.id === asset.id);
                    if (index !== -1) {
                        this.assets[index] = updatedAsset;
                    }

                    this.isEditing = false;
                    this.editingAsset = null;
                }
            } catch (error) {
                console.error('Unable to save edit:', error);
            }
        },
        async login() {
            console.log('Button clicked');
            try {
                const response = await fetch('http://localhost:8080/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.loginData),
                });
        
                if (response.ok) {
                    const responseData = await response.json();
                    this.isAuthenticated = true;
                    this.currentRole = responseData.role;
                    this.loginData = { email: '', password: '' };
        
                    if (this.isAuthenticated) {
                        window.location.href = 'http://localhost:8080/index.html';
                    }
                } else {
                    this.loginError = 'Login failed. Please check your email and password.';
                }
            } catch (error) {
                console.error('Login error:', error);
            }
            localStorage.setItem('isAuthenticated', this.isAuthenticated ? 'true' : 'false');
            localStorage.setItem('role', this.currentRole);
        },
        async register() {
            try {
                const response = await fetch('http://localhost:8080/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.registrationData),
                });
        
                if (response.ok) {
                    const responseData = await response.json();
                    this.registrationSuccess = true;
                    this.currentRole = responseData.role;
        
                    this.users.push({
                        username: this.registrationData.username,
                        email: this.registrationData.email,
                        password: this.registrationData.password,
                        role: responseData.role,
                    });
        
                    this.registrationData = { username: '', email: '', password: '' };
                    this.registrationError = null;
                } else {
                    this.registrationSuccess = false;
                    this.registrationError = 'Registration failed. Please check your data.';
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.registrationSuccess = false;
                this.registrationError = 'Registration failed. Please try again later.';
            }
        },
        async logout() {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('role');
            this.isAuthenticated = false;
            this.currentRole = null;
            window.location.href = 'http://localhost:8080/login.html';
        }
    }
}).mount('#app');
