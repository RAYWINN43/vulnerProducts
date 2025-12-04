const express = require('express')
const cors = require('cors');
const app = express()
const sqlite3 = require('sqlite3').verbose();
const port = 8000

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.db'
});



app.use(cors())

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

const Product = sequelize.define('Product', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: DataTypes.STRING,
  category: DataTypes.STRING,
  rating_rate: DataTypes.FLOAT,
  rating_count: DataTypes.INTEGER,
}, { timestamps: false });


async function insertRandomUsers() {
  try {
    const urls = [1, 2, 3, 4, 5].map(() => axios.get('https://randomuser.me/api/'));
    const results = await Promise.all(urls);
    const users = results.map(r => r.data.results[0]);

    for (const u of users) {
      const username = u.login.username;
      const password = u.login.password;
      const email = u.email;

     await User.create({ username, email, password, is_admin: false });
    }
    console.log('Inserted 5 random users into database.');
  } catch (err) {
    console.error('Error inserting users:', err.message);
  }
}

async function insertProductsFromAPI() {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    const products = response.data;

    for (const product of products) {
      await Product.create({
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        rating_rate: product.rating.rate,
        rating_count: product.rating.count,
      });
    }

    console.log(`Inserted ${products.length} products into database.`);
  } catch (err) {
    console.error('Error fetching products:', err.message);
  }
}


app.get('/generate-users', async (req, res) => {
  await insertRandomUsers();
  res.json({ success: true, message: 'Generated 5 random users' });
});

app.get('/generate-products', async (req, res) => {
    await insertProductsFromAPI()
    res.send('products generated')
})


app.get('/products/search', async (req, res) => {
  
  const searchTerm = req.query.q || '';
  
  const likeTerm = `%${searchTerm}%`;

  const products = await Product.findAll({
    where: {
      [Sequelize.Op.or]: [
        { title: { [Sequelize.Op.like]: likeTerm } },
        { description: { [Sequelize.Op.like]: likeTerm } },
        { category: { [Sequelize.Op.like]: likeTerm } },
      ],
    },
  });

  res.json(products);
});

app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  res.json(product || {});
});

app.get('/', (req, res) => {
    res.send('Hello Ipssi v2!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
