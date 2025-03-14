
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Sample product data
const products = {
    featured: [
        { id: 1, name: 'Seinätaulu', price: 89.99, image: '/images/taulu.jpg', category: 'taulut' },
        { id: 2, name: 'Vaasi', price: 45.99, image: '/images/vase.jpg', category: 'vaasit' },
        { id: 3, name: 'Punottu Kori', price: 69.99, image: '/images/placeholder.jpg', category: 'makrame' },
        { id: 4, name: 'Villahuivi', price: 49.99, image: '/images/placeholder.jpg', category: 'sekalaista' },
        { id: 5, name: 'Puinen Tarjotin', price: 39.99, image: '/images/placeholder.jpg', category: 'sekalaista' },
        { id: 6, name: 'Nahkalaukku', price: 129.99, image: '/images/placeholder.jpg', category: 'sekalaista' }
    ],
    new: [
        { id: 7, name: 'Taulu', price: 159.99, image: '/images/taulu.jpg', category: 'taulut' },
        { id: 8, name: 'Vaasi', price: 39.99, image: '/images/vase.jpg', category: 'vaasit' },
        { id: 9, name: 'Makrame Ruukku', price: 79.99, image: '/images/ruukku.jpg', category: 'makrame' },
        { id: 10, name: 'Kukka-asetelma', price: 69.99, image: '/images/kukka2.jpg', category: 'sekalaista' }
    ],
    sale: [
        { id: 11, name: 'Kahvimuki', price: 24.99, image: '/images/placeholder.jpg', category: 'sekalaista' },
        { id: 12, name: 'Makrame Lampunvarjostin', price: 89.99, image: '/images/placeholder.jpg', category: 'makrame' },
        { id: 13, name: 'Makrame Säilytyskori', price: 49.99, image: '/images/placeholder.jpg', category: 'makrame' },
        { id: 14, name: 'Taulu', price: 29.99, image: '/images/placeholder.jpg', category: 'taulut' }
    ]
};

app.get('/api/products/:category', (req, res) => {
    const category = req.params.category;
    const categoryProducts = products[category] || products.featured;
    res.json(categoryProducts);
});

app.post('/api/contact', express.json(), (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Täytä kaikki pakolliset kentät' 
        });
    }
    
    // Here you would typically:
    // 1. Validate email format
    // 2. Send confirmation email
    // 3. Store in database
    // 4. Send notification to admin
    
    console.log('Contact form submission:', { name, email, phone, subject, message });
    
    // Simulate processing delay
    setTimeout(() => {
        res.json({ 
            success: true, 
            message: 'Viesti vastaanotettu' 
        });
    }, 1000);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
