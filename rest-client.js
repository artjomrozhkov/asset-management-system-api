const app = Vue.createApp({
    data() {
        return {
            assets: [],
            newAsset: { number: '', name: '', state: 'New', cost: '', responsible_person: '', additional_information: '' },
            editingAsset: null,
            isEditing: false
        };
    },
    async created() {
        this.assets = await (await fetch('http://localhost:8080/assets')).json();
    },
    methods: {
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
                    this.assets.push(newAsset); // Добавить актив в конец массива
                    this.newAsset = { number: '', name: '', state: 'New', cost: '', responsible_person: '', additional_information: '' }; // Очистить поля ввода
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
        }
    }
}).mount('#app');
