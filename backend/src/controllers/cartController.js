export const getCart = (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.json(req.session.cart);
};

export const addToCart = (req, res) => {
  const { product } = req.body;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const productCartItemId = product.cartItemId || String(product.id);
  const existingItem = req.session.cart.find((item) => (item.cartItemId || String(item.id)) === productCartItemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    req.session.cart.push({ ...product, cartItemId: productCartItemId, quantity: 1 });
  }

  res.json(req.session.cart);
};

export const updateCartItem = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const item = req.session.cart.find((cartItem) => (cartItem.cartItemId || String(cartItem.id)) === id);

  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      req.session.cart = req.session.cart.filter((cartItem) => (cartItem.cartItemId || String(cartItem.id)) !== id);
    }
  }

  res.json(req.session.cart);
};

export const removeCartItem = (req, res) => {
  const { id } = req.params;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart = req.session.cart.filter((item) => (item.cartItemId || String(item.id)) !== id);
  res.json(req.session.cart);
};

export const clearCart = (req, res) => {
  req.session.cart = [];
  res.json([]);
};
