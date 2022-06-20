import React, { useEffect, useState } from 'react';
import { api } from './api';
import { faker } from '@faker-js/faker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { state } from './state';

type Item = { id: string; name: string; photo: string; price: number; description: string };

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export default function App() {
  const user = state.useState((s) => s.user);

  const [isLogging, setIsLogging] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [itemIdBeingAdded, setItemIdBeingAdded] = useState('');
  const [cartItemsId, setCartItemsId] = useState<string[]>([]);

  useEffect(() => {
    setItems(
      Array.from({ length: 50 }).map(() => ({
        id: `item_${faker.datatype.uuid()}`,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        photo: faker.image.technics(),
        price: faker.datatype.number({ max: 1500 }),
      }))
    );
  }, []);

  function handleLoginClick() {
    setIsLogging(true);
    api
      .post('/login')
      .then((response) => {
        state.update((s) => {
          s.user = response.data;
        });
      })
      .finally(() => setIsLogging(false));
  }

  function handleAddItemClick(item: Item) {
    setItemIdBeingAdded(item.id);
    api
      .post(`/add/${item.id}`, {}, { headers: { Authorization: `Bearer ${user?.token}` } })
      .then((response) => {
        setCartItemsId(response.data.items);
      })
      .catch((error) => {
        toast(`Error ao adicionar! (${error.response.status})`, { type: 'error' });
      })
      .finally(() => setItemIdBeingAdded(''));
  }

  async function handleCopyToken() {
    await navigator.clipboard.writeText(user?.token || '');
    toast('Token Copiado', { type: 'success' });
  }

  return (
    <div>
      <h1>App</h1>
      {user ? (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>CART ID: {user.cartId}</span>
            <button onClick={handleCopyToken}>Copiar Token</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 10,
                  border: '1px solid #999',
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span>{item.name}</span>
                <img src={item.photo} alt={item.name} style={{ height: 300 }} />
                <p style={{ wordBreak: 'break-word' }}>{item.description}</p>
                <p style={{ textAlign: 'right' }}>{brlFormatter.format(item.price)}</p>
                <button
                  onClick={() => handleAddItemClick(item)}
                  disabled={itemIdBeingAdded === item.id || cartItemsId.includes(item.id)}
                >
                  {itemIdBeingAdded === item.id
                    ? 'Adicionando...'
                    : cartItemsId.includes(item.id)
                    ? 'Adicionado'
                    : 'Adicionar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={handleLoginClick}>{isLogging ? 'Logando...' : 'Logar'}</button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
