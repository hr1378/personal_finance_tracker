import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ChatWidget } from './ChatWidget'
import { api } from '../lib/api'

vi.mock('../lib/api', () => ({
  api: {
    sendChatMessage: vi.fn(),
    sendAgentMessage: vi.fn()
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
    expect(screen.getByText(/finance agent/)).toBeInTheDocument()
  })

  it('uses plain chat (no finance data) when permission is off', async () => {
    vi.mocked(api.sendChatMessage).mockResolvedValue({ reply: 'Hello!', provider: 'openai' })
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'hi' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(api.sendChatMessage).toHaveBeenCalledWith('hi', false, []))
    expect(api.sendAgentMessage).not.toHaveBeenCalled()
  })

  it('uses the agent when permission is granted and renders actions', async () => {
    vi.mocked(api.sendAgentMessage).mockResolvedValue({
      reply: 'Done!', provider: 'openai',
      actions_taken: ['Transaction created: EXPENSE $45.00']
    })
    render(<ChatWidget />)
    fireEvent.click(screen.getByLabelText('Open finance assistant'))
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByPlaceholderText('Ask a question...'), { target: { value: 'add coffee expense' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(api.sendAgentMessage).toHaveBeenCalledWith('add coffee expense', []))
    await waitFor(() => expect(screen.getByText(/Transaction created/)).toBeInTheDocument())
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
