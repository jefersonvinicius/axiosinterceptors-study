import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const SECRET = '123';

const app = express();
app.use(cors());
app.use(express.json());

const carts = {};
const cartsTokens = {};

function validateToken(request, response, next) {
  const token = request.headers['authorization']?.split(' ')?.[1] || '';
  try {
    jwt.verify(token, SECRET);
    const decoded = jwt.decode(token);
    response.locals.cartId = decoded.cartId;
    next();
  } catch (error) {
    return response.status(401).json({ message: error.message });
  }
}

app.post('/add/:itemId', validateToken, (request, response) => {
  const { itemId } = request.params;
  const cartId = response.locals.cartId;

  if (!cartId) return response.status(400).json({ message: 'cartId not provided' });
  if (!itemId) return response.status(400).json({ message: 'itemId not provided' });

  carts[cartId].push(itemId);

  return response.json({ items: carts[cartId] });
});

const createToken = (cartId) => jwt.sign({ cartId }, SECRET, { expiresIn: '30s' });

app.post('/login', (request, response) => {
  const cartId = `cart_${crypto.randomUUID()}`;
  carts[cartId] = [];
  const token = createToken(cartId);
  cartsTokens[token] = cartId;
  return response.json({ token, cartId });
});

app.post('/renew', (request, response) => {
  const token = request.body.token;
  const cartId = cartsTokens[token];
  const newToken = createToken(cartId);
  return response.json({ token: newToken });
});

app.listen(3333, () => {
  console.log('Serving at http://localhost:3333');
});
