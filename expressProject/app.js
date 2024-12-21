const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('./database/products.db', (err) => {
    if (err) console.error('Error connecting to database:', err);
    else console.log('Connected to SQLite database.');
});

// Kategorileri Hesapla
const calculateCategories = (products) => {
    const categories = {};
    products.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
    });
    return categories;
};



// Ana Sayfa Rotası
app.get('/', (req, res) => {
    const query = `SELECT * FROM Products`;
    db.all(query, [], (err, products) => {
        if (err) {
            res.status(500).send('Veritabanı hatası.');
        } else {
            const categories = calculateCategories(products);
            res.render('home', { products, categories });
        }
    });
});

// Tam Sayfa Arama Rotası
app.get('/search', (req, res) => {
    const query = req.query.q ? `%${req.query.q.toLowerCase()}%` : '%';
    const sql = `
        SELECT id, ad_no, description, price, image, category, city
        FROM Products
        WHERE lower(ad_no) LIKE ? OR
              lower(description) LIKE ? OR 
              lower(city) LIKE ? OR 
              lower(category) LIKE ? OR 
              CAST(price AS TEXT) LIKE ?
    `;
    db.all(sql, [query, query, query, query, query], (err, products) => {
        if (err) {
            res.status(500).send('Arama sırasında hata oluştu.');
        } else {
            const categories = calculateCategories(products);
            const noResults = products.length === 0;
            res.render('search', { products, categories, noResults });
        }
    });
});


// Dinamik Arama API Rotası
app.get('/api/search', (req, res) => {
    const query = req.query.q ? `%${req.query.q.toLowerCase()}%` : '%';
    const sql = `
        SELECT id, ad_no, description, price, image, category, city
        FROM Products
        WHERE lower(ad_no) LIKE ? OR 
              lower(description) LIKE ? OR 
              lower(city) LIKE ? OR 
              lower(category) LIKE ? OR
              CAST(price AS TEXT) LIKE ?
    `;
    db.all(sql, [query, query, query, query, query], (err, products) => {
        if (err) {
            res.status(500).json({ error: 'Veritabanı hatası.' });
        } else {
            const categories = calculateCategories(products); 
            res.json({ products, categories });
        }
    });
});


// Kategorileriye tıklayarak arama rotası
app.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const query = 'SELECT * FROM Products WHERE lower(category) = ?';

    db.all(query, [category], (err, rows) => {
        if (err) {
            console.error('Veritabanı hatası:', err.message);
            res.status(500).send('Veritabanı hatası');
        } else {
            const allProductsQuery = 'SELECT * FROM Products'; 
            db.all(allProductsQuery, [], (error, allProducts) => {
                if (error) {
                    console.error('Veritabanı hatası:', error.message);
                    res.status(500).send('Veritabanı hatası');
                } else {
                    const categories = calculateCategories(allProducts);
                    res.render('home', {
                        products: rows,
                        categories,
                        selectedCategory: req.params.category 
                    });
                }
            });
        }
    });
});





// Detay Sayfası Rotası
app.get('/detail/:id', (req, res) => {
    const query = `SELECT * FROM Products WHERE id = ?`;
    db.get(query, [req.params.id], (err, product) => {
        if (err || !product) {
            res.status(404).send('Ürün bulunamadı!');
        } else {
            res.render('detail', { product });
        }
    });
});

// Sunucuyu Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
