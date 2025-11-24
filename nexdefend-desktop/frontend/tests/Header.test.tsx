import { render, screen } from '@testing-library/react'
import Header from '../components/organisms/Header'

describe('Header', () => {
  it('renders the NexDefend title', () => {
    render(<Header />)
    expect(screen.getByText('NexDefend')).toBeInTheDocument()
  })
})
