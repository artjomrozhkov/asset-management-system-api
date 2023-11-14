const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const yamls = require('yamljs');
const swaggerDocument = yamls.load('./docs/swagger.yaml');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const assets = [
    { id: 1, number: 101, name: "Laptop", state: "New", cost: 999.99, responsible_person: "John Doe", additional_information: "High-performance laptop" },
    { id: 2, number: 102, name: "Desktop Computer", state: "Used", cost: 1299.99, responsible_person: "Jane Smith", additional_information: "Powerful desktop computer" },
    { id: 3, number: 103, name: "Monitor", state: "New", cost: 249.99, responsible_person: "Alice Johnson", additional_information: "Full HD monitor" },
    { id: 4, number: 104, name: "Printer", state: "Used", cost: 199.49, responsible_person: "Bob Wilson", additional_information: "Color laser printer" },
    { id: 5, number: 105, name: "Keyboard", state: "New", cost: 29.99, responsible_person: "Eve Brown", additional_information: "Wireless keyboard" }
];

const usersData = fs.readFileSync('users.json', 'utf-8');
const users = JSON.parse(usersData);

app.get('/assets', (req, res) => {
    res.send(assets);
});

app.get('/user-assets', (req, res) => {
    res.send(assets);
});

app.get('/assets/:id', (req, res) => {
    const assetId = parseInt(req.params.id);
    const asset = assets.find(a => a.id === assetId);

    if (!asset) {
        return res.status(404).send({ error: "Asset not found" });
    }

    res.send(asset);
});

app.post('/assets', (req, res) => {
    const { number, name, state, cost, responsible_person, additional_information } = req.body;

    if (!number || !name || !state || !cost || !responsible_person || !additional_information) {
        return res.status(400).send({ error: 'One or all params are missing' });
    }

    const newAsset = {
        id: assets.length + 1,
        number,
        name,
        state,
        cost,
        responsible_person,
        additional_information
    };

    assets.push(newAsset);

    res.status(201)
        .location(`${getBaseUrl(req)}/assets/${newAsset.id}`)
        .send(newAsset);
});

app.delete('/assets/:id', (req, res) => {
    const assetId = parseInt(req.params.id);
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex === -1) {
        return res.status(404).send({ error: "Asset not found" });
    }

    assets.splice(assetIndex, 1);

    res.status(204).send({ error: "No content" });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`);
});

function getBaseUrl(req) {
    return req.connection && req.connection.encrypted
        ? 'https' : 'http' + `://${req.headers.host}`;
}

app.put('/assets/:id', (req, res) => {
    const assetId = parseInt(req.params.id);
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex === -1) {
        return res.status(404).send({ error: "Asset not found" });
    }

    const updatedAsset = req.body;
    assets[assetIndex] = updatedAsset;

    res.send(updatedAsset);
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email address and password are required' });
    }

    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
        return res.status(401).send({ error: 'Invalid email address or password' });
    }

    console.log(user);
    return res.send({ assets: user.assets, message: 'Login successful', role: user.role });
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ error: 'Username, email, and password are required' });
    }

    const existingUser = users.find(u => u.email === email || u.username === username);

    if (existingUser) {
        return res.status(409).send({ error: 'User with this email or username already exists' });
    }

    const newUser = { username, email, password, role: 'user' }; 
    users.push(newUser);

    return res.status(201).send({ message: 'Registration successful', role: newUser.role });
});

app.get('/users', (req, res) => {
    res.send(users);
});