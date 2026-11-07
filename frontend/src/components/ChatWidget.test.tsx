import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ChatWidget } from './ChatWidget'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    sendChatMessage: vi.fn()
  }
}))

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the toggle button on mount', () => {
    render(<ChatWidget />)
    expect(screen.getByLabelText('Open finance assistant')).toBeInTheDocument()
  })

  it('opens the chat panel when clicked', () => {
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    expect(screen.getByText('Finance Assistant')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
  })

  it('shows the finance-data permission toggle', () => {
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    expect(screen.getByText('Let assistant see my finance data')).toBeInTheDocument()
  })

  it('sends a message without finance data by default', async () => {
    vi.mocked(api.sendChatMessage).mockResolvedValue({ reply: 'Hello!', provider: 'openai' })
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(api.sendChatMessage).toHaveBeenCalledWith('hi', false, []))
  })

  it('includes finance data when permission is granted', async () => {
    vi.mocked(api.sendChatMessage).mockResolvedValue({ reply: 'ok', provider: 'openai' })
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'my balance?' } })
fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(api.sendChatMessage).toHaveBeenCalledWith('my balance?', true, []))
  })

  it('displays an error when the API fails', async () => {
    vi.mocked(api.sendChatMessage).mockRejectedValue(new Error('fail'))
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'hi' } })
fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(screen.getByText(/Failed to get a response/)).toBeInTheDocument())
  })
})
