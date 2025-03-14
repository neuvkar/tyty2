
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

 // Tuotteet
const products = {
    featured: [
        { 
            id: 1, 
            name: 'Taulu', 
            price: 15.99, 
            image: '/images/taulu.jpg', 
            category: 'taulut',
            description: 'Käsin maalattu akvarellitaulu, joka tuo kotiin rauhallista tunnelmaa. Sopii erinomaisesti olohuoneeseen tai makuuhuoneeseen.',
            dimensions: '40x60 cm',
            material: 'Akvarelli paperille'
        },
        { 
            id: 2, 
            name: 'Vaasi', 
            price: 25.99, 
            image: '/images/vase.jpg', 
            category: 'vaasit',
            description: 'Käsinmuotoiltu keramiikkavaasi skandinaavisella designilla. Jokainen vaasi on uniikki taideteos.',
            dimensions: 'Korkeus: 25cm, Leveys: 15cm',
            material: 'Keramiikka'
        },
        { 
            id: 3, 
            name: 'Punottu Kori', 
            price: 69.99, 
            image: '/images/placeholder.jpg', 
            category: 'makrame',
            description: 'Käsintehty makramee-kori luonnonmateriaaleista. Täydellinen säilytysratkaisu tai sisustuselementti.',
            dimensions: 'Halkaisija: 30cm, Korkeus: 35cm',
            material: 'Puuvilla, luonnonkuitu'
        },
        { 
            id: 4, 
            name: 'Villahuivi', 
            price: 9.99, 
            image: '/images/placeholder.jpg', 
            category: 'sekalaista',
            description: 'Pehmeä ja lämmin käsinkudottu villahuivi. Valmistettu laadukkaasta merinovillasta.',
            dimensions: '180x40 cm',
            material: '100% merinovilla'
        },
        { 
            id: 5, 
            name: 'Puinen Tarjotin', 
            price: 7.99, 
            image: '/images/placeholder.jpg', 
            category: 'sekalaista',
            description: 'Käsityönä valmistettu puinen tarjotin. Kestävä ja tyylikäs, sopii sekä käyttöön että koristeeksi.',
            dimensions: '35x25 cm',
            material: 'Käsitelty tammi'
        },
        { 
            id: 6, 
            name: 'Nahkalaukku', 
            price: 129.99, 
            image: '/images/placeholder.jpg', 
            category: 'sekalaista',
            description: 'Käsintehty nahkalaukku parhaasta italialaisesta nahasta. Ajaton design ja kestävä rakenne.',
            dimensions: '30x40x10 cm',
            material: 'Aito italialainen nahka'
        }
    ],
    new: [
        { 
            id: 7, 
            name: 'Käsin maalattu taulu', 
            price: 15.99, 
            image: '/images/taulu3.jpg', 
            category: 'taulut',
            description: 'Moderni abstrakti maalaus, joka tuo väriä ja eloa tilaan. Taiteilijan signeeraama uniikkiteos.',
            dimensions: '50x70 cm',
            material: 'Akryyli kankaalle'
        },
        { 
            id: 8, 
            name: 'Vaasi', 
            price: 19.99, 
            image: '/images/vase.jpg', 
            category: 'vaasit',
            description: 'Moderni lasitettu keramiikkavaasi. Minimalistinen muotoilu sopii monenlaiseen sisustukseen.',
            dimensions: 'Korkeus: 30cm, Leveys: 18cm',
            material: 'Lasitettu keramiikka'
        },
        { 
            id: 9, 
            name: 'Makrame Ruukku', 
            price: 13.99, 
            image: '/images/ruukku.jpg', 
            category: 'makrame',
            description: 'Käsintehty makramee-amppeli kukkaruukulle. Sisältää keraamisen ruukun.',
            dimensions: 'Kokonaispituus: 80cm',
            material: 'Puuvillanyöri, keramiikka'
        },
        { 
            id: 10, 
            name: 'Sisustys hyrrä', 
            price: 5.99, 
            image: '/images/hyrra.jpg', 
            category: 'sekalaista',
            description: 'Käsinsorvattu puinen koriste-esine. Toimii myös oikeana hyrränä.',
            dimensions: 'Halkaisija: 8cm',
            material: 'Koivu ja tammi'
        }
    ],
    sale: [
        { 
            id: 11, 
            name: 'Kahvimuki', 
            price: 13.99, 
            image: '/images/placeholder.jpg', 
            category: 'sekalaista',
            description: 'Käsinmaalattu keraaminen kahvimuki. Jokainen kappale on yksilöllinen.',
            dimensions: 'Tilavuus: 3.3dl',
            material: 'Keramiikka'
        },
        { 
            id: 12, 
            name: 'Makrame Lampunvarjostin', 
            price: 8.99, 
            image: '/images/placeholder.jpg', 
            category: 'makrame',
            description: 'Boheemi makramee-lampunvarjostin. Luo kauniita varjokuvioita.',
            dimensions: 'Halkaisija: 35cm',
            material: 'Puuvillanyöri'
        },
        { 
            id: 13, 
            name: 'Makrame Säilytyskori', 
            price: 9.99, 
            image: '/images/placeholder.jpg', 
            category: 'makrame',
            description: 'Monikäyttöinen säilytyskori makrameesta. Sopii lehtien tai pienten tavaroiden säilytykseen.',
            dimensions: '25x25x15 cm',
            material: 'Puuvillanyöri'
        },
        { 
            id: 14, 
            name: 'Taulu', 
            price: 15.99, 
            image: '/images/placeholder.jpg', 
            category: 'taulut',
            description: 'Luontoaiheinen akvarellimaalaus. Rauhallinen metsämaisema.',
            dimensions: '30x40 cm',
            material: 'Akvarelli paperille'
        }
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
