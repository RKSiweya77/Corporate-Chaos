// src/context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../utils/storage';

const CartContext = createContext();

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload || [],
      };

    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(
        item => item.id === action.payload.id && 
        item.variant === action.payload.variant
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.variant === action.payload.variant
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(
          item => !(item.id === action.payload.id && item.variant === action.payload.variant)
        ),
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id && item.variant === action.payload.variant
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
}

const initialState = {
  items: [],
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Safe notification function (won't break if notifications context isn't available)
  const safeNotify = (message, type = 'success') => {
    try {
      // Try to import and use notifications if available
      const { useNotifications } = require('../hooks/useNotifications');
      const { notifySuccess, notifyError } = useNotifications();
      
      if (type === 'success' && notifySuccess) {
        notifySuccess(message);
      } else if (type === 'error' && notifyError) {
        notifyError(message);
      }
    } catch (error) {
      // Fallback: just log to console if notifications aren't available
      console.log(`Cart ${type}:`, message);
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = storage.getJSON('cart');
    if (savedCart) {
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: savedCart });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    storage.setJSON('cart', state.items);
  }, [state.items]);

  const addToCart = (product, quantity = 1, variant = null) => {
    if (quantity <= 0) return;

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.main_image || product.image,
        quantity,
        variant,
        vendor: product.vendor,
        maxStock: product.stock,
      },
    });

    safeNotify(`Added ${product.title} to cart`, 'success');
  };

  const removeFromCart = (productId, variant = null) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id: productId, variant },
    });
  };

  const updateQuantity = (productId, quantity, variant = null) => {
    if (quantity < 0) return;

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity, variant },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getItemQuantity = (productId, variant = null) => {
    const item = state.items.find(
      item => item.id === productId && item.variant === variant
    );
    return item ? item.quantity : 0;
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getItemQuantity,
    isEmpty: state.items.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;