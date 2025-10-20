import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

describe('App', () => {
  it('shows Vendorlution brand in the header only', () => {
    render(React.createElement(BrowserRouter, null, React.createElement(App)))
    const banner = screen.getByRole('banner')
    expect(within(banner).getByText(/Vendorlution/i)).toBeInTheDocument()
  })
})