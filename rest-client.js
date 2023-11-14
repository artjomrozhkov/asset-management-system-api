const app = Vue.createApp({
    data() {
        return {
            isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
            currentRole: localStorage.getItem('role'),
            userAssets: localStorage.getItem('userAssets'),
            registrationSuccess: false,
            showLogin: false,
            registrationData: {
                username: '',
                email: '',
                password: ''
            },
            loginData: {
                assets: [],
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
        this.users = await (await fetch('http://localhost:8080/users')).json();
        if (!this.isAuthenticated && window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
            window.location.href = '/login.html';
        }

        if (this.currentRole == 'admin') {
            this.assets = await (await fetch('http://localhost:8080/assets')).json();
        } else {
            this.assets = JSON.parse(this.userAssets);
        }

        console.log(this.userAssets);
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
                    localStorage.setItem('userAssets', JSON.stringify(responseData.assets));
        
                    if (this.isAuthenticated) {
                        alert('Login successful! You are now logged in.');
                        window.location.href = 'http://localhost:8080/index.html';
                    }
                } else {
                    alert('Login failed. Please check your email and password.');
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
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...this.registrationData, role: 'user' })
                });
        
                if (response.ok) {
                    const responseData = await response.json();
        
                    this.users.push({ username: this.registrationData.username, email: this.registrationData.email });
                    
                    this.registrationSuccess = true;
                    alert('Registration successful!');
                    window.location.href = 'http://localhost:8080/login.html';
                    this.currentRole = responseData.role;
                    this.registrationData = { username: '', email: '', password: '' };
                } else {
                    const responseData = await response.json();
                    alert(`Registration failed. ${responseData.error}`);
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.registrationError = 'Registration failed. Please try again later.';
            }
            localStorage.setItem('isAuthenticated', this.isAuthenticated ? 'true' : 'false');
            localStorage.setItem('role', this.currentRole);
        },
        async logout() {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('role');
            this.isAuthenticated = false;
            this.currentRole = null;
            window.location.href = 'http://localhost:8080/login.html';
        },
        moveRow(asset, offset) {
            const index = this.assets.findIndex(a => a.id === asset.id);
            const newIndex = index + offset;
    
            if (newIndex >= 0 && newIndex < this.assets.length) {
                const movedAsset = this.assets.splice(index, 1)[0];
                this.assets.splice(newIndex, 0, movedAsset);
            }
        },
    }
}).mount('#app');
